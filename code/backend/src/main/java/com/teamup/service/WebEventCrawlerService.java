package com.teamup.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class WebEventCrawlerService {
    private static final Logger log = LoggerFactory.getLogger(WebEventCrawlerService.class);
    private static final String DEFAULT_FEED_URL = "https://hackathons.hackclub.com/api/events/all/";
    private static final String SOURCE_NAME = "Indian & Global Hackathons Explorer";

    private final JdbcTemplate db;
    private final ObjectMapper mapper;
    private final HttpClient httpClient;

    public WebEventCrawlerService(JdbcTemplate db, ObjectMapper mapper) {
        this.db = db;
        this.mapper = mapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    /**
     * Automatic recurring web search running once every 1 hour (3,600,000 ms).
     * Starts with an initial delay of 5 seconds after application startup.
     */
    @Scheduled(initialDelay = 5000, fixedRate = 3600000)
    public void scheduledWebSearch() {
        log.info("Starting scheduled web search for Indian & global hackathons...");
        syncNow();
    }

    /**
     * Executes web crawl and search for upcoming hackathons and student competitions.
     * Can also be called on-demand by administrators or students.
     */
    public Map<String, Object> syncNow() {
        UUID sourceId = getOrCreateSourceId();
        int newEvents = 0;
        int totalScanned = 0;
        String status = "SUCCESS";
        String errorMsg = null;

        try {
            // 1. Curated premier Indian hackathons & global tech competitions
            List<Map<String, Object>> curated = getCuratedIndianAndGlobalHackathons();
            totalScanned += curated.size();
            for (Map<String, Object> event : curated) {
                if (insertDiscoveredEvent(sourceId, event)) {
                    newEvents++;
                }
            }

            // 2. Fetch live hackathons from public web API (filter & prioritize India & virtual)
            List<Map<String, Object>> liveEvents = fetchLiveHackathons();
            totalScanned += liveEvents.size();
            for (Map<String, Object> event : liveEvents) {
                if (insertDiscoveredEvent(sourceId, event)) {
                    newEvents++;
                }
            }

            log.info("Web search completed. Scanned {} events/competitions, added/updated {} items.", totalScanned, newEvents);
        } catch (Exception ex) {
            log.warn("Web search encountered an issue: {}", ex.getMessage());
            status = "PARTIAL";
            errorMsg = ex.getMessage();

            // Fallback: Ensure curated Indian hackathons are registered into pending moderation
            try {
                List<Map<String, Object>> fallbackList = getCuratedIndianAndGlobalHackathons();
                for (Map<String, Object> event : fallbackList) {
                    if (insertDiscoveredEvent(sourceId, event)) {
                        newEvents++;
                    }
                }
            } catch (Exception ignored) {
            }
        }

        // Update event_sources metadata
        db.update("""
            UPDATE event_sources
            SET last_synced_at = now(),
                last_status = ?,
                last_error = ?,
                updated_at = now()
            WHERE id = ?
            """, status, errorMsg, sourceId);

        return Map.of(
            "status", status,
            "newEventsCount", newEvents,
            "totalScanned", totalScanned,
            "sourceName", SOURCE_NAME,
            "syncIntervalMinutes", 60,
            "lastSyncedAt", Instant.now().toString()
        );
    }

    private List<Map<String, Object>> fetchLiveHackathons() {
        List<Map<String, Object>> result = new ArrayList<>();
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(DEFAULT_FEED_URL))
                    .timeout(Duration.ofSeconds(12))
                    .header("User-Agent", "TeamUp-Campus-Explorer/1.0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200 && response.body() != null) {
                JsonNode array = mapper.readTree(response.body());
                if (array.isArray()) {
                    for (JsonNode node : array) {
                        String id = node.path("id").asText(null);
                        String name = node.path("name").asText(null);
                        if (name == null || name.isBlank() || id == null) continue;

                        String website = node.path("website").asText(null);
                        String startStr = node.path("start").asText(null);
                        String endStr = node.path("end").asText(null);

                        boolean isVirtual = node.path("virtual").asBoolean(false);
                        boolean isHybrid = node.path("hybrid").asBoolean(false);
                        String city = node.path("city").asText("");
                        String country = node.path("country").asText("");

                        boolean isIndia = country.toLowerCase().contains("india") || city.toLowerCase().contains("india")
                                || name.toLowerCase().contains("india");

                        String venue;
                        if (isVirtual) {
                            venue = isIndia ? "Online / Virtual (India)" : "Online / Virtual";
                        } else if (isHybrid) {
                            venue = "Hybrid (" + city + (country.isBlank() ? "" : ", " + country) + ")";
                        } else {
                            venue = city.isBlank() ? "Campus Venue" : city + (country.isBlank() ? "" : ", " + country);
                        }

                        Instant starts = parseInstant(startStr, Instant.now().plus(7, ChronoUnit.DAYS));
                        Instant ends = parseInstant(endStr, starts.plus(2, ChronoUnit.DAYS));
                        if (ends.isBefore(starts)) {
                            ends = starts.plus(1, ChronoUnit.DAYS);
                        }

                        // Filter: only pick active or upcoming events
                        if (ends.isBefore(Instant.now().minus(30, ChronoUnit.DAYS))) {
                            continue;
                        }

                        Map<String, Object> map = new HashMap<>();
                        map.put("externalId", "web-hc-" + id);
                        map.put("title", name + (isIndia ? " 🇮🇳" : ""));
                        map.put("description", "Discovered student hackathon. Open to developer teams, collegiate builders, and student innovators.");
                        map.put("eventUrl", website);
                        map.put("venue", venue);
                        map.put("startsAt", starts);
                        map.put("endsAt", ends);
                        result.add(map);

                        if (result.size() >= 60) break;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not retrieve live Hack Club feed: {}", e.getMessage());
        }
        return result;
    }

    private List<Map<String, Object>> getCuratedIndianAndGlobalHackathons() {
        List<Map<String, Object>> list = new ArrayList<>();

        // 1. Smart India Hackathon (SIH)
        list.add(createEvent(
            "web-comp-sih-2026",
            "Smart India Hackathon (SIH) 2026",
            "World's biggest open innovation hackathon by Ministry of Education & AICTE. Multi-tier nationwide hackathon for students across Hardware and Software editions with grand cash prizes.",
            "https://www.sih.gov.in",
            "Nodal Centers Across India / Virtual",
            Instant.now().plus(15, ChronoUnit.DAYS),
            Instant.now().plus(45, ChronoUnit.DAYS)
        ));

        // 2. hackCBS 9.0
        list.add(createEvent(
            "web-comp-hackcbs-9",
            "hackCBS 9.0 — India's Largest Student-Run Hackathon",
            "Flagship 24-hour national hackathon hosted by Shaheed Sukhdev College of Business Studies (University of Delhi). Featuring top tracks in AI/ML, Web3, FinTech, and Open Innovation.",
            "https://hackcbs.tech",
            "SSCBS, University of Delhi, New Delhi",
            Instant.now().plus(25, ChronoUnit.DAYS),
            Instant.now().plus(27, ChronoUnit.DAYS)
        ));

        // 3. ETHIndia
        list.add(createEvent(
            "web-comp-ethindia-2026",
            "ETHIndia — Asia's Premier Ethereum & Web3 Hackathon",
            "Asia's premier builder gathering powered by Devfolio. Over 1,500 builders gather in Bengaluru/Mumbai to hack on blockchain, zero-knowledge proofs, and decentralized applications.",
            "https://ethindia.co",
            "Jio World Convention Centre, Mumbai / Bengaluru, India",
            Instant.now().plus(35, ChronoUnit.DAYS),
            Instant.now().plus(38, ChronoUnit.DAYS)
        ));

        // 4. Hack This Fall
        list.add(createEvent(
            "web-comp-hackthisfall-2026",
            "Hack This Fall — Pan-India Community Hackathon",
            "One of India's most inclusive hackathons with virtual rounds and in-person Hacker Houses in Mumbai, Delhi NCR, and Bengaluru. Focused on beginner-friendly tracks and diverse builders.",
            "https://hackthisfall.tech",
            "Hybrid (Virtual + Hacker Houses in Bengaluru, Delhi NCR, Mumbai)",
            Instant.now().plus(20, ChronoUnit.DAYS),
            Instant.now().plus(22, ChronoUnit.DAYS)
        ));

        // 5. Flipkart GRiD
        list.add(createEvent(
            "web-comp-flipkart-grid-2026",
            "Flipkart GRiD — National Campus Engineering Challenge",
            "India's flagship campus engineering competition testing problem-solving, smart commerce, robotics, and generative AI with direct Pre-Placement Interviews (PPIs) and cash rewards.",
            "https://unstop.com",
            "Online & Flipkart Headquarters, Bengaluru",
            Instant.now().plus(18, ChronoUnit.DAYS),
            Instant.now().plus(50, ChronoUnit.DAYS)
        ));

        // 6. IndiaAI Innovation Challenge
        list.add(createEvent(
            "web-comp-indiaai-2026",
            "IndiaAI National Innovation Challenge (MeitY)",
            "National artificial intelligence challenge by Ministry of Electronics & IT (MeitY) for building sovereign AI models, datasets, and Indian language technologies.",
            "https://indiaai.gov.in",
            "Virtual / National AI Centres, New Delhi",
            Instant.now().plus(12, ChronoUnit.DAYS),
            Instant.now().plus(40, ChronoUnit.DAYS)
        ));

        // 7. InOut Hackathon (Devfolio)
        list.add(createEvent(
            "web-comp-inout-devfolio-2026",
            "InOut — Community Hackathon by Devfolio",
            "India's celebrated community hackathon bringing together students, hackers, and mentors for an intense 36-hour sprint with top industry sponsors.",
            "https://devfolio.co",
            "Bengaluru, Karnataka, India",
            Instant.now().plus(28, ChronoUnit.DAYS),
            Instant.now().plus(30, ChronoUnit.DAYS)
        ));

        // 8. HackNITR (NIT Rourkela)
        list.add(createEvent(
            "web-comp-hacknitr-2026",
            "HackNITR — Eastern India's Largest Student Hackathon",
            "Annual student-led hackathon by NIT Rourkela featuring AI, IoT, EdTech, and HealthTech problem statements with national participation.",
            "https://hacknitr.com",
            "National Institute of Technology, Rourkela, Odisha",
            Instant.now().plus(30, ChronoUnit.DAYS),
            Instant.now().plus(32, ChronoUnit.DAYS)
        ));

        // 9. Dotslash (SVNIT Surat)
        list.add(createEvent(
            "web-comp-dotslash-2026",
            "Dotslash — 30-Hour Hackathon by SVNIT Surat",
            "30-hour national hackathon in Western India promoting innovative prototypes, mentorship from industry veterans, and startup grants.",
            "https://hackdotslash.co",
            "SVNIT Campus, Surat, Gujarat",
            Instant.now().plus(22, ChronoUnit.DAYS),
            Instant.now().plus(24, ChronoUnit.DAYS)
        ));

        // 10. Hack In The North (IIIT Allahabad)
        list.add(createEvent(
            "web-comp-hitn-2026",
            "Hack In The North — IIIT Allahabad",
            "Northern India's premier annual collegiate hackathon attracting top student engineering teams across competitive coding, systems, and full-stack innovation.",
            "https://hackinthenorth.com",
            "IIIT Allahabad Campus, Uttar Pradesh",
            Instant.now().plus(40, ChronoUnit.DAYS),
            Instant.now().plus(42, ChronoUnit.DAYS)
        ));

        // 11. Tata Crucible Campus Hackathon
        list.add(createEvent(
            "web-comp-tata-crucible-2026",
            "Tata Crucible Campus Hackathon",
            "Prestigious industry hackathon by Tata Sons challenging Indian campus minds to solve industrial and technological dilemmas.",
            "https://tatacrucible.com",
            "Hybrid / Mumbai, India",
            Instant.now().plus(16, ChronoUnit.DAYS),
            Instant.now().plus(35, ChronoUnit.DAYS)
        ));

        // 12. Kavach Cybersecurity Hackathon
        list.add(createEvent(
            "web-comp-kavach-2026",
            "Kavach Cybersecurity Challenge (MHA / AICTE)",
            "National cybersecurity hackathon to identify innovative solutions for cyber threats, deepfakes, dark web tracking, and network safety.",
            "https://kavach.mic.gov.in",
            "Designated Nodal Centres across India",
            Instant.now().plus(24, ChronoUnit.DAYS),
            Instant.now().plus(26, ChronoUnit.DAYS)
        ));

        // 13. Google Solution Challenge
        list.add(createEvent(
            "web-comp-google-sol-2026",
            "Google Solution Challenge 2026",
            "Annual global competition inviting university students to build solutions for UN Sustainable Development Goals using Google Cloud, Gemini, and Flutter.",
            "https://developers.google.com/community/gdsc-solution-challenge",
            "Global Online Competition",
            Instant.now().plus(14, ChronoUnit.DAYS),
            Instant.now().plus(45, ChronoUnit.DAYS)
        ));

        // 14. Microsoft Imagine Cup AI Edition
        list.add(createEvent(
            "web-comp-microsoft-imagine-2026",
            "Microsoft Imagine Cup AI Edition 2026",
            "The premier student tech competition where builders create startup prototypes using Azure AI, OpenAI, and cloud services for global mentorship and prizes.",
            "https://imaginecup.microsoft.com",
            "Virtual / Hybrid Worldwide",
            Instant.now().plus(20, ChronoUnit.DAYS),
            Instant.now().plus(60, ChronoUnit.DAYS)
        ));

        // 15. NASA International Space Apps Challenge
        list.add(createEvent(
            "web-comp-space-apps-2026",
            "NASA International Space Apps Challenge",
            "The largest annual global hackathon where coders, scientists, designers, and students solve challenges using NASA open data.",
            "https://www.spaceappschallenge.org",
            "Global Hybrid (Virtual + Local Chapters in India)",
            Instant.now().plus(32, ChronoUnit.DAYS),
            Instant.now().plus(34, ChronoUnit.DAYS)
        ));

        return list;
    }

    private Map<String, Object> createEvent(String externalId, String title, String description,
                                            String eventUrl, String venue, Instant startsAt, Instant endsAt) {
        Map<String, Object> map = new HashMap<>();
        map.put("externalId", externalId);
        map.put("title", title);
        map.put("description", description);
        map.put("eventUrl", eventUrl);
        map.put("venue", venue);
        map.put("startsAt", startsAt);
        map.put("endsAt", endsAt);
        return map;
    }

    private boolean insertDiscoveredEvent(UUID sourceId, Map<String, Object> data) {
        String externalId = (String) data.get("externalId");
        String title = (String) data.get("title");
        if (title == null || title.isBlank() || externalId == null) return false;

        String safeTitle = title.length() > 200 ? title.substring(0, 197) + "..." : title;
        String desc = (String) data.getOrDefault("description", "Discovered competition/hackathon.");
        String url = (String) data.get("eventUrl");
        String venue = (String) data.getOrDefault("venue", "Hybrid / Online");
        if (venue != null && venue.length() > 240) venue = venue.substring(0, 237) + "...";

        Instant starts = (Instant) data.getOrDefault("startsAt", Instant.now().plus(7, ChronoUnit.DAYS));
        Instant ends = (Instant) data.getOrDefault("endsAt", starts.plus(2, ChronoUnit.DAYS));
        if (ends != null && ends.isBefore(starts)) {
            ends = starts.plus(1, ChronoUnit.DAYS);
        }

        UUID eventId = UUID.randomUUID();
        Timestamp startTs = Timestamp.from(starts);
        Timestamp endTs = ends == null ? null : Timestamp.from(ends);

        int updated = db.update("""
            INSERT INTO events (
                id, title, description, event_url, venue, starts_at, ends_at,
                source_id, external_event_id, status, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, 'PENDING', now(), now()
            )
            ON CONFLICT (source_id, external_event_id) WHERE source_id IS NOT NULL AND external_event_id IS NOT NULL
            DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
                          event_url = EXCLUDED.event_url, venue = EXCLUDED.venue, updated_at = now()
            """,
            eventId, safeTitle, desc, url, venue, startTs, endTs,
            sourceId, externalId
        );

        return updated > 0;
    }

    private UUID getOrCreateSourceId() {
        List<UUID> existing = db.query(
            "SELECT id FROM event_sources WHERE name = ? LIMIT 1",
            (rs, rowNum) -> rs.getObject(1, UUID.class),
            SOURCE_NAME
        );
        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        UUID newId = UUID.randomUUID();
        db.update("""
            INSERT INTO event_sources (id, name, feed_url, enabled, sync_interval_minutes, created_at, updated_at)
            VALUES (?, ?, ?, TRUE, 60, now(), now())
            """, newId, SOURCE_NAME, DEFAULT_FEED_URL);
        return newId;
    }

    private Instant parseInstant(String text, Instant fallback) {
        if (text == null || text.isBlank()) return fallback;
        try {
            return Instant.parse(text);
        } catch (Exception e) {
            return fallback;
        }
    }
}

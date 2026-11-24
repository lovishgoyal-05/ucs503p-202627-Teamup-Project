package com.teamup.service;
import com.teamup.repository.TeamUpRepository;
import com.teamup.config.TeamUpProperties;
import com.teamup.dto.request.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.teamup.security.TokenService;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@Service public class TeamUpService {
    private final TeamUpRepository repo;
    private final JdbcTemplate db;
    private final TeamUpProperties properties;
    private final TokenService tokens;
    private final WebEventCrawlerService crawlerService;
    public TeamUpService(TeamUpRepository repo, TeamUpProperties properties, TokenService tokens, WebEventCrawlerService crawlerService) {
        this.repo=repo;
        this.db=repo.jdbc();
        this.properties=properties;
        this.tokens=tokens;
        this.crawlerService=crawlerService;
    }
    public UUID userId(Authentication a) {
        if(a==null||a.getName()==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        try {
            return UUID.fromString(a.getName());
        } catch(Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
    }
    public Map<String, Object> me(Authentication a) {
        return repo.currentUser(userId(a));
    }
    public List<Map<String, Object>> events(int page,int size,String q) {
        return repo.events(Math.max(0,page),Math.min(properties.getMaxPageSize(),Math.max(1,size)),q);
    }
    public List<Map<String, Object>> myEvents(Authentication a) {
        UUID user=userId(a);
        return db.queryForList("""
                SELECT e.id, e.title, e.description, e.event_url AS "eventUrl",
                       e.venue, e.starts_at AS "startsAt", e.ends_at AS "endsAt",
                       e.status, u.full_name AS "organizerName"
                FROM events e
                LEFT JOIN users u ON u.id = e.organizer_id
                WHERE e.organizer_id = ?
                ORDER BY e.created_at DESC
                """, user);
    }
    public Map<String, Object> becomeOrganizer(Authentication a) {
        UUID user=userId(a);
        db.update("insert into user_roles(user_id, role_id) select ?, id from roles where code='ORGANIZER' on conflict do nothing", user);
        return Map.of("success", true, "role", "ORGANIZER");
    }
    public Map<String, Object> demoLogin(String role) {
        String r = (role == null || role.isBlank()) ? "STUDENT" : role.toUpperCase();
        if ("ADMIN".equals(r)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin accounts cannot be generated via demo login");
        }
        String email = "ORGANIZER".equals(r) ? "organizer@teamup.edu" : "student@teamup.edu";
        String name = "ORGANIZER".equals(r) ? "Campus Organizer" : "Demo Student";
        UUID id = db.query("select id from users where lower(email)=lower(?)", rs -> rs.next() ? rs.getObject(1, UUID.class) : null, email);
        if (id == null) {
            id = UUID.randomUUID();
            db.update("insert into users(id, email, full_name, avatar_url) values(?,?,?,?)", id, email, name, "https://api.dicebear.com/7.x/bottts/svg?seed=" + email);
            db.update("insert into student_profiles(user_id) values(?)", id);
        }
        db.update("insert into user_roles(user_id, role_id) select ?, id from roles where code='STUDENT' on conflict do nothing", id);
        if ("ORGANIZER".equals(r)) {
            db.update("insert into user_roles(user_id, role_id) select ?, id from roles where code='ORGANIZER' on conflict do nothing", id);
        }
        String token = tokens.accessToken(id, email);
        return Map.of("accessToken", token, "email", email, "fullName", name, "role", r);
    }
    public Map<String, Object> createEvent(Authentication a,EventCreateRequest in) {
        UUID user=userId(a);
        if(!repo.hasRole(user,"ORGANIZER")&&!repo.hasRole(user,"ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Organizer role required. Activate Organizer status in your profile or click 'Become an Organizer'.");
        }
        if(in.endsAt()!=null&&in.endsAt().isBefore(in.startsAt()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Event end must be after start");
        UUID id=UUID.randomUUID();
        String status = repo.hasRole(user, "ADMIN") ? "APPROVED" : "PENDING";
        java.sql.Timestamp starts = java.sql.Timestamp.from(in.startsAt());
        java.sql.Timestamp ends = in.endsAt() == null ? null : java.sql.Timestamp.from(in.endsAt());
        db.update("insert into events(id,title,description,event_url,venue,starts_at,ends_at,organizer_id,status) values(?,?,?,?,?,?,?,?,?)",id,in.title(),in.description(),in.eventUrl(),in.venue(),starts,ends,user,status);
        return Map.of("id",id,"status",status,"title",in.title());
    }
    public Map<String, Object> reviewEvent(Authentication a,UUID id,EventReviewRequest in) {
        UUID admin=userId(a);
        requireAdmin(admin);
        if(!Set.of("APPROVED","REJECTED").contains(in.status()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Status must be APPROVED or REJECTED");
        int n=db.update("update events set status=?,reviewed_by=?,reviewed_at=now(),updated_at=now() where id=? and status='PENDING'",in.status(),admin,id);
        if(n==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Pending event not found");
        return Map.of("id",id,"status",in.status());
    }
    public List<Map<String, Object>> posts(int page,int size) {
        return repo.posts(Math.max(0,page),Math.min(properties.getMaxPageSize(),Math.max(1,size)));
    }
    public Map<String, Object> createPost(Authentication a,PostCreateRequest in) {
        UUID user=userId(a), id=UUID.randomUUID();
        String type=in.postType()==null?"PROJECT":in.postType().toUpperCase();
        if(!Set.of("PROJECT","HACKATHON","STUDY_GROUP","OTHER").contains(type))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid post type");
        db.update("insert into posts(id,creator_id,title,description,post_type) values(?,?,?,?,?)",id,user,in.title(),in.description(),type);
        if(in.skillIds()!=null)for(UUID skill:in.skillIds())db.update("insert into post_skills(post_id,skill_id,required) values(?,?,?) on conflict do nothing",id,skill,in.requiredSkillIds()!=null&&in.requiredSkillIds().contains(skill));
        return Map.of("id",id,"status","OPEN");
    }
    public Map<String, Object> requestJoin(Authentication a,UUID postId,JoinRequestCreateRequest in) {
        UUID user=userId(a);
        Boolean open=db.query("select status='OPEN' from posts where id=?",rs->rs.next()?rs.getBoolean(1):null,postId);
        if(!Boolean.TRUE.equals(open))throw new ResponseStatusException(HttpStatus.CONFLICT,"Post is not open");
        Boolean self=db.queryForObject("select creator_id=? from posts where id=?",Boolean.class,user,postId);
        if(Boolean.TRUE.equals(self))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Cannot request your own post");
        UUID id=UUID.randomUUID();
        try {
            db.update("insert into join_requests(id,post_id,requester_id,message) values(?,?,?,?)",id,postId,user,in==null?null:in.message());
        } catch(Exception e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"A pending request already exists");
        }
        return Map.of("id",id,"status","PENDING");
    }
    @Transactional public Map<String, Object> reviewJoin(Authentication a,UUID id,JoinRequestReviewRequest in) {
        UUID reviewer=userId(a);
        Map<String, Object> r=db.query("select jr.post_id,jr.requester_id,jr.status,p.creator_id,p.status post_status from join_requests jr join posts p on p.id=jr.post_id where jr.id=? for update of jr,p",rs->{if(!rs.next())return null;Map<String,Object> m=new HashMap<>();m.put("postId",rs.getObject("post_id",UUID.class));m.put("requester",rs.getObject("requester_id",UUID.class));m.put("status",rs.getString("status"));m.put("creator",rs.getObject("creator_id",UUID.class));m.put("postStatus",rs.getString("post_status"));return m;},id);
        if(r==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        UUID post=(UUID)r.get("postId"), creator=(UUID)r.get("creator"), requester=(UUID)r.get("requester");
        boolean allowed=reviewer.equals(creator)||repo.hasRole(reviewer,"ADMIN")||Boolean.TRUE.equals(db.queryForObject("select exists(select 1 from teams t join team_members tm on tm.team_id=t.id where t.source_post_id=? and tm.user_id=? and tm.member_role='LEADER' and tm.left_at is null)",Boolean.class,post,reviewer));
        if(!allowed)throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if(!"PENDING".equals(r.get("status")))throw new ResponseStatusException(HttpStatus.CONFLICT,"Request already reviewed");
        if(!Set.of("ACCEPTED","REJECTED").contains(in.status()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        if("ACCEPTED".equals(in.status())) {
            if(!"OPEN".equals(r.get("postStatus")))throw new ResponseStatusException(HttpStatus.CONFLICT,"Post closed");
            UUID team=db.query("select id from teams where source_post_id=?",rs->rs.next()?rs.getObject(1,UUID.class):null,post);
            if(team==null) {
                team=UUID.randomUUID();
                String title=db.queryForObject("select title from posts where id=?",String.class,post);
                db.update("insert into teams(id,name,created_by,source_post_id) values(?,?,?,?)",team,title,creator,post);
                db.update("insert into team_members(id,team_id,user_id,member_role) values(?,?,?,'LEADER')",UUID.randomUUID(),team,creator);
            }
            Boolean member=db.queryForObject("select exists(select 1 from team_members where team_id=? and user_id=? and left_at is null)",Boolean.class,team,requester);
            if(!Boolean.TRUE.equals(member))db.update("insert into team_members(id,team_id,user_id,member_role) values(?,?,?,'MEMBER')",UUID.randomUUID(),team,requester);
        }
        db.update("update join_requests set status=?,reviewed_by=?,reviewed_at=now() where id=?",in.status(),reviewer,id);
        db.update("insert into notifications(id,user_id,type,title,body,target_url) values(?,?,?,?,?,?)",UUID.randomUUID(),requester,"JOIN_REQUEST_DECISION","Join request "+in.status().toLowerCase(),"Your request was "+in.status().toLowerCase()+".","/teams");
        return Map.of("id",id,"status",in.status());
    }
    public List<Map<String, Object>> teams(Authentication a) {
        return db.queryForList("select t.id,t.name,t.status,t.created_at as \"createdAt\",tm.member_role as \"myRole\" from teams t join team_members tm on tm.team_id=t.id where tm.user_id=? and tm.left_at is null order by t.created_at desc",userId(a));
    }
    @Transactional public Map<String, Object> transfer(Authentication a,UUID team,LeadershipTransferRequest in) {
        UUID actor=userId(a);
        if(!Boolean.TRUE.equals(db.queryForObject("select exists(select 1 from team_members where team_id=? and user_id=? and member_role='LEADER' and left_at is null)",Boolean.class,team,actor))&&!repo.hasRole(actor,"ADMIN"))throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if(!Boolean.TRUE.equals(db.queryForObject("select exists(select 1 from team_members where team_id=? and user_id=? and left_at is null)",Boolean.class,team,in.userId())))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Target must be active member");
        db.update("update team_members set member_role='MEMBER' where team_id=? and member_role='LEADER' and left_at is null",team);
        db.update("update team_members set member_role='LEADER' where team_id=? and user_id=? and left_at is null",team,in.userId());
        return Map.of("teamId",team,"leaderId",in.userId());
    }
    public List<Map<String, Object>> notifications(Authentication a) {
        return db.queryForList("select id,type,title,body,target_url as \"targetUrl\",read_at as \"readAt\",created_at as \"createdAt\" from notifications where user_id=? order by created_at desc limit ?",userId(a),properties.getNotificationLimit());
    }
    public boolean readNotification(Authentication a,UUID id) {
        return db.update("update notifications set read_at=now() where id=? and user_id=?",id,userId(a))>0;
    }
    public List<Map<String, Object>> skills() {
        return db.queryForList("select id,name from skills order by name");
    }
    public Map<String, Object> addSkill(Authentication a,SkillUpsertRequest in) {
        UUID user=userId(a);
        String name=in.name().trim(), norm=name.toLowerCase(Locale.ROOT), prof=in.proficiency()==null?"INTERMEDIATE":in.proficiency().toUpperCase();
        if(!Set.of("BEGINNER","INTERMEDIATE","ADVANCED").contains(prof))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid proficiency");
        UUID skill=db.query("select id from skills where normalized_name=?",rs->rs.next()?rs.getObject(1,UUID.class):null,norm);
        if(skill==null) {
            skill=UUID.randomUUID();
            try {
                db.update("insert into skills(id,name,normalized_name) values(?,?,?)",skill,name,norm);
            } catch(Exception ex) {
                skill=db.queryForObject("select id from skills where normalized_name=?",UUID.class,norm);
            }
        }
        db.update("insert into user_skills(user_id,skill_id,proficiency) values(?,?,?) on conflict(user_id,skill_id) do update set proficiency=excluded.proficiency",user,skill,prof);
        return Map.of("id",skill,"name",name,"proficiency",prof);
    }
    public List<Map<String, Object>> matching(Authentication a) {
        UUID user=userId(a);
        return db.queryForList("select p.id,p.title,case when count(ps.skill_id) filter(where ps.required)>0 then round(100.0*count(ps.skill_id) filter(where ps.required and us.skill_id is not null)/count(ps.skill_id) filter(where ps.required)) else null end as \"matchScore\",count(ps.skill_id) filter(where ps.required and us.skill_id is not null) as \"matchedRequired\",count(ps.skill_id) filter(where ps.required) as \"totalRequired\" from posts p join post_skills ps on ps.post_id=p.id left join user_skills us on us.user_id=? and us.skill_id=ps.skill_id where p.status='OPEN' group by p.id,p.title,p.created_at order by p.created_at desc",user);
    }
    public Map<String, Object> applyToEvent(Authentication a, UUID eventId, Map<String, String> in) {
        UUID user = userId(a);
        Boolean exists = db.queryForObject("select exists(select 1 from events where id=? and status='APPROVED')", Boolean.class, eventId);
        if (!Boolean.TRUE.equals(exists)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found or not approved");
        }
        UUID id = UUID.randomUUID();
        String message = in != null ? in.get("message") : null;
        String skills = in != null ? in.get("skills") : null;
        try {
            db.update("insert into event_applications(id, event_id, applicant_id, message, skills, status) values(?,?,?,?,?,'PENDING')",
                id, eventId, user, message, skills);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied to this event");
        }
        return Map.of("id", id, "status", "PENDING", "eventId", eventId);
    }

    public List<Map<String, Object>> getEventApplications(Authentication a, UUID eventId) {
        UUID user = userId(a);
        Boolean allowed = repo.hasRole(user, "ADMIN") || Boolean.TRUE.equals(
            db.queryForObject("select exists(select 1 from events where id=? and organizer_id=?)", Boolean.class, eventId, user)
        );
        if (!Boolean.TRUE.equals(allowed)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the event organizer or an admin can view applications");
        }
        return db.queryForList("""
            SELECT ea.id, ea.event_id AS "eventId", e.title AS "eventTitle",
                   ea.applicant_id AS "applicantId", u.full_name AS "applicantName",
                   u.email AS "applicantEmail", u.avatar_url AS "applicantAvatar",
                   ea.message, ea.skills, ea.status, ea.created_at AS "createdAt"
            FROM event_applications ea
            JOIN events e ON e.id = ea.event_id
            JOIN users u ON u.id = ea.applicant_id
            WHERE ea.event_id = ?
            ORDER BY ea.created_at DESC
            """, eventId);
    }

    public List<Map<String, Object>> getOrganizerApplications(Authentication a) {
        UUID user = userId(a);
        return db.queryForList("""
            SELECT ea.id, ea.event_id AS "eventId", e.title AS "eventTitle",
                   ea.applicant_id AS "applicantId", u.full_name AS "applicantName",
                   u.email AS "applicantEmail", u.avatar_url AS "applicantAvatar",
                   ea.message, ea.skills, ea.status, ea.created_at AS "createdAt"
            FROM event_applications ea
            JOIN events e ON e.id = ea.event_id
            JOIN users u ON u.id = ea.applicant_id
            WHERE e.organizer_id = ?
            ORDER BY ea.created_at DESC
            """, user);
    }

    public Map<String, Object> reviewEventApplication(Authentication a, UUID applicationId, Map<String, String> in) {
        UUID reviewer = userId(a);
        String status = in != null ? in.get("status") : null;
        if (!Set.of("ACCEPTED", "REJECTED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be ACCEPTED or REJECTED");
        }
        Map<String, Object> app = db.query("select ea.id, ea.applicant_id, e.organizer_id, e.title from event_applications ea join events e on e.id=ea.event_id where ea.id=?", rs -> {
            if (!rs.next()) return null;
            Map<String, Object> m = new HashMap<>();
            m.put("id", rs.getObject("id", UUID.class));
            m.put("applicantId", rs.getObject("applicant_id", UUID.class));
            m.put("organizerId", rs.getObject("organizer_id", UUID.class));
            m.put("eventTitle", rs.getString("title"));
            return m;
        }, applicationId);
        if (app == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
        UUID organizerId = (UUID) app.get("organizerId");
        if (!reviewer.equals(organizerId) && !repo.hasRole(reviewer, "ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the event organizer or an admin can review applications");
        }
        db.update("update event_applications set status=?, reviewed_at=now() where id=?", status, applicationId);
        UUID applicantId = (UUID) app.get("applicantId");
        String eventTitle = (String) app.get("eventTitle");
        db.update("insert into notifications(id, user_id, type, title, body, target_url) values(?,?,?,?,?,?)",
            UUID.randomUUID(), applicantId, "EVENT_APPLICATION_DECISION", "Event Application " + status,
            "Your application for \"" + eventTitle + "\" was " + status.toLowerCase() + ".", "/events");
        return Map.of("id", applicationId, "status", status);
    }

    public List<Map<String, Object>> getMyEventApplications(Authentication a) {
        UUID user = userId(a);
        return db.queryForList("""
            SELECT ea.id, ea.event_id AS "eventId", e.title AS "eventTitle",
                   e.venue, e.starts_at AS "startsAt", ea.status, ea.created_at AS "createdAt"
            FROM event_applications ea
            JOIN events e ON e.id = ea.event_id
            WHERE ea.applicant_id = ?
            ORDER BY ea.created_at DESC
            """, user);
    }

    public Map<String, Object> adminLogin(Map<String, String> body) {
        String email = body != null && body.get("email") != null ? body.get("email").trim().toLowerCase() : "";
        String passcode = body != null && body.get("passcode") != null ? body.get("passcode") : "";
        if (email.isBlank() || passcode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and passcode are required");
        }
        String expectedPasscode = System.getenv("ADMIN_PASSCODE");
        if (expectedPasscode == null || expectedPasscode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ADMIN_PASSCODE is not configured on the server");
        }
        if (!expectedPasscode.equals(passcode)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials or passcode");
        }
        UUID id = db.query("select id from users where lower(email)=lower(?)", rs -> rs.next() ? rs.getObject(1, UUID.class) : null, email);
        if (id == null) {
            id = UUID.randomUUID();
            db.update("insert into users(id, email, full_name, avatar_url) values(?,?,?,?)", id, email, "Administrator", "https://api.dicebear.com/7.x/bottts/svg?seed=" + email);
            db.update("insert into student_profiles(user_id) values(?)", id);
        }
        db.update("insert into user_roles(user_id, role_id) select ?, id from roles where code in ('ADMIN', 'ORGANIZER', 'STUDENT') on conflict do nothing", id);
        String token = tokens.accessToken(id, email);
        return Map.of("accessToken", token, "email", email, "fullName", "Administrator", "role", "ADMIN");
    }

    public List<Map<String, Object>> getPendingEvents(Authentication a) {
        requireAdmin(userId(a));
        return db.queryForList("""
            SELECT e.id, e.title, e.description, e.event_url AS "eventUrl",
                   e.venue, e.starts_at AS "startsAt", e.ends_at AS "endsAt",
                   e.status, e.source_id AS "sourceId",
                   s.name AS "sourceName",
                   u.full_name AS "organizerName", u.email AS "organizerEmail"
            FROM events e
            LEFT JOIN users u ON u.id = e.organizer_id
            LEFT JOIN event_sources s ON s.id = e.source_id
            WHERE e.status = 'PENDING'
            ORDER BY e.created_at DESC
            """);
    }

    public List<Map<String, Object>> getAdminUsers(Authentication a) {
        requireAdmin(userId(a));
        return db.queryForList("""
            SELECT u.id, u.email, u.full_name AS "fullName", u.is_active AS "active",
                   u.created_at AS "createdAt",
                   string_agg(r.code, ', ') AS "roles"
            FROM users u
            LEFT JOIN user_roles ur ON ur.user_id = u.id
            LEFT JOIN roles r ON r.id = ur.role_id
            GROUP BY u.id, u.email, u.full_name, u.is_active, u.created_at
            ORDER BY u.created_at DESC
            LIMIT 1000
            """);
    }

    public long countApprovedEvents(String q) {
        if (q == null || q.isBlank()) {
            return repo.countWhere("events", "APPROVED");
        }
        Long count = db.queryForObject("SELECT count(*) FROM events WHERE status = 'APPROVED' AND lower(title) LIKE ?", Long.class, "%" + q.toLowerCase() + "%");
        return count == null ? 0 : count;
    }

    public Map<String, Object> dashboard(Authentication a) {
        UUID id=userId(a);
        requireAdmin(id);
        return Map.of("users",repo.count("users"),"approvedEvents",repo.countWhere("events","APPROVED"),"pendingEvents",repo.countWhere("events","PENDING"),"openPosts",repo.countWhere("posts","OPEN"),"teams",repo.count("teams"),"pendingJoinRequests",repo.countWhere("join_requests","PENDING"));
    }
    public Map<String, Object> syncWebEvents(Authentication a) {
        requireAdmin(userId(a));
        return crawlerService.syncNow();
    }
    private void requireAdmin(UUID id) {
        if(!repo.hasRole(id,"ADMIN"))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Admin role required");
    }
}

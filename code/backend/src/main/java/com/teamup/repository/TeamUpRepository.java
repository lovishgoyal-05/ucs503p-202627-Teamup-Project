package com.teamup.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/** All SQL access is centralized here; services own business policy. */
@Repository
public class TeamUpRepository {
    private final JdbcTemplate db;

    public TeamUpRepository(JdbcTemplate db) {
        this.db = db;
    }

    public boolean hasRole(UUID userId, String roleCode) {
        return Boolean.TRUE.equals(db.queryForObject("""
                SELECT EXISTS (
                    SELECT 1
                    FROM user_roles ur
                    JOIN roles r ON r.id = ur.role_id
                    WHERE ur.user_id = ? AND r.code = ?
                )
                """, Boolean.class, userId, roleCode));
    }

    /** Uses a join so account data and profile data are returned in one round trip. */
    public Map<String, Object> currentUser(UUID id) {
        Map<String, Object> row = db.queryForMap("""
                SELECT u.id, u.email, u.full_name AS "fullName",
                       u.avatar_url AS "avatarUrl", u.is_active AS active,
                       p.bio, p.college_name AS "collegeName",
                       p.department, p.year_of_study AS "yearOfStudy",
                       p.github_url AS "githubUrl"
                FROM users u
                LEFT JOIN student_profiles p ON p.user_id = u.id
                WHERE u.id = ?
                """, id);
        List<String> roles = db.queryForList("""
                SELECT r.code
                FROM roles r
                JOIN user_roles ur ON ur.role_id = r.id
                WHERE ur.user_id = ?
                """, String.class, id);
        Map<String, Object> res = new java.util.HashMap<>(row);
        res.put("roles", roles);
        return res;
    }

    public List<Map<String, Object>> events(int page, int size, String q) {
        String term = q == null || q.isBlank() ? "%" : "%" + q.toLowerCase() + "%";
        return db.queryForList("""
                SELECT e.id, e.title, e.description, e.event_url AS "eventUrl",
                       e.venue, e.starts_at AS "startsAt", e.ends_at AS "endsAt",
                       u.full_name AS "organizerName"
                FROM events e
                LEFT JOIN users u ON u.id = e.organizer_id
                WHERE e.status = 'APPROVED' AND lower(e.title) LIKE ?
                ORDER BY e.starts_at ASC
                LIMIT ? OFFSET ?
                """, term, size, page * size);
    }

    public List<Map<String, Object>> posts(int page, int size) {
        return db.queryForList("""
                SELECT p.id, p.title, p.description, p.post_type AS "postType",
                       p.created_at AS "createdAt", u.full_name AS "creatorName",
                       COALESCE(string_agg(s.name, ', ' ORDER BY s.name), '') AS skills
                FROM posts p
                JOIN users u ON u.id = p.creator_id
                LEFT JOIN post_skills ps ON ps.post_id = p.id
                LEFT JOIN skills s ON s.id = ps.skill_id
                WHERE p.status = 'OPEN'
                GROUP BY p.id, u.full_name
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
                """, size, page * size);
    }

    /** A normalized join query returns active team members and their display names. */
    public List<Map<String, Object>> teamMembers(UUID teamId) {
        return db.queryForList("""
                SELECT tm.team_id AS "teamId", tm.user_id AS "userId",
                       u.full_name AS "fullName", tm.member_role AS "memberRole",
                       tm.joined_at AS "joinedAt"
                FROM team_members tm
                JOIN users u ON u.id = tm.user_id
                WHERE tm.team_id = ? AND tm.left_at IS NULL
                ORDER BY tm.joined_at ASC, u.created_at ASC
                """, teamId);
    }

    public List<Map<String, Object>> userSkills(UUID userId) {
        return db.queryForList("""
                SELECT s.id, s.name, us.proficiency, us.created_at AS "addedAt"
                FROM user_skills us
                JOIN skills s ON s.id = us.skill_id
                WHERE us.user_id = ?
                ORDER BY s.name
                """, userId);
    }

    public long count(String table) {
        if (!Set.of("users", "events", "posts", "teams", "join_requests").contains(table)) {
            throw new IllegalArgumentException("Unsupported table");
        }
        return db.queryForObject("SELECT count(*) FROM " + table, Long.class);
    }

    public long countWhere(String table, String status) {
        if (!Set.of("events", "posts", "join_requests").contains(table)) {
            throw new IllegalArgumentException("Unsupported table");
        }
        return db.queryForObject("SELECT count(*) FROM " + table + " WHERE status = ?", Long.class, status);
    }

    public JdbcTemplate jdbc() {
        return db;
    }
}

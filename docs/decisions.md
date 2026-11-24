# TeamUp decisions baseline
- React + Vite, Java 21 + Spring Boot, PostgreSQL 17, REST/JSON, Flyway.
- Google OIDC is the only login method. TeamUp access JWTs expire in 15 minutes; opaque refresh sessions should rotate on use, have 7-day inactivity expiry and 30-day absolute lifetime. Multiple sessions allowed. Logout/session-family revocation is a security requirement.
- Roles: STUDENT, ORGANIZER, ADMIN. First Admin manually provisioned; Admin grants Organizer.
- Any-college student registration; college is profile metadata.
- Event submissions and imported feed items require Admin approval; approved-event edits do not require reapproval; cancellation preserves record.
- Recruitment post acceptance creates at most one team; creator starts as leader/member; team size has no fixed maximum; students may be in multiple active teams.
- Chat, task board, and GitHub API integration are out of initial release. Manual GitHub URL field supported. Notifications and basic Admin counts included.
- Skill match base = matched required / total required * 100; optional skills can add up to 10 points; cap 100. If no usable skill data, omit score and explain.
- API prefix `/api/v1`; default page size 20, max 100; backend validation authoritative.
- Current roles only; no dedicated role history table. Security audit events should be logged.
- Unresolved: hosting providers, exact feed providers/parser formats, optional-only score normalization, notification matrix, and some recruitment-post edit/withdraw/reapply policies.


## Database and application logic boundary
- Business workflows and policies are implemented in Java services/configuration.
- PostgreSQL stores durable data and enforces relational integrity.
- The schema uses normalized lookup/junction tables; role names are stored in `roles`, assigned through `user_roles`.
- Repository SQL uses joins to retrieve related records in bounded queries; controllers do not execute SQL.

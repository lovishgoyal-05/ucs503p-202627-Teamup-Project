# TeamUp — Student Collaboration Platform

TeamUp helps students discover approved events, publish recruitment posts, find collaborators using skill matching, request to join teams, and receive in-app notifications. Organizers submit events; Admins approve submissions and imported feed events.

## Stack
- React + Vite frontend
- Java 21, Spring Boot 3.4, Spring Security OAuth2 Client, Spring Data JPA
- PostgreSQL 17 + Flyway
- Google OpenID Connect sign-in; TeamUp issues its own 15-minute access JWT and opaque rotating refresh token in a Secure/HttpOnly cookie

## Quick start
1. Copy `.env.example` to `.env` and set Google OAuth client ID/secret.
2. Start PostgreSQL: `docker compose up -d db`.
3. Start backend: `cd backend && mvn spring-boot:run`.
4. Start frontend: `cd frontend && npm install && npm run dev`.
5. Visit `http://localhost:5173`.

For local HTTP development set `COOKIE_SECURE=false`. Configure the Google OAuth redirect URI as `http://localhost:8080/login/oauth2/code/google`. Google OAuth consent screen and credentials must be configured by the project owner. No client secret is included in this repository.

## First Admin
Create the first Admin manually in PostgreSQL after the first successful Google sign-in:
```sql
INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id
FROM users u CROSS JOIN roles r
WHERE u.email = 'admin@example.com' AND r.code = 'ADMIN'
ON CONFLICT DO NOTHING;
```
Replace the email with the verified account email. Never commit real secrets.

## Included modules
- Google OIDC sign-in and application JWT issuance
- Profile and skill management
- Public approved-event browsing, Organizer event submission, Admin review
- Recruitment posts and required/optional skills
- Join requests; atomic first-acceptance team creation
- Team membership and leader transfer/archive basics
- Skill matching, in-app notifications, audit events
- Admin dashboard counts and event-feed source configuration baseline
- Flyway schema, OpenAPI, Docker Compose, UML/ER source diagrams, and test scaffolding

## Important scope and limitations
This is a complete **project starter/MVP implementation**, not a claim of production certification. Configure OAuth credentials, review cookie/CORS settings for the actual deployment, run migrations and tests, and validate feed-provider formats before public deployment. External-feed synchronization is scaffolded around configurable sources; provider-specific parsers are intentionally pluggable. Security and lifecycle integration tests should be run before release.

## API
All application APIs use `/api/v1`. Swagger UI is available at `/swagger-ui.html` when the backend is running. Public endpoints include published event and open recruitment-post discovery. Protected endpoints require TeamUp access authentication.

## Architecture and diagrams

The intended backend separation is **Controller → Service → Repository → PostgreSQL**, with domain entities/models mapped to the schema. See `docs/diagrams/README.md` for the data-flow diagrams (DFD Level 0 and Level 1), conceptual entity-relationship diagram (ERD), architecture diagram, and UML use-case source. The diagram files are editable sources; compare them with Flyway migrations and implementation before considering them verified.

## Backend layering (MSR + DTO)

The backend is organized by responsibility:

- `model/`: domain projection records for users, events, recruitment posts, teams, memberships and join requests.
- `repository/`: database access through Spring `JdbcTemplate`; all SQL is isolated from controllers.
- `service/`: authorization checks, business rules and transactional workflows.
- `controller/`: HTTP routing and request validation only.
- `dto/request/`: validated API request records.
- `dto/response/`: API response records; persistence entities/projections should not be exposed directly.
- `dto/mapper/`: mapping between persistence projections and response DTOs.

Flyway owns the physical schema under `backend/src/main/resources/db/migration`. Do not edit an already-applied migration in a shared database; add a new versioned migration instead.

## Run locally

Requirements: Java 21, Maven 3.9+, Node.js 20+, npm, Docker Desktop, and Google OAuth credentials.

1. Copy `.env.example` to `.env` and set Google OAuth credentials.
2. Start PostgreSQL: `docker compose up -d db`.
3. Start API: `cd backend && mvn spring-boot:run`.
4. Start UI in another terminal: `cd frontend && npm install && npm run dev`.
5. Browse `http://localhost:5173`; API docs are at `http://localhost:8080/swagger-ui.html`.

## Validation status

The archive has been checked for ZIP integrity. This environment does not have Maven installed, so a full Spring Boot compile/test run could not be performed here. Treat this as a development baseline until `mvn test` and the end-to-end journeys are run in an environment with dependencies available. Google OAuth credentials and callback/origin configuration are required for sign-in.


## Configuration versus database

See [`docs/configuration-vs-database.md`](docs/configuration-vs-database.md) for which policies can be changed through configuration/Java and which durable structures are managed by Flyway migrations.

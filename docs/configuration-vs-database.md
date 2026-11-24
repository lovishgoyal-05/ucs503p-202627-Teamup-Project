# Configuration vs Database Responsibilities

TeamUp follows a deliberate rule: **changeable policy and algorithms live in Java/configuration; durable facts and integrity constraints live in PostgreSQL**. This reduces unnecessary migrations without pretending database schema never evolves.

## Keep in Java / configuration

- OAuth/JWT integration flow, token issuance and verification, refresh rotation and reuse handling.
- Session durations (`ACCESS_TOKEN_MINUTES`, `REFRESH_INACTIVITY_DAYS`, `ABSOLUTE_SESSION_DAYS`).
- Cookie name/security, allowed frontend origin, pagination defaults/limits, notification result limit.
- Default role assigned to new accounts, authorization decisions, event approval workflow, join-request workflow, team leadership rules, matching/scoring algorithms.
- Validation messages, sorting defaults, and API behavior.

Environment variables are bound by `TeamUpProperties`; code should read these values rather than embedding policy constants in controllers. Algorithmic rules should be implemented in services and unit-tested.

## Keep in PostgreSQL

- User/account data, Google subject identifiers, roles assigned to each user, profiles, skills, events, recruitment posts, join requests, teams, team membership history, refresh-token hashes, notifications and audit events.
- Foreign keys, unique indexes, and constraints needed to protect data integrity under concurrency (e.g. one team per recruitment post, no duplicate active membership, at most one active team leader, no duplicate pending join request).
- Timestamps and lifecycle state of actual records.

## What belongs in a migration

A migration is required when the *data structure or invariant* changes: adding a column/table, changing a foreign key, changing an index, or changing a database constraint. Use a new Flyway migration; never edit an already-applied migration in a shared environment.

Changing the duration of a refresh session or the matching formula should not require a database migration. Changing the structure of team membership history should. Database constraints intentionally duplicate a small amount of validation where necessary: Java explains the business rule; PostgreSQL is the final guard against race conditions and corrupt data.

## Current configuration values

See `.env.example` for tunable policy defaults. Keep real credentials and production secrets out of source control. Defaults are for local development and must be reviewed for deployment.

## Important limitation

This separation is a design target and incremental refactor. Before production, run Maven tests, integration tests against PostgreSQL, OAuth callback tests, refresh-token reuse tests, authorization tests, and concurrent team-creation tests.


## Normalization and joined reads

The schema uses normalized relational tables rather than storing repeated profile, skill, role, membership, or event-source data in a single wide table. Roles are represented by a `roles` lookup table and assigned through `user_roles`; adding a role is data/configuration work rather than editing a hard-coded role CHECK constraint. Many-to-many relationships use junction tables (`user_roles`, `user_skills`, `post_skills`).

Retrieval that needs related data uses SQL joins in the repository layer. Examples include `currentUser` (users + student_profiles), `events` (events + organizer users), `posts` (posts + creator + post_skills + skills), `teamMembers` (team_members + users), and `userSkills` (user_skills + skills). This avoids N+1 queries and keeps SQL out of controllers/services. Services decide *what the application should do*; repositories decide *how relational data is retrieved or persisted*.

PostgreSQL is not being removed: it remains the durable source of truth for accounts and application data. Java should own changeable workflows, policies, scoring, validation messages, and authorization decisions. The database should keep stable data relationships, foreign keys, uniqueness, and concurrency safeguards. A normalized schema still evolves through Flyway migrations when the actual data structure changes.

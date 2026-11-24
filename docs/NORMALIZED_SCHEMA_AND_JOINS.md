# Normalized Schema and Join Strategy

## Principle
Java owns changeable behavior. PostgreSQL stores persistent facts and protects relational integrity. Do not try to implement a database as Java collections: data must survive restarts and concurrent users need a shared source of truth.

## Normalized entities
- `users` stores account identity/profile basics; `student_profiles` stores optional extended profile attributes.
- `roles` defines role codes; `user_roles` maps users to roles (many-to-many).
- `oauth_accounts` maps a TeamUp user to a stable external provider subject.
- `skills` is the canonical skill catalogue; `user_skills` and `post_skills` are junction tables.
- `posts`, `teams`, `team_members`, and `join_requests` represent recruitment and membership separately, preserving history.
- `event_sources` stores feed configuration; `events` references its source.

## Retrieval joins
The repository includes joined queries for:
1. Current user plus optional student profile (`users LEFT JOIN student_profiles`).
2. Public event plus organizer (`events LEFT JOIN users`).
3. Open post plus creator and skill names (`posts JOIN users LEFT JOIN post_skills LEFT JOIN skills`).
4. Active team member names (`team_members JOIN users`).
5. A user's skill details (`user_skills JOIN skills`).
6. Role checks (`user_roles JOIN roles`).

Use `LEFT JOIN` for optional related records, `JOIN` where the related record is required, and aggregate related one-to-many values when returning one row per parent. Keep pagination at the parent-row level and test aggregate queries when data grows.

## What stays in Java
- Skill matching formula and tie-breaking
- Role authorization policy and lifecycle transitions
- Token/session behavior and expiry policy
- Validation rules and user-facing errors
- Event and join-request approval workflows

## What stays in PostgreSQL
- Persistent user, event, post, team, skill and session records
- Foreign keys, primary keys, unique indexes, and constraints against invalid concurrent states
- Normalized relationships and membership history

## Schema changes
Flyway migrations are versioned and append-only after they have been applied to shared environments. Changing a business rule should not require a migration; changing a table/relationship/integrity invariant may require one.

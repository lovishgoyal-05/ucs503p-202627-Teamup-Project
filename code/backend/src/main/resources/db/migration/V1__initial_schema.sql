CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE users (
 id UUID PRIMARY KEY,
    email VARCHAR(320) NOT NULL,
    full_name VARCHAR(160) NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CONSTRAINT uq_users_email UNIQUE (email)
);
-- Lookup table keeps role definitions normalized; adding a role does not require changing a CHECK constraint.
CREATE TABLE roles (
    id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(160) NOT NULL
);
INSERT INTO roles(code, description) VALUES
    ('STUDENT', 'Standard student account'),
    ('ORGANIZER', 'May submit and manage events'),
    ('ADMIN', 'May moderate and administer TeamUp');

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id SMALLINT NOT NULL REFERENCES roles(id),
    PRIMARY KEY(user_id, role_id)
);
CREATE TABLE oauth_accounts (id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(30) NOT NULL CHECK(provider='GOOGLE'),
    provider_subject VARCHAR(255) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(provider,provider_subject));
CREATE TABLE refresh_tokens (id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    absolute_expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    consumed_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    replaced_by UUID REFERENCES refresh_tokens(id));
CREATE INDEX ix_refresh_user ON refresh_tokens(user_id);
CREATE INDEX ix_refresh_family ON refresh_tokens(family_id);
CREATE TABLE student_profiles (user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    college_name VARCHAR(180),
    department VARCHAR(120), year_of_study SMALLINT CHECK(year_of_study BETWEEN 1 AND 10),
    github_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE skills (id UUID PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    normalized_name VARCHAR(80) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE user_skills (user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    proficiency VARCHAR(20) CHECK(proficiency IN ('BEGINNER','INTERMEDIATE','ADVANCED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(user_id,skill_id));
CREATE TABLE events (id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_url TEXT,
    venue VARCHAR(240),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    organizer_id UUID REFERENCES users(id),
    source_id UUID,
    external_event_id VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK(status IN ('DRAFT','PENDING','APPROVED','REJECTED','CANCELLED')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), CHECK(ends_at IS NULL OR ends_at >= starts_at));
CREATE INDEX ix_events_public ON events(status,starts_at);
CREATE UNIQUE INDEX uq_external_event ON events(source_id,external_event_id) WHERE source_id IS NOT NULL AND external_event_id IS NOT NULL;
CREATE TABLE event_sources (id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    feed_url TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sync_interval_minutes INTEGER NOT NULL DEFAULT 60 CHECK(sync_interval_minutes BETWEEN 5 AND 10080),
    last_synced_at TIMESTAMPTZ,
    last_status VARCHAR(30),
    last_error TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE events ADD CONSTRAINT fk_events_source FOREIGN KEY(source_id) REFERENCES event_sources(id);
CREATE TABLE posts (id UUID PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    post_type VARCHAR(30) NOT NULL DEFAULT 'PROJECT' CHECK(post_type IN ('PROJECT','HACKATHON','STUDY_GROUP','OTHER')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','CLOSED','ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ);
CREATE INDEX ix_posts_discovery ON posts(status,created_at DESC);
CREATE TABLE post_skills (post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id),
    required BOOLEAN NOT NULL DEFAULT TRUE, PRIMARY KEY(post_id,skill_id));
CREATE TABLE teams (id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    source_post_id UUID UNIQUE REFERENCES posts(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ,
    archive_reason TEXT);
CREATE TABLE team_members (id UUID PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id),
    user_id UUID NOT NULL REFERENCES users(id),
    member_role VARCHAR(20) NOT NULL CHECK(member_role IN ('LEADER','MEMBER')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    left_at TIMESTAMPTZ);
CREATE UNIQUE INDEX uq_active_team_member ON team_members(team_id,user_id) WHERE left_at IS NULL;
CREATE UNIQUE INDEX uq_active_team_leader ON team_members(team_id) WHERE left_at IS NULL AND member_role='LEADER';
CREATE INDEX ix_team_members_user ON team_members(user_id,left_at);
CREATE TABLE join_requests (id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id),
    requester_id UUID NOT NULL REFERENCES users(id),
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','ACCEPTED','REJECTED','WITHDRAWN')),
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ);
CREATE UNIQUE INDEX uq_pending_join_request ON join_requests(post_id,requester_id) WHERE status='PENDING';
CREATE INDEX ix_join_requests_review ON join_requests(post_id,status,created_at);
CREATE TABLE notifications (id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(60) NOT NULL,
    title VARCHAR(180) NOT NULL,
    body TEXT NOT NULL,
    target_url TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX ix_notifications_user ON notifications(user_id,created_at DESC);
CREATE TABLE audit_events (id UUID PRIMARY KEY,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(80),
    entity_id UUID,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX ix_audit_created ON audit_events(created_at DESC);

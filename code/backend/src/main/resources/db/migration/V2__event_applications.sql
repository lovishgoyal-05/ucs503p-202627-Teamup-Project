CREATE TABLE event_applications (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    skills TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    UNIQUE(event_id, applicant_id)
);

CREATE INDEX ix_event_applications_event ON event_applications(event_id, created_at DESC);
CREATE INDEX ix_event_applications_user ON event_applications(applicant_id);

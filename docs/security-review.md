# Security checklist before production
- [ ] Review and test opaque refresh-token rotation, family reuse detection, inactivity and absolute expiry, secure cookie, logout and global revocation endpoints; implementation is included but requires integration/concurrency tests.
- [ ] Move OAuth callback access token from URL query to a one-time code exchange; query tokens can leak into history/referrers. This starter callback is for local MVP demonstration only.
- [ ] Derive user authorities from `user_roles` in JWT filter instead of assigning `ROLE_STUDENT` to all bearer tokens; enforce object-level authorization on every protected resource.
- [ ] Add CSRF protection suitable for refresh cookies and configure SameSite, Secure, domain, HTTPS and CORS for deployment.
- [ ] Add user deactivation, deletion/anonymization, post closure pending-request rejection, leadership succession and empty-team archival service flows.
- [ ] Implement optional-skill scoring with confirmed normalization and show matched/missing required skills.
- [ ] Implement feed adapters, bounded retries/backoff, source-level dedupe and Admin UI.
- [ ] Add rate limiting, login/security audit coverage, dependency scanning, backup/restore test and secrets management.
- [ ] Add integration tests for auth, role/object access, transactions/concurrency, migrations, feeds and critical journeys.

Do not expose this starter publicly before the checklist items applicable to your deployment are completed.

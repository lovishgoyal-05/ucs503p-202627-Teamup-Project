# Journal — Lovish Goyal

**Roll No:** 1024030372
**Role:** Frontend & Backend Developer
**Project:** TeamUp — Skill-Based Hackathon Discovery & Team-Formation Platform

---

## Week 1

### Summary
Worked across both frontend and backend: scaffolded the Team Collaboration feature end-to-end (API + UI) and began wiring integration conventions between the two layers.

### Work Done
- Backend: Added Express routes for join requests and basic team chat message storage.
- Frontend: Built the Team Collaboration UI components (join-request button, chat panel, task/deadline board layout).
- Set up a shared `.env` convention between frontend and backend so API base URLs stay consistent across local and staging environments.

### Technical Notes (MWE)
```js
// Minimal working example: join request route
router.post("/api/teams/:teamId/join", async (req, res) => {
  const { userId } = req.body;
  // add userId to the team's pending requests
  res.status(201).json({ status: "requested" });
});
```

### Issues Faced
- Needed to align on the join-request data model between frontend and backend before the UI could be finalized.
- CORS configuration required adjustment to allow the local frontend (port 3000) to reach the local backend (port 5000).

### Next Steps
- Finish wiring the Team Collaboration UI to the live backend routes.
- Start on the Admin/Organizer Dashboard (both API and UI).

### References
- [Express Routing Docs](https://expressjs.com/en/guide/routing.html)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## Week 2

### Summary
Continued on the Team Collaboration feature — extended the backend routes and connected the frontend chat/task components to them behind a feature flag, since the rest of the backend is still in progress.

### Work Done
- Backend: Extended the team routes to support accept/reject on join requests and basic task CRUD for the deadline board.
- Frontend: Connected the chat panel and task board components to the new routes using a local dev server, gated behind a feature flag so the rest of the app keeps using mock data.
- Wrote a couple of integration tests (Supertest) covering the join-request happy path.

### Technical Notes (MWE)
```js
// Minimal working example: accept a join request
router.post("/api/teams/:teamId/accept/:userId", async (req, res) => {
  await Team.findByIdAndUpdate(req.params.teamId, {
    $pull: { pendingRequests: req.params.userId },
    $addToSet: { members: req.params.userId },
  });
  res.json({ status: "accepted" });
});
```

### Issues Faced
- Feature-flag setup added a bit of complexity to the frontend service layer; kept it isolated to a single config file so it's easy to remove once full integration happens.
- Supertest required a separate test database to avoid polluting the dev database — added a `.env.test` config.

### Next Steps
- Start on the Admin/Organizer Dashboard (API + UI), working alongside the backend team's event routes.
- Extend integration tests to cover chat message posting.

### References
- [Supertest](https://github.com/ladjs/supertest)

---

## Week 3

### Summary
Worked on the Admin/Organizer Dashboard from both ends — backend endpoints for admin-level activity tracking and the frontend view to display it.

### Work Done
- Backend: Added `GET /api/admin/overview` returning aggregate counts (users, events, teams) and a `GET /api/admin/events` listing all events regardless of organizer, for admin use.
- Frontend: Wired the Admin Dashboard's events table and activity summary cards to these endpoints, replacing the mock data from earlier mockups.
- Added role-based access control (`isAdmin` middleware) so only admin accounts can hit the `/api/admin/*` routes.

### Technical Notes (MWE)
```js
// Minimal working example: role-based access middleware
function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: "Forbidden" });
  next();
}
```

### Issues Faced
- Initial `overview` query ran three separate `count()` calls; combined them into a single aggregation for a small performance win.
- Needed to confirm with the backend team that `isAdmin` would live on the `User` model rather than a separate `Role` collection, to avoid duplicated access-control logic.

### Next Steps
- Help run end-to-end integration testing across all modules once the rest of the backend (matching, event CRUD) is complete.
- Support the frontend team in swapping remaining mock data for live APIs.

### References
- [MongoDB $facet for combined aggregations](https://www.mongodb.com/docs/manual/reference/operator/aggregation/facet/)

---

## Week 4

### Summary
Focused on end-to-end integration testing across the modules built so far and helped resolve mismatches between the frontend's expected data shapes and the backend's actual responses.

### Work Done
- Ran through each screen (Event Feed, Profile, Matching, Team Collaboration, Admin Dashboard) against the staging backend and logged any contract mismatches.
- Fixed two date-format mismatches (ISO string vs. formatted string) between backend responses and frontend display components.
- Paired with the backend team to finalize the API contract doc so it reflects the actual deployed routes.
- Helped set up a staging smoke-test checklist to run before each deploy.

### Technical Notes (MWE)
```js
// Minimal working example: normalizing a date on the frontend
const displayDate = new Date(event.deadline).toLocaleDateString();
```

### Issues Faced
- A few endpoints returned `null` instead of an empty array for "no results," which broke frontend list rendering — agreed on a convention (always return `[]`) and had the backend team apply it consistently.
- Staging environment occasionally returned stale data due to caching; resolved by disabling cache headers on write-heavy routes during testing.

### Next Steps
- Move into full frontend integration during Week 5 alongside the rest of the team, using the finalized contract doc.
- Keep the smoke-test checklist updated as new routes are added.

### References
- [MDN — Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)

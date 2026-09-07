# Journal — Aarnav Dhillon

**Roll No:** 10240302379
**Role:** Backend & Database Developer
**Project:** TeamUp — Skill-Based Hackathon Discovery & Team-Formation Platform

---

## Week 1

### Summary
Set up the Node.js/Express backend project and designed the initial MongoDB Atlas schema for users, events, and skills.

### Work Done
- Initialized the Express server with core middleware (`cors`, `body-parser`/`express.json`, `dotenv`).
- Set up a MongoDB Atlas cluster and connected the backend to it via Mongoose.
- Designed the initial schemas: `User`, `Event`, `Skill`, `Team`.
- Implemented authentication endpoints (`/register`, `/login`) using JWT for session handling.

### Technical Notes (MWE)
```js
// Minimal working example: User schema
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  skills: [String],
});

module.exports = mongoose.model("User", userSchema);
```

### Issues Faced
- Decided between embedding skills directly in the `User` document versus a separate `Skills` collection — chose embedding for simplicity, since the skill-tag set is small and doesn't need independent querying yet.
- Mongoose's default connection pool settings needed tuning for concurrent local testing.

### Next Steps
- Build event management APIs (CRUD) and the Organizer Portal endpoints.
- Implement the skill-matching logic and Match Score calculation.

### References
- [Mongoose Docs](https://mongoosejs.com)
- [JWT Introduction](https://jwt.io/introduction)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)

---

## Week 2

### Summary
Built event management APIs and the Organizer Portal endpoints on top of the schemas from Week 1.

### Work Done
- Implemented CRUD routes for `Event`: create, list (with filters), update, delete.
- Added an `status` field to `Event` (`Upcoming` / `Closed` / `Ended`) and a scheduled job skeleton to update it based on deadlines.
- Built Organizer Portal endpoints so club organizers can submit and manage their own events (scoped by `organizerId`).
- Added request validation (using `express-validator`) on all event routes.

### Technical Notes (MWE)
```js
// Minimal working example: event status field
const eventSchema = new mongoose.Schema({
  title: String,
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deadline: Date,
  status: { type: String, enum: ["Upcoming", "Closed", "Ended"], default: "Upcoming" },
});
```

### Issues Faced
- Needed to decide where status transitions happen — chose a scheduled job (`node-cron`) over computing status on every read, to keep read queries simple.
- Validation library added some boilerplate per route; considered a shared validation schema to reduce repetition (deferred to Week 3).

### Next Steps
- Implement the skill-matching logic and Match Score calculation.
- Expose matching APIs (post request, browse requests, compute match score).

### References
- [express-validator Docs](https://express-validator.github.io/docs/)
- [node-cron](https://www.npmjs.com/package/node-cron)

---

## Week 3

### Summary
Implemented the skill-matching logic and the Match Score calculation, and exposed the corresponding APIs.

### Work Done
- Defined the Match Score formula: percentage of a request's required skills present in a candidate's skill list.
- Implemented `POST /api/requests` (post a teammate/project request) and `GET /api/requests/:id/matches` (list candidates ranked by Match Score).
- Added indexes on `User.skills` and `Request.requiredSkills` to keep matching queries fast as data grows.
- Wrote unit tests for the Match Score function covering edge cases (empty skill lists, partial overlap, exact match).

### Technical Notes (MWE)
```js
// Minimal working example: Match Score calculation
function matchScore(requiredSkills, candidateSkills) {
  if (requiredSkills.length === 0) return 0;
  const matched = requiredSkills.filter(s => candidateSkills.includes(s));
  return Math.round((matched.length / requiredSkills.length) * 100);
}
```

### Issues Faced
- Case sensitivity in skill tags (e.g., "React" vs "react") was producing false negatives — normalized all skill tags to lowercase on save.
- Ranking large candidate pools by score in application code was slow; moved sorting into the MongoDB aggregation pipeline instead.

### Next Steps
- Build the Team Collaboration APIs (join requests, chat message storage, task/deadline board).
- Start API documentation ahead of frontend integration.

### References
- [MongoDB Aggregation Pipeline](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/)

---

## Week 4

### Summary
Built the Team Collaboration APIs, documented all endpoints, and deployed the backend to a staging environment ahead of the Week 5 frontend integration.

### Work Done
- Implemented `Team` routes: create team, send/accept/reject join request, post chat message, add/update task on the deadline board.
- Documented all API routes (method, path, request body, response shape) in a single reference doc for the frontend team.
- Set up the staging environment on the cloud host and connected it to the MongoDB Atlas cluster's staging database.
- Wired up GitHub Actions to run the test suite and deploy to staging automatically on merge to `main`.

### Technical Notes (MWE)
```js
// Minimal working example: join request route
router.post("/api/teams/:teamId/join", async (req, res) => {
  const { userId } = req.body;
  await Team.findByIdAndUpdate(req.params.teamId, {
    $addToSet: { pendingRequests: userId },
  });
  res.status(201).json({ status: "requested" });
});
```

### Issues Faced
- First CI run failed due to a missing environment variable in the GitHub Actions secrets; resolved by adding the staging `MONGO_URI` and `JWT_SECRET` as repo secrets.
- Had to double-check that chat messages are paginated rather than returned in full, to avoid large payloads as teams accumulate history.

### Next Steps
- Support the frontend team as they wire each screen to these APIs during Week 5.
- Monitor staging logs during initial integration for any contract mismatches.

### References
- [GitHub Actions Docs](https://docs.github.com/en/actions)

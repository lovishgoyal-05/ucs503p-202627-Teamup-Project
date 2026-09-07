# Journal — Dilber Singh

**Roll No:** 1024030252
**Role:** Frontend Developer
**Project:** TeamUp — Skill-Based Hackathon Discovery & Team-Formation Platform

---

## Week 1

### Summary
Set up the React frontend project structure and began building the core UI screens (Event Feed and Student Profile) ahead of backend integration.

### Work Done
- Initialized the React project and set up the folder structure (`components/`, `pages/`, `services/`, `hooks/`).
- Configured client-side routing for the main app screens (Event Feed, Profile, Matching, Team, Dashboard).
- Built the static layout for the Event Feed page (card list, filter bar).
- Built the static layout for the Student Profile page (skills, projects, GitHub link field).
- Set up a basic API service layer (Axios) with placeholder endpoints, to be pointed at the backend once available.

### Technical Notes (MWE)
```jsx
// Minimal working example: fetching events from the backend API
import axios from "axios";

async function fetchEvents() {
  const { data } = await axios.get("/api/events");
  return data;
}
```

### Issues Faced
- Chose Tailwind CSS over hand-written CSS to move faster given the compressed timeline.
- Backend endpoints are not yet live, so the Event Feed and Profile pages are currently rendering mock JSON data.

### Next Steps
- Once the backend APIs are ready, wire the Event Feed and Profile pages to real data.
- Start building the Skill-Based Matching interface.

### References
- [React Docs](https://react.dev)
- [Axios Docs](https://axios-http.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## Week 2

### Summary
Built the Skill-Based Matching interface and started mockups for Team Collaboration, still working against mock data since backend APIs are not yet exposed.

### Work Done
- Built the Matching interface: teammate/project request cards, a "post a request" form, and a Match Score badge component.
- Started static mockups for the Team Collaboration screen (join request button, chat panel placeholder, task/deadline board columns).
- Introduced a shared design-token file (colors, spacing, type scale) so components stay visually consistent as more screens are added.

### Technical Notes (MWE)
```jsx
// Minimal working example: Match Score badge
function MatchScoreBadge({ score }) {
  const color = score >= 60 ? "green" : "gray";
  return <span className={`badge badge-${color}`}>{score}% match</span>;
}
```

### Issues Faced
- Without real match-score data, had to define a mock data shape for requests; flagged this shape to the backend team to confirm it matches the eventual API response.
- Some layout rework needed after introducing the design-token file, since a few components had hardcoded colors.

### Next Steps
- Start on the Admin/Organizer Dashboard UI.
- Confirm the request/match data contract with the backend team ahead of integration.

### References
- [React Docs — Composition](https://react.dev/learn/passing-props-to-a-component)
- [Tailwind CSS — Customizing Theme](https://tailwindcss.com/docs/theme)

---

## Week 3

### Summary
Built the Admin/Organizer Dashboard UI and did a pass on component reuse and accessibility across existing screens.

### Work Done
- Built the Admin/Organizer Dashboard: event submission form, events table with status filters, and a basic users/teams activity view.
- Refactored repeated card/list markup across Event Feed, Matching, and Dashboard into shared components.
- Ran a basic accessibility pass: added `alt` text, form labels, and keyboard focus states.

### Technical Notes (MWE)
```jsx
// Minimal working example: reusable card component
function InfoCard({ title, children }) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}
```

### Issues Faced
- Table filtering (Upcoming/Closed/Ended) is currently client-side against mock data; will need to revisit once server-side filtering/pagination is available.
- Found some visual inconsistency between the Dashboard and other screens, fixed by pulling all three onto the shared design tokens.

### Next Steps
- Finalize all frontend screens with mock data ahead of backend integration.
- Draft the API contract document (expected request/response shapes) to hand off to the backend team.

### References
- [MDN — ARIA basics](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)

---

## Week 4

### Summary
Finalized all frontend screens against mock data and prepared for backend integration, which is scheduled to begin once the backend (Weeks 1–4) is complete.

### Work Done
- Polished all five screens (Event Feed, Profile, Matching, Team Collaboration, Admin Dashboard) for visual consistency and responsive layout (mobile/tablet breakpoints).
- Wrote a short API contract document listing the exact request/response shape each screen expects, to align with the backend team's routes.
- Replaced ad hoc mock data with a single `mockData.js` module so all screens pull from one place, making the eventual swap to real API calls a one-line change per screen.
- Did a dry run of pointing the Axios service layer at a local mock server (using `json-server`) to rehearse the integration step.

### Technical Notes (MWE)
```js
// Minimal working example: swapping mock data for a real API call
// Before:
import { mockEvents } from "../mockData";
const events = mockEvents;

// After (Week 5 target):
const events = await fetchEvents(); // calls /api/events
```

### Issues Faced
- `json-server` response shapes didn't exactly match the API contract draft in a couple of fields (e.g., date format); corrected the contract doc rather than the component, since the real backend is the source of truth.

### Next Steps
- Backend is expected to be ready at the start of Week 5 — begin wiring each screen to the real APIs in the order: Event Feed → Profile → Matching → Team Collaboration → Dashboard.
- Set up basic integration tests once real endpoints are available.

### References
- [json-server](https://github.com/typicode/json-server)

# API overview
Base path: `/api/v1`; JSON responses; page/size pagination defaults 20/max 100.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| GET | `/auth/me` | Authenticated | Current account |
| GET | `/events?page=0&size=20&q=` | Public | Approved event discovery |
| POST | `/events` | Organizer/Admin | Submit event for review |
| POST | `/events/{id}/review` | Admin | Approve/reject pending event |
| GET | `/posts` | Public | Open recruitment posts |
| POST | `/posts` | Authenticated | Create recruitment post |
| POST | `/posts/{id}/join-requests` | Authenticated | Request to join |
| POST | `/join-requests/{id}/review` | Creator/team leader/Admin | Accept/reject; acceptance creates team atomically |
| GET | `/teams` | Authenticated | Current teams |
| POST | `/teams/{id}/transfer-leadership` | Leader/Admin | Transfer leadership to active member |
| GET | `/matching/posts` | Authenticated | Skill match overview |
| GET/POST | `/skills` | GET public, POST authenticated | Browse/add skills |
| GET | `/notifications` | Authenticated | Notifications |
| POST | `/notifications/{id}/read` | Authenticated | Mark read |
| GET | `/admin/dashboard` | Admin | Counts for dashboard |

Interactive OpenAPI documentation: `/swagger-ui.html`.

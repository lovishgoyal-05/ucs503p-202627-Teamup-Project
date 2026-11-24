![Tiet Logo](assets/tiet-logo.svg){ .tiet-logo }

**UCS503: Software Engineering (Project)**  
**TIET Patiala**

# TeamUp — Student Collaboration Platform

TeamUp is a student collaboration, hackathon discovery, and team-building platform built with **React + Vite**, **Java 21 + Spring Boot 3.4**, and **PostgreSQL 17 + Flyway**.

## Project Structure

- `code/` — Application source code (`backend/`, `frontend/`, `docker-compose.yml`, `.env.example`, `README.md`)
- `docs/` — Architecture, database schema, security review, and diagrams
- `journals/` — Individual team member weekly journals
- `project-proposal/`, `project-report-prototype-stage/`, `project-report-final/` — LaTeX project reports

## Running Locally

```shell
cd code
cp .env.example .env   # Fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ADMIN_PASSCODE
docker compose up -d db
cd backend && mvn spring-boot:run
cd ../frontend && npm install && npm run dev
```

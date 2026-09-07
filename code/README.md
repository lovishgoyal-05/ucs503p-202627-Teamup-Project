# TeamUp

TeamUp is a MERN web application that helps students connect with other students to form teams for projects and hackathons.

## Tech Stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt
- Axios
- React Router
- Plain CSS (easy to replace with Tailwind later)

## Setup

1. Create a MongoDB database locally or use MongoDB Atlas.
2. Configure `server/.env`.
3. Configure `client/.env`.
4. From the root:

```bash
npm install
npm run install-all
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## MVP Features

- Student registration/login
- Student profile and skills
- Create projects
- Browse/search projects
- Send team join requests
- Accept/reject requests
- View teams and projects

## API

Base URL: `/api`

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /users/:id`
- `PUT /users/profile`
- `GET /projects`
- `GET /projects/:id`
- `POST /projects`
- `PUT /projects/:id`
- `DELETE /projects/:id`
- `POST /teams`
- `GET /teams/my`
- `GET /teams/:id`
- `POST /teams/:id/request`
- `PUT /teams/requests/:requestId`

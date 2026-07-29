# Project Management System

A full-stack project management application built with **React** (Vite) + **Express** + **Sequelize** + **MySQL**.

## Features

- **Auth** — Register/Login with JWT
- **Projects** — Create, edit, delete, color-code projects
- **Tasks** — Kanban-style (To Do / In Progress / Done), priority levels, due dates
- **Assignments** — Assign tasks to team members
- **Comments** — Discuss tasks with inline comments
- **Dashboard** — Stats overview with recent tasks & overdue alerts
- **Members** — Add/remove project members
- **Theme** — Dark/Light mode toggle
- **Responsive** — Works on desktop & mobile
- **Export** — Download all data as JSON

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8, CSS |
| Backend | Node.js, Express |
| ORM | Sequelize |
| Database | MySQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL running on `localhost:3306`

### Setup

```bash
# 1. Clone and install backend
cd backend
npm install
cp .env.example .env   # or create .env with your DB config

# 2. Install frontend
cd ../frontend
npm install

# 3. Start backend (auto-creates database & tables)
cd ../backend
npm run dev

# 4. Start frontend (in another terminal)
cd ../frontend
npm run dev
```

### Environment Variables (backend/.env)
```
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pms
DB_USER=root
DB_PASSWORD=password
```

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/register` | Register a new user |
| `POST /api/login` | Login |
| `GET/POST/PUT/DELETE /api/projects` | Project CRUD |
| `GET /api/projects/:id/members` | Project members |
| `GET/POST /api/tasks/project/:projectId` | Tasks by project |
| `PATCH /api/tasks/:id/status` | Update task status |
| `GET/POST/DELETE /api/tasks/:id/comments` | Task comments |
| `GET /api/tasks/dashboard` | Dashboard stats |

Full API docs in [docs/PLANS.md](docs/PLANS.md)

## Project Structure

```
├── backend/
│   ├── models/       # Sequelize models
│   ├── routes/       # Express route handlers
│   ├── services/     # Business logic
│   ├── middleware.js  # JWT auth
│   ├── db.js         # DB connection
│   └── server.js     # Entry point
├── frontend/
│   ├── src/          # React source
│   └── vite.config.js
└── docs/
    ├── PLANS.md      # Architecture & plans
    └── CHANGELOG.md  # Version history
```

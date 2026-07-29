# Project Management System — Plans & Architecture

## Overview
Full-stack Project Management System built with React (Vite) frontend and Express/Sequelize backend with MySQL.

## Tech Stack
- **Frontend:** React 19, Vite 8, CSS (dark/light theme)
- **Backend:** Node.js, Express, Sequelize ORM
- **Database:** MySQL
- **Auth:** JWT (JSON Web Tokens)

## Features Implemented

### Phase 1 — Core (✅ Done)
- [x] User registration & login (JWT)
- [x] Project CRUD
- [x] Task CRUD with Kanban status (todo / in_progress / done)
- [x] Task priority levels (low / medium / high / urgent)
- [x] Task assignment to users
- [x] Task due dates
- [x] Comments on tasks
- [x] Dashboard stats (counts by status, overdue tasks)
- [x] Recent tasks list
- [x] Project members (add/remove)

### Phase 2 — Enhanced (✅ Done)
- [x] Sequelize ORM integration
- [x] Dark/Light theme toggle
- [x] Responsive mobile layout
- [x] Markdown preview in task descriptions
- [x] File uploads per task
- [x] Share tasks via public link
- [x] Export all data as JSON

### Phase 3 — Planned
- [ ] Activity log / audit trail
- [ ] Email notifications for task assignments
- [ ] Drag & drop Kanban board
- [ ] Task labels / tags
- [ ] Task templates
- [ ] Time tracking
- [ ] Calendar view
- [ ] Search across all projects
- [ ] User profile & avatar upload

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | Auto increment |
| name | VARCHAR(255) | |
| email | VARCHAR(255) | Unique |
| password | VARCHAR(255) | bcrypt hashed |
| avatar | VARCHAR(255) | File path |
| created_at | TIMESTAMP | |

### projects
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | |
| name | VARCHAR(255) | |
| description | TEXT | |
| color | VARCHAR(7) | Hex color |
| owner_id | INT FK → users(id) | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### project_members
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | |
| project_id | INT FK → projects(id) | |
| user_id | INT FK → users(id) | |
| role | ENUM('admin','member') | |

### tasks
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | |
| project_id | INT FK → projects(id) | |
| title | VARCHAR(255) | |
| description | TEXT | Markdown supported |
| status | ENUM('todo','in_progress','done') | |
| priority | ENUM('low','medium','high','urgent') | |
| assignee_id | INT FK → users(id) | NULLable |
| due_date | DATE | NULLable |
| created_by | INT FK → users(id) | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### task_comments
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | |
| task_id | INT FK → tasks(id) | |
| user_id | INT FK → users(id) | |
| content | TEXT | |
| created_at | TIMESTAMP | |

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/register | No | Register user |
| POST | /api/login | No | Login user |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/projects | Yes | List user's projects |
| GET | /api/projects/:id | Yes | Get project details |
| POST | /api/projects | Yes | Create project |
| PUT | /api/projects/:id | Yes | Update project |
| DELETE | /api/projects/:id | Yes | Delete project |
| GET | /api/projects/:id/members | Yes | List project members |
| POST | /api/projects/:id/members | Yes | Add member |
| DELETE | /api/projects/:id/members/:userId | Yes | Remove member |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/tasks/dashboard | Yes | Get stats |
| GET | /api/tasks/project/:projectId | Yes | List project tasks |
| GET | /api/tasks/:id | Yes | Get task details |
| POST | /api/tasks/project/:projectId | Yes | Create task |
| PUT | /api/tasks/:id | Yes | Update task |
| PATCH | /api/tasks/:id/status | Yes | Update task status |
| DELETE | /api/tasks/:id | Yes | Delete task |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/tasks/:id/comments | Yes | List comments |
| POST | /api/tasks/:id/comments | Yes | Add comment |
| DELETE | /api/tasks/comments/:commentId | Yes | Delete comment |

## Folder Structure
```
project/
├── backend/
│   ├── models/         # Sequelize models
│   ├── routes/         # Express route handlers
│   ├── services/       # Business logic layer
│   ├── middleware.js    # JWT auth middleware
│   ├── db.js           # DB connection
│   └── server.js       # Entry point
├── frontend/
│   ├── src/            # React source
│   │   ├── App.jsx     # Main app component
│   │   ├── App.css     # Styles
│   │   ├── Auth.jsx    # Login/Register
│   │   └── AuthContext.jsx
│   ├── index.html
│   └── vite.config.js
└── docs/
    └── PLANS.md
```

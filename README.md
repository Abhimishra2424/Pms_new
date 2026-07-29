# Enterprise Project Management System

A full-stack enterprise-grade Project Management System (PMS) comparable to Jira, Linear, ClickUp, and Asana. Built with React 19, Express.js, Sequelize ORM, and MySQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Material UI 6, Redux Toolkit, Redux Saga, Framer Motion, Recharts, React Query |
| Backend | Node.js, Express.js, Sequelize ORM, Socket.io, JWT, Winston |
| Database | MySQL with UUIDs, composite indexes, soft deletes, transactions |
| Real-time | Socket.io (chat, notifications, task updates) |
| Scheduling | Node-Cron (7 automated jobs) |
| Security | Helmet, Rate Limiter, JWT Refresh Tokens, XSS Protection |

## Features

### Core Modules
- **Dashboard** — Stats, charts (pie, bar, doughnut, line), recent activity, sprint progress, team overview
- **Projects** — CRUD, Kanban board, timeline, Gantt chart, milestones, sprints, epics
- **Tasks** — Kanban, list, calendar, timeline views, subtasks, checklists, dependencies, labels, story points, time tracking
- **Bug Tracker** — Severity, environment, steps to reproduce, screenshots
- **Team** — Employees, departments, designations, roles (8 roles, 14 permissions)

### HR Modules
- **Attendance** — Clock in/out, monthly calendar, team view for managers
- **Leave Management** — Apply, approve/reject, balance tracking, calendar
- **Holiday Calendar** — Public, company, optional holidays

### Business Modules
- **Clients** — CRM-style client management
- **Invoices** — Generate, send, mark paid, PDF download
- **Expenses** — Track, categorize, approve/reject, billable
- **Meetings** — Schedule, attendees, notes, recording links

### Collaboration
- **Real-time Chat** — Direct, group, project conversations with typing indicators
- **Notifications** — In-app + email + push
- **Comments** — Rich text, mentions, file attachments on tasks
- **Activity Log** — Complete audit trail across all entities

### Knowledge
- **Documents** — Folder structure, file upload, categorization
- **Knowledge Base** — Articles, categories, tags, search
- **Wiki** — Hierarchical pages, rich content
- **Announcements** — Priority-targeted company announcements

### Reporting
- **8 Report Types** — Employee, Project, Task, Sprint, Bug, Timesheet, Performance, Dashboard stats
- **Charts** — Pie, bar, line, area, doughnut, heatmap, burndown
- **Export** — CSV, Excel, PDF

### Administration
- **Company Settings** — Profile, branding, localization
- **System Settings** — SMTP, security, preferences
- **Import/Export** — Bulk CSV/Excel import for employees, projects, tasks, clients
- **Admin Panel** — Company management, system health, audit logs

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+ running on `localhost:3306`

### Setup

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env   # configure your database credentials
npm run migrate         # auto-creates all tables
npm run seed            # seeds admin user & default data
npm run dev             # starts on port 5000

# 2. Frontend (separate terminal)
cd frontend
npm install
npm run dev             # starts on port 5173
```

### Default Credentials
- **Email:** `admin@pms.com`
- **Password:** `Admin@123`

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pms_db
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=pms_jwt_secret_key_2024_super_secret
JWT_REFRESH_SECRET=pms_refresh_secret_key_2024_super_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
├── backend/                     # Express.js API server
│   ├── src/
│   │   ├── config/             # Database, env config
│   │   ├── constants/          # Roles, permissions, status enums
│   │   ├── controllers/        # Route handlers (22 modules)
│   │   ├── cron/               # 7 scheduled jobs
│   │   ├── database/           # Migrations, seeders
│   │   ├── middleware/         # Auth, validation, upload, error handler, rate limiter
│   │   ├── models/             # 36 Sequelize models with associations
│   │   ├── repositories/       # Data access layer (18 modules)
│   │   ├── routes/             # 31 API route modules
│   │   ├── services/           # Business logic (22 modules)
│   │   ├── sockets/            # Socket.io handlers (chat, tasks, notifications)
│   │   ├── utils/              # Logger, ApiError, ApiResponse, helpers
│   │   └── validators/         # Express-validator rules (15 modules)
│   ├── uploads/
│   └── logs/
├── frontend/                    # React 19 SPA
│   ├── src/
│   │   ├── api/                # Axios instance + API modules
│   │   ├── components/         # 15 reusable common components
│   │   ├── constants/          # Roles, status, config
│   │   ├── context/            # Theme, Auth context
│   │   ├── hooks/              # Custom hooks
│   │   ├── layouts/            # MainLayout, AuthLayout, Sidebar, Header
│   │   ├── pages/              # 52 page components across 20 modules
│   │   ├── redux/              # Store, 10 slices, 5 sagas
│   │   ├── routes/             # 40+ routes with lazy loading
│   │   ├── styles/             # Global CSS with theme variables
│   │   └── utils/              # Helpers, validators
│   └── vite.config.js
└── docs/
    ├── PLANS.md                # Architecture documentation
    └── CHANGELOG.md            # Version history
```

## API Overview (31 Modules)

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Register, login, refresh token, password reset |
| Company | `/api/company` | Company CRUD & settings |
| Departments | `/api/departments` | Department CRUD |
| Designations | `/api/designations` | Designation CRUD |
| Employees | `/api/employees` | Employee CRUD with roles |
| Projects | `/api/projects` | Full project management |
| Milestones | `/api/milestones` | Project milestone tracking |
| Sprints | `/api/sprints` | Sprint management with burndown |
| Epics | `/api/epics` | Epic CRUD |
| Tasks | `/api/tasks` | Full task management with board view |
| Bugs | `/api/bugs` | Bug tracking with severity |
| Time Tracking | `/api/time-tracking` | Timer and manual time entries |
| Attendance | `/api/attendance` | Clock in/out, monthly reports |
| Leaves | `/api/leaves` | Leave apply/approve/balance |
| Holidays | `/api/holidays` | Holiday calendar |
| Meetings | `/api/meetings` | Meeting scheduling |
| Clients | `/api/clients` | Client CRM |
| Invoices | `/api/invoices` | Invoice generation & PDF |
| Expenses | `/api/expenses` | Expense tracking |
| Documents | `/api/documents` | File management |
| Knowledge Base | `/api/knowledge-base` | Articles & categories |
| Wiki | `/api/wiki` | Hierarchical wiki pages |
| Announcements | `/api/announcements` | Company announcements |
| Notifications | `/api/notifications` | In-app notifications |
| Chat | `/api/chat` | Real-time messaging |
| Reports | `/api/reports` | 8 report types |
| Search | `/api/search` | Global search |
| Activity Logs | `/api/activity-logs` | Audit trail |
| Settings | `/api/settings` | System configuration |
| Import | `/api/import` | Bulk CSV/Excel import |
| Export | `/api/export` | CSV/Excel/PDF export |

## Architecture

### Backend: Clean Architecture
```
Routes → Validators → Controllers → Services → Repositories → Models
```

- **Routes** define HTTP methods and middleware chains
- **Validators** enforce request body/param schemas
- **Controllers** handle HTTP request/response lifecycle
- **Services** contain business logic and orchestration
- **Repositories** abstract database operations with pagination/search/filter
- **Models** define schema, associations, indexes, hooks

### Frontend: Feature-Based Structure
```
Pages → Components → Redux (Slices + Sagas) → API Layer
```

- **Pages** are route-level components composing features
- **Components** are reusable UI building blocks
- **Redux** manages global state with Redux Toolkit slices and Saga side effects
- **API layer** centralizes HTTP calls with Axios interceptors

### Authentication Flow
1. User logs in → server returns access token (1h) + refresh token (7d)
2. Access token stored in Redux Persist (localStorage)
3. Axios interceptor attaches Bearer token to all requests
4. On 401 response, interceptor attempts token refresh automatically
5. RBAC middleware on backend checks role-based permissions for protected routes

## Security
- Helmet.js HTTP headers
- Rate limiting (100 req/15min general, 20/15min auth)
- JWT with refresh token rotation
- Bcrypt password hashing (12 rounds)
- SQL injection protection via Sequelize parameterized queries
- Input validation on all endpoints
- File upload validation (type + size limits)
- CORS whitelisting
- XSS protection via helmet

## Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm start` | Start production server |
| `npm test` | Run Jest tests with coverage |
| `npm run migrate` | Sync database schema |
| `npm run seed` | Seed default data |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run linter |
# Changelog

## v2.0.0 — Enterprise Release

### Added
- **Complete architecture rewrite** to Clean Architecture with Controllers, Services, Repositories, Validators layers
- **36 Sequelize models** with UUID primary keys, composite indexes, soft deletes, full associations
- **31 REST API modules** covering all enterprise features
- **8 roles** (Super Admin, Company Admin, Project Manager, Team Lead, Developer, QA, HR, Client) with 14 granular permissions
- **JWT authentication** with access token (1h) + refresh token (7d) rotation and auto-refresh via Axios interceptor
- **Real-time chat** with Socket.io (direct messages, group conversations, typing indicators, file sharing)
- **Real-time task updates** via Socket.io (create/update/delete/commented events)
- **Push notifications** via Socket.io with in-app notification center
- **Enterprise Dashboard** with 6 stat cards, 4 chart types (doughnut, pie, bar, horizontal bar), recent activity timeline, my tasks list, upcoming events, sprint progress, team members grid, notifications panel
- **Kanban Board** with @hello-pangea/dnd drag-and-drop across 5 columns (Backlog → Todo → In Progress → In Review → Done)
- **Task Management** with subtasks, checklists, dependencies, labels, story points, time tracking, rich text editor, file attachments
- **Bug Tracker** with severity levels, environment tracking, steps to reproduce
- **Project Management** with milestones, sprints, epics, budget tracking, team management
- **Time Tracking** with start/stop timer, manual entry, weekly reports, billable tracking
- **Attendance System** with clock in/out, monthly calendar heatmap, team view, auto-absent marking
- **Leave Management** with balance tracking, apply/approve/reject workflow, calendar view
- **Holiday Calendar** with public/company/optional types, year grouping
- **Meeting Scheduler** with attendee management, meeting links, notes
- **Client CRM** with contact management, project/invoice association
- **Invoice System** with auto-numbering (INV-YYYY-XXXX), itemized billing, tax/discount, status workflow, PDF generation
- **Expense Tracking** with categories, receipt upload, approve/reject workflow
- **Documents** with folder hierarchy, file upload, type filtering, download
- **Knowledge Base** with categories, tags, rich content, view tracking
- **Wiki** with hierarchical pages, parent/child relationships, tree navigation
- **Announcements** with priority levels, target audience, publish/archive workflow
- **Global Search** across projects, tasks, employees, documents, knowledge base
- **Activity Log** / Audit trail with resource tracking, user agent, IP capture
- **8 Report Types** (Employee, Project, Task, Sprint, Bug, Timesheet, Performance, Dashboard) with charts and data tables
- **Import Module** — Bulk CSV/Excel import for employees, projects, tasks, clients
- **Export Module** — CSV, Excel, PDF export for projects, tasks, employees, invoices
- **Company Settings** with branding, localization, security preferences
- **SMTP Configuration** for email notifications
- **Admin Panel** for super admin with company management, system health, audit log viewer
- **7 Cron Jobs** (overdue reminders, deadline alerts, auto-absent, weekly reports, log cleanup, timesheet summaries, attendance reports)
- **Rate Limiting** (100/15min general, 20/15min auth, 200/15min API)
- **Security** — Helmet.js, CORS whitelisting, input validation, file upload restrictions
- **Frontend Lazy Loading** with React.lazy and Suspense for all 40+ route pages
- **Material UI 6** with custom dark/light theme, glassmorphism effects, smooth animations
- **Framer Motion** page transitions and micro-interactions throughout
- **15 Reusable Components** including DataTable (tanstack-table), KanbanBoard, RichTextEditor, FileUpload, StatusBadge, ErrorBoundary
- **Redux Toolkit** store with 10 slices + Redux Saga middleware + Redux Persist
- **React Query** integration for server state caching
- **Optimized builds** with Vite code splitting and tree shaking

### Changed
- Moved from flat routes/controllers to Clean Architecture (controllers → services → repositories → models)
- Replaced integer IDs with UUID primary keys across all tables
- Upgraded to React 19 and Material UI 6
- Upgraded from react-beautiful-dnd to @hello-pangea/dnd (React 19 compatible)
- Enhanced error handling with consistent ApiError/ApiResponse patterns
- Improved pagination with standardized query params and response meta

### Fixed
- MUI v6 icon name changes (CheckCircleOutline → CheckCircle/CheckCircleOutlined, ErrorOutline → ErrorOutlined, MailOutline → MailOutlined)
- redux-persist storage initialization for Vite/ESM environment
- React Router BrowserRouter wrapping for proper routing context
- Route ordering for Express parameterized routes

### Removed
- Legacy flat file structure (old models/, routes/, services/ directories)
- Deprecated CSS-only approach in favor of MUI sx/styled system
- Markdown-only task descriptions (replaced with rich text editor)

## v1.0.0 — Initial Release

### Added
- Basic user authentication (register/login) with JWT
- Simple project CRUD with color theming
- Basic task management with Kanban status (To Do / In Progress / Done)
- Task priority levels (Low / Medium / High / Urgent)
- Task assignment to users
- Due dates on tasks
- Comments on tasks with user attribution
- Simple dashboard with stats (total projects, tasks, status breakdown, overdue count, recent tasks)
- Project members management (add/remove)
- Dark/Light theme toggle with system preference detection
- Responsive design for mobile
- Markdown preview in task descriptions
- File uploads per task
- Share tasks via public link
- Export data as JSON download
- Basic service-layer architecture with Sequelize ORM
- MySQL database with auto-sync schema
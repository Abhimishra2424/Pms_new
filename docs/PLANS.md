# Project Management System — Architecture & Plans

## Overview
Enterprise-grade Project Management System (PMS) with 31 backend modules and 20 frontend modules. Built with React 19, Express.js, Sequelize ORM, and MySQL.

## Architecture

### Backend: Clean Architecture Layers
```
┌─────────────────────────────────────────────────────────┐
│                      Routes                              │
│  HTTP method definitions, middleware chains, validation  │
├─────────────────────────────────────────────────────────┤
│                   Controllers                            │
│  Request/response handling, status codes, data shaping   │
├─────────────────────────────────────────────────────────┤
│                     Services                             │
│  Business logic, orchestration, error handling           │
├─────────────────────────────────────────────────────────┤
│                   Repositories                           │
│  Data access, pagination, search, filtering, sorting     │
├─────────────────────────────────────────────────────────┤
│                     Models                               │
│  Schema, associations, indexes, hooks, soft deletes      │
└─────────────────────────────────────────────────────────┘
```

### Frontend: Feature-Based Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Pages                                 │
│  Route-level components composing features & layouts     │
├─────────────────────────────────────────────────────────┤
│                  Components                              │
│  Reusable UI: DataTable, Kanban, RichTextEditor, etc.   │
├─────────────────────────────────────────────────────────┤
│                Redux (Slices + Sagas)                    │
│  Global state management, async side effects             │
├─────────────────────────────────────────────────────────┤
│                  API Layer                               │
│  Axios instance, interceptors, refresh token logic       │
└─────────────────────────────────────────────────────────┘
```

### Data Flow
```
User Action → Component → Redux Dispatch → Saga → API Call → Backend → Response → Saga → Redux Reducer → Component Re-render
```

## Database Schema

### Core Tables (36 models)

#### Organization
- **companies** — id(UUID), name, slug, logo, email, phone, address, taxId, industry, size, currency, timezone, settings
- **departments** — id(UUID), name, description, companyId(FK), headId(FK), isActive
- **designations** — id(UUID), title, description, departmentId(FK), companyId(FK), hierarchyLevel

#### Users & Access
- **users** — id(UUID), firstName, lastName, email(unique), password(bcrypt), role(ENUM: 8 roles), employeeId, departmentId(FK), designationId(FK), companyId(FK), managerId(FK), avatar, phone, dateOfBirth, dateOfJoining, gender, address, city, state, country, zipCode, timezone, language, emailVerified, isActive, lastLogin
- **settings** — id(UUID), companyId(FK), key(unique per company), value, type, group

#### Projects
- **projects** — id(UUID), name, description, key(unique), status(ENUM), priority(ENUM), category(ENUM), companyId(FK), clientId(FK), leadId(FK), startDate, endDate, estimatedHours, actualHours, budget, currency, progress, isPublic, tags(JSON)
- **project_members** — id(UUID), projectId(FK), userId(FK), role(ENUM), hourlyRate, totalHours
- **project_milestones** — id(UUID), projectId(FK), title, description, status(ENUM), dueDate, completedDate, sortOrder
- **sprints** — id(UUID), projectId(FK), name, goal, status(ENUM), startDate, endDate, totalStoryPoints, completedStoryPoints
- **epics** — id(UUID), projectId(FK), name, description, status(ENUM), priority(ENUM), startDate, endDate, sortOrder

#### Tasks
- **tasks** — id(UUID), title, description, type(ENUM: task/bug/story/epic/sub_task), status(ENUM), priority(ENUM), severity(ENUM), storyPoints, estimatedHours, actualHours, dueDate, startDate, completedDate, sortOrder, projectId(FK), sprintId(FK), epicId(FK), milestoneId(FK), parentId(FK self), reporterId(FK), assigneeId(FK), companyId(FK), labels(JSON), attachments(JSON)
- **task_checklists** — id(UUID), taskId(FK), title, isCompleted, completedBy(FK), completedAt, sortOrder
- **task_dependencies** — id(UUID), taskId(FK), dependsOnId(FK), type(ENUM: blocks/blocked_by/relates_to)
- **task_comments** — id(UUID), taskId(FK), userId(FK), content(TEXT), mentions(JSON), attachments(JSON)
- **task_history** — id(UUID), taskId(FK), userId(FK), field, oldValue, newValue, type(ENUM)

#### Bugs
- **bug_reports** — id(UUID), taskId(FK unique), severity(ENUM), environment, browser, os, stepsToReproduce, expectedResult, actualResult, screenshots(JSON)

#### Time Tracking
- **time_entries** — id(UUID), taskId(FK), userId(FK), projectId(FK), description, startTime, endTime, duration(seconds), isBillable, hourlyRate, totalAmount, source(ENUM: timer/manual), date

#### HR
- **attendance** — id(UUID), userId(FK), companyId(FK), date(unique per user), clockIn, clockOut, status(ENUM), totalHours, overtimeHours
- **leaves** — id(UUID), userId(FK), companyId(FK), type(ENUM), startDate, endDate, totalDays, reason, status(ENUM), approvedBy(FK)
- **holidays** — id(UUID), companyId(FK), name, date(unique per company), type(ENUM), year

#### Business
- **clients** — id(UUID), companyId(FK), name, email(unique), phone, company, website, address
- **invoices** — id(UUID), companyId(FK), clientId(FK), invoiceNumber(unique), issueDate, dueDate, status(ENUM), subtotal, taxRate, taxAmount, discount, total, amountPaid, balanceDue
- **invoice_items** — id(UUID), invoiceId(FK), description, quantity, unitPrice, total
- **expenses** — id(UUID), companyId(FK), projectId(FK), userId(FK), category(ENUM), amount, currency, expenseDate, description, receipt(JSON), status(ENUM), approvedBy(FK)

#### Collaboration
- **meetings** — id(UUID), title, description, projectId(FK), createdBy(FK), meetingDate, startTime, endTime, status(ENUM), meetingLink, location
- **meeting_attendees** — id(UUID), meetingId(FK), userId(FK), status(ENUM)
- **notifications** — id(UUID), userId(FK), title, message, type(ENUM), referenceId, referenceType, isRead, readAt

#### Chat
- **chat_conversations** — id(UUID), name, type(ENUM: direct/group/project), projectId(FK), createdBy(FK), lastMessageAt
- **chat_participants** — id(UUID), conversationId(FK), userId(FK), lastReadAt, isAdmin
- **chat_messages** — id(UUID), senderId(FK), receiverId(FK), conversationId(FK), projectId(FK), message, messageType(ENUM), attachments(JSON), isRead, readAt, editedAt

#### Knowledge
- **documents** — id(UUID), companyId(FK), projectId(FK), folderId(FK self), name, description, fileUrl, fileType, fileSize, uploadedBy(FK)
- **knowledge_base** — id(UUID), companyId(FK), projectId(FK), title, slug(unique), content(TEXT), excerpt, category, tags(JSON), authorId(FK), isPublished, views
- **wiki** — id(UUID), companyId(FK), projectId(FK), title, slug, content(TEXT), parentId(FK self), sortOrder, authorId(FK), isPublished
- **announcements** — id(UUID), companyId(FK), title, content(TEXT), priority(ENUM), status(ENUM), authorId(FK), publishedAt, targetAudience(JSON)

#### Audit
- **activity_logs** — id(UUID), companyId(FK), userId(FK), action, resourceType, resourceId(UUID), description, metadata(JSON), ipAddress, userAgent

### Indexing Strategy
- Composite unique indexes on: (projectId, userId), (userId, date), (companyId, date), (conversationId, userId), (companyId, key)
- Performance indexes on: email, status, assigneeId, companyId, projectId+status, userId+date

### Soft Delete
All models use Sequelize `paranoid: true` for soft deletes with `deletedAt` timestamp.

## Authentication & Authorization

### Roles (8)
| Role | Permissions |
|------|------------|
| Super Admin | Full system access |
| Company Admin | Company-wide management |
| Project Manager | Projects, tasks, teams, reports |
| Team Lead | Tasks, reports |
| Developer | Task management |
| QA | Task management |
| HR | Attendance, leave, reports |
| Client | View-only (assigned projects) |

### Permissions (14)
manage_company, manage_users, manage_projects, manage_tasks, manage_teams, view_reports, manage_settings, manage_roles, manage_attendance, manage_leave, manage_invoice, manage_expenses, manage_clients, manage_knowledge_base, manage_announcements

### Auth Flow
1. JWT access token (1h expiry) + refresh token (7d expiry)
2. Refresh token rotation on each refresh
3. Axios interceptor auto-refreshes on 401
4. Backend middleware: authenticate → authorize(role) → hasPermission(permission)

## API Design Standards

Every endpoint follows:
- **Validation** — Request body/params validated before controller
- **Error Handling** — Consistent ApiError classes with status codes
- **Pagination** — `?page=1&limit=20&sortBy=createdAt&sortOrder=DESC`
- **Search** — `?search=query` for text search on relevant fields
- **Filtering** — Entity-specific filters as query params
- **Response Format** — `{ success: true, data: {...}, message: "...", meta: { page, limit, total, pages } }`

## Real-time Features (Socket.io)

### Namespaces
- `/chat` — Direct messages, group conversations, typing indicators
- `/notifications` — Push notifications, mark read, fetch
- `/tasks` — Task created/updated/deleted/commented events

### Events
- Client → Server: `send_message`, `typing`, `stop_typing`, `mark_read`, `join_conversation`, `leave_conversation`
- Server → Client: `new_message`, `typing`, `stop_typing`, `notification:send`, `task:updated`, `task:created`

## Frontend Component Architecture

### Common Components (15)
| Component | Purpose |
|-----------|---------|
| DataTable | Full-featured table with sorting, filtering, pagination, row selection, CSV export |
| KanbanBoard | Drag-and-drop board with @hello-pangea/dnd |
| RichTextEditor | React Quill wrapper for rich text editing |
| FileUpload | Drag-drop file upload with preview (react-dropzone) |
| StatusBadge | Colored MUI Chip for status display |
| PriorityBadge | Priority indicator with color coding |
| AvatarGroup | Stacked avatars with overflow count |
| SearchInput | Debounced search input |
| FilterDrawer | Slide-in filter panel with date range, selects |
| ConfirmDialog | Confirmation modal with destructive action support |
| ErrorBoundary | React error boundary with retry |
| SkeletonLoader | Loading skeletons (table, card, list, chart variants) |
| EmptyState | Empty state with icon, message, action |
| PageHeader | Title, breadcrumbs, action buttons |
| LoadingScreen | Full-page loading spinner |

### State Management
- **Redux Toolkit** — Global state (auth, projects, tasks, UI, notifications, chat)
- **Redux Saga** — Side effects (API calls, token refresh, socket events)
- **Redux Persist** — localStorage persistence for auth tokens
- **React Query** — Server state caching for data fetching

## Views Implemented

### Project Views
- **List View** — DataTable with search, filters, sort
- **Board View** — Kanban with drag-and-drop between columns
- **Detail View** — Overview with stats, team, timeline, activity

### Task Views
- **Kanban Board** — Drag tasks between Backlog → Todo → In Progress → In Review → Done
- **List View** — Sortable/filterable table with bulk actions
- **Calendar View** — Monthly calendar with task dots, drag to reschedule
- **Timeline/Gantt View** — Horizontal bars with dependencies, zoom levels
- **Detail View** — Full task detail with comments, checklist, time tracking, activity log

### Calendar System
- Google Calendar ready structure
- Month/week/day views for tasks and events
- Drag-to-reschedule

## Cron Jobs (7)

| Schedule | Job | Description |
|----------|-----|-------------|
| Every 30 min | Overdue reminders | Check overdue tasks, send notifications |
| Daily 00:00 | Deadline reminders | Tasks due in 24h get notification |
| Daily 00:00 | Auto-absent marking | Mark absent for users w/o attendance yesterday |
| Weekly Mon 09:00 | Weekly reports | Generate and email weekly reports to managers |
| Weekly Sun 00:00 | Activity log cleanup | Delete logs older than 90 days |
| Weekly Mon 00:00 | Timesheet reports | Generate weekly timesheet summaries |
| Monthly 1st 00:00 | Attendance reports | Generate monthly attendance reports |

## Testing Strategy
- **Unit Tests** — Services and utilities with Jest
- **API Tests** — Supertest for endpoint integration tests
- **Coverage** — >80% target coverage

## Future Enhancements
- [ ] Video conferencing integration (WebRTC)
- [ ] Mobile app (React Native)
- [ ] GPT-powered task suggestions
- [ ] Automated timezone detection
- [ ] Two-factor authentication
- [ ] SAML/SSO integration
- [ ] Webhook system
- [ ] Custom fields for tasks/projects
- [ ] Advanced automation rules
- [ ] Resource management / workload view
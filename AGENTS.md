# AGENTS.md — ProjectPro PMS

## Repo layout
```
backend/   — CJS (require / module.exports), Express + Sequelize + MySQL
frontend/  — ESM (import / export), React 19 + Vite + MUI 6
```
Not a monorepo. Each has its own `package.json`, `node_modules`, `dev` script.

## First-time setup (backend)
```bash
cd backend
npm install
# ensure .env has DB_NAME=pms_db, DB_PASSWORD=your_root_pw, PORT=5000
npm run migrate   # sequelize.sync({ alter: true })
npm run seed      # creates admin@pms.com / Admin@123
npm run dev       # nodemon src/app.js on :5001
```

## First-time setup (frontend)
```bash
cd frontend
npm install --legacy-peer-deps   # required — @hello-pangea/dnd has peer dep conflicts with React 19
npm run dev        # Vite on :5173, proxies /api → :5000
```

## Known quirks / gotchas

### `Op.iLike` breaks on MySQL
`backend/src/repositories/*.js` uses `Op.iLike` (PostgreSQL-only). MySQL needs `Op.like` instead (utf8mb4 collation is already case-insensitive). 23 occurrences across files — fix if search endpoints return errors.

### Vite proxy misconfigured
`frontend/vite.config.js` proxies `/api` to `http://localhost:5001` but backend runs on `:5000`. The app currently bypasses the proxy via an absolute `API_BASE_URL` in `constants/config.js`, so it works. But if you enable the proxy, update the port.

### MUI v6 slotProps (not InputProps)
MUI core is v6 — `TextField` uses `slotProps={{ input: { startAdornment: ... } }}`, not the deprecated `InputProps={{ ... }}`. Auth pages were fixed but new code should use `slotProps`.

### MUI icons are v9
Import: `import XIcon from '@mui/icons-material/X'`. Some names changed from v5 — verify icon exists. Common renames: `CheckCircleOutline` → `CheckCircle`/`CheckCircleOutlined`, `ErrorOutline` → `ErrorOutlined`, `MailOutline` → `MailOutlined`.

### React Router v7
Uses `react-router-dom` v7. Routes defined in `frontend/src/routes/AppRoutes.jsx` with `lazy()` + `Suspense`. `BrowserRouter` lives in `App.jsx` — if routes error "useRoutes() may be used only in the context of a `<Router>`", check `App.jsx` wraps `<AppRoutes />` in `<BrowserRouter>`.

### redux-persist storage
`store.js` uses an inline `localStorage` wrapper for persist, **not** `import storage from 'redux-persist/lib/storage'` (that breaks with Vite/ESM). Keep the inline pattern.

## Backend architecture
```
Route → validate() → Controller → Service → Repository → Model
```
- **validators/** — express-validator `body()` chains, passed to `validate()` middleware
- **controllers/** — thin, calls service + `ApiResponse.success(res, data, msg, status)`
- **services/** — business logic, throws `ApiError.badRequest/notFound/unauthorized/forbidden`
- **repositories/** — Sequelize queries, `findAndCountAll` pagination, `findByPk` with includes
- **models/** — 36 models, all UUID PK, `paranoid: true`, underscored, associations in `index.js`
- **middleware/auth.js** — `authenticate` (JWT → `req.user`), `authorize(...roles)`, `hasPermission(perm)`

Response format: `{ success: true, data: {...}, message: "..." }`
Error format: `{ success: false, message: "...", errors: [...] }`

## Frontend architecture
```
Page → Component → dispatch(action) → Saga → API → Reducer → re-render
```
- **redux/slices/** — Redux Toolkit `createSlice`, one per domain (10 slices)
- **redux/sagas/** — saga watchers with `takeLatest`, one per domain (3 sagas: auth, project, task)
- **api/** — axios instance with JWT interceptor + auto-refresh on 401
- **api/axios.js** — stores token/refresh in `localStorage` with `STORAGE_KEYS.AUTH_TOKEN/REFRESH_TOKEN`
- **routes/AppRoutes.jsx** — `lazy()` all page components, `ProtectedRoute` wrapper, `AdminRoute` for super_admin only

### Saga pattern (auth example)
```js
function* handleLogin(action) {
  try {
    const res = yield call(authApi.login, action.payload);
    const { user, token } = res.data.data || res.data;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    yield put(loginSuccess({ user, token }));
  } catch (error) {
    yield put(loginFailure(error.response?.data?.message || 'Failed'));
  }
}
export default function* authSaga() {
  yield takeLatest(loginStart.type, handleLogin);
}
```
The Saga unwraps the response — `res.data.data || res.data` handles both wrapped and raw API shapes.

## Testing
- Backend has Jest + Supertest as devDeps but **no test files yet**
- Frontend has no test frameworks installed

## Commands
| Area | Command | Note |
|------|---------|------|
| Backend dev | `npm run dev` | :5001, nodemon |
| Backend migrate | `npm run migrate` | alters tables |
| Backend seed | `npm run seed` | admin@pms.com / Admin@123 |
| Backend test | `npm test` | jest (no tests yet) |
| Frontend dev | `npm run dev` | :5173 |
| Frontend build | `npm run build` | vite |
| Frontend lint | `npm run lint` | oxlint (`.oxlintrc.json`) |

## Default credentials
- **admin@pms.com** / **Admin@123** (Super Admin, seeded)
- Roles: super_admin, company_admin, project_manager, team_lead, developer, qa, hr, client

## Critical files
- `backend/src/app.js` — route mounting (31 modules via `mountRoute`)
- `backend/src/models/index.js` — all 36 model associations
- `backend/src/config/database.js` — Sequelize with MySQL, utf8mb4, underscored, paranoid
- `frontend/src/redux/store.js` — Redux + persist + saga
- `frontend/src/api/axios.js` — JWT interceptor + refresh token queue
- `frontend/src/constants/config.js` — `API_BASE_URL`, `STORAGE_KEYS`, `SOCKET_URL`
- `frontend/src/routes/AppRoutes.jsx` — 40+ lazy routes, auth guards

## Environment
Backend `.env` in `backend/.env` (gitignored). All vars with defaults in `src/config/env.js`.
Frontend env via `VITE_*` vars in `.env` or `constants/config.js` defaults.
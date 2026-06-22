# Budget Tracker — Build Steps

Incremental build plan covering version control, database design, backend, auth, frontend, and documentation. **Complete each step fully, run the Verify checkpoint, then commit** with a conventional message (`feat:`, `fix:`, `chore:`, `docs:`) before moving on.

Close the matching GitHub issue when the step is verified.

> **Week 2 note:** Formal automated testing is not required — manual Verify checkpoints are sufficient. Endpoint/unit tests are covered in Week 3.

---

## Step 0 — GitHub Classroom & repository bootstrap

**Requirement:** §1 Version Control & CI/CD Setup

**Goal:** Accept the assignment, initialize the project skeleton, and establish secrets hygiene.

**Tasks:**

- Accept assignment via GitHub Classroom: https://classroom.github.com/a/nUSqhsBz
- Clone the Classroom repository; configure Git and SSH keys if needed
- Initialize repo structure: `client/` (Vite + React), `server/` (Express)
- Add root `.gitignore` (`.env`, `node_modules/`, `dist/`, `.netlify/`, etc.)
- Add `server/.env.example` and `client/.env.example` with placeholder variables
- Add `PLAN.md`, `BUILD_STEPS.md`, and stub `README.md`
- Create GitHub project board and issues for Steps 0–16

**Verify:**

- [ ] Assignment accepted; repo cloned and remote configured
- [ ] `git status` shows no secrets tracked
- [ ] Both apps have `package.json` and install without errors
- [ ] Project board exists with issues linked to this doc

**Commit:** `chore: bootstrap monorepo and planning docs`

---

## Step 1 — Database design documentation

**Requirement:** §2 Database Design

**Goal:** Document the data model, ERD, and design decisions before implementation.

**Tasks:**

- Finalize collections: `users`, `categories`, `transactions` (see `PLAN.md`)
- Create `docs/DATA_MODEL.md` with schema tables and Mermaid ERD
- Document key design decisions (MongoDB choice, per-user isolation, category model, etc.)
- Note read/write scope: all queries filtered by `userId` (custom backend equivalent of BaaS permissions)

**Verify:**

- [ ] ERD shows relationships between User, Category, and Transaction
- [ ] Each collection has field types, constraints, and indexes documented
- [ ] Design decisions table explains *why*, not just *what*

**Commit:** `docs: add data model, ERD, and design decisions`

---

## Step 2 — Express server foundation

**Requirement:** §3 Backend & Data Access

**Goal:** Minimal API server runs locally.

**Tasks:**

- Install Express, cors, dotenv, morgan
- Create `server/index.js` (or `server/src/index.js`) with health route `GET /api/health`
- Add `npm run dev` with nodemon
- Read `PORT` and `MONGODB_URI` from `.env`

**Verify:**

- [ ] `npm run dev` starts server on configured port
- [ ] `curl http://localhost:5000/api/health` returns `{ "status": "ok" }`

**Commit:** `chore: add Express server with health endpoint`

---

## Step 3 — MongoDB connection

**Requirement:** §3 Backend & Data Access

**Tasks:**

- Install Mongoose
- Create `server/config/db.js` connection helper
- Connect on server startup; log success/failure
- Create free MongoDB Atlas cluster and database user
- Store `MONGODB_URI` in local `.env` only

**Verify:**

- [ ] Server logs successful MongoDB connection
- [ ] Disconnect URI → server reports connection error gracefully

**Commit:** `feat: connect Express to MongoDB Atlas`

---

## Step 4 — User model and registration

**Requirement:** §4 Authentication System

**Tasks:**

- Install bcryptjs, jsonwebtoken, express-validator
- Create `User` model (`email`, `password`, `name`)
- `POST /api/auth/register` — validate input, hash password, save user
- Return 409 if email exists; never return password hash in JSON

**Verify:**

- [ ] Register via Postman/curl creates document in Atlas `users` collection
- [ ] Password in DB is bcrypt hash, not plaintext
- [ ] Duplicate email returns appropriate error

**Commit:** `feat: add user registration with bcrypt`

---

## Step 5 — Login and JWT auth middleware

**Requirement:** §4 Authentication System

**Tasks:**

- `POST /api/auth/login` — verify credentials, issue JWT
- `GET /api/auth/me` — return current user (protected)
- Create `authenticate` middleware (read `Authorization: Bearer <token>` or httpOnly cookie)
- `POST /api/auth/logout` (optional: client-side token clear is enough for MVP)

**Verify:**

- [ ] Login returns token; `/api/auth/me` works with token
- [ ] `/api/auth/me` without token returns 401
- [ ] Invalid token returns 401

**Commit:** `feat: add JWT login and auth middleware`

---

## Step 6 — Category CRUD API

**Requirement:** §3 Backend & Data Access

**Tasks:**

- Create `Category` model (`userId`, `name`, `color`)
- Routes: `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id`
- Scope all queries by `req.user.id`
- Seed default categories on first login or register (optional)

**Verify:**

- [ ] Create category with valid token → 201
- [ ] List returns only current user's categories
- [ ] Update/delete another user's category ID → 403 or 404
- [ ] Requests without token on POST/PUT/DELETE → 401

**Commit:** `feat: add category CRUD API`

---

## Step 7 — Transaction CRUD API

**Requirement:** §3 Backend & Data Access

**Tasks:**

- Create `Transaction` model (`userId`, `categoryId`, `amount`, `description`, `date`)
- Routes: full CRUD on `/api/transactions`
- Validate `categoryId` belongs to same user
- Support query params: `?startDate=&endDate=&categoryId=`

**Verify:**

- [ ] Create transaction linked to valid category
- [ ] List/filter returns correct user's data only
- [ ] Update amount and date persists in MongoDB
- [ ] Delete removes document
- [ ] Unauthenticated POST/PUT/DELETE → 401

**Commit:** `feat: add transaction CRUD API`

---

## Step 8 — Analytics API

**Requirement:** §3 Backend & Data Access (optional server-side logic)

**Tasks:**

- `GET /api/analytics/summary` — total spend, count, top category (date range optional)
- `GET /api/analytics/by-category` — array `{ category, total, color }`
- `GET /api/analytics/over-time` — array `{ period, total }` (daily default)
- Use MongoDB aggregation pipelines; scope by `userId`

**Verify:**

- [ ] After seeding test transactions, summary totals are correct
- [ ] by-category sums match manual calculation
- [ ] over-time buckets align with transaction dates
- [ ] No auth → 401

**Commit:** `feat: add analytics aggregation endpoints`

---

## Step 9 — React app shell (Vite + Tailwind)

**Requirement:** §5 Frontend Integration

**Tasks:**

- `npm create vite@latest client -- --template react`
- Install and configure Tailwind CSS
- Install React Router, axios (or fetch wrapper)
- Create `services/api.js` with base URL from `VITE_API_URL`
- Pages: placeholder `Login`, `Register`, `Dashboard`
- Add proxy or CORS note for local dev

**Verify:**

- [ ] `npm run dev` opens React app
- [ ] Tailwind utility classes render (e.g. styled heading)
- [ ] Navigation between placeholder pages works

**Commit:** `feat: scaffold React client with Tailwind and routing`

---

## Step 10 — Auth UI and protected routes

**Requirement:** §4 Authentication System · §5 Frontend Integration

**Tasks:**

- Build `Register` and `Login` forms with client-side validation
- `AuthContext` stores user + token (memory/localStorage per your security choice)
- Attach token to API requests via interceptor
- `ProtectedRoute` redirects anonymous users to `/login`
- Show login prompt when anonymous user attempts a write action

**Verify:**

- [ ] Register → auto-login or redirect to login → dashboard
- [ ] Invalid credentials show error message
- [ ] Visiting `/dashboard` logged out redirects to `/login`
- [ ] Logout clears session and blocks dashboard

**Commit:** `feat: add auth UI and protected routes`

---

## Step 11 — Dashboard: expenses and categories UI

**Requirement:** §5 Frontend Integration

**Tasks:**

- Summary stat cards (fetch `/api/analytics/summary`)
- `ExpenseForm` — amount, category dropdown, date, description → `POST /api/transactions`
- `TransactionList` — list with edit modal and delete confirm
- Category manager (inline or modal) wired to category API
- Loading and error states

**Verify:**

- [ ] Add expense → appears in list and in MongoDB
- [ ] Edit transaction updates UI and DB
- [ ] Delete removes from list
- [ ] Category dropdown shows user's categories
- [ ] Logged-out user cannot submit form (redirect or disabled + prompt)

**Commit:** `feat: add dashboard expense form and transaction list`

---

## Step 12 — Charts

**Requirement:** §5 Frontend Integration

**Tasks:**

- Install Chart.js + react-chartjs-2 (or Recharts)
- `SpendingByCategoryChart` — pie/donut from `/api/analytics/by-category`
- `SpendingOverTimeChart` — line/bar from `/api/analytics/over-time`
- Date range filter (e.g. this week / this month) refreshes charts and list
- Use category colors from API

**Verify:**

- [ ] Charts render with real data after adding expenses
- [ ] Adding/editing/deleting transaction updates charts
- [ ] Empty state shown when no transactions
- [ ] Charts responsive on mobile width

**Commit:** `feat: add spending visualization charts`

---

## Step 13 — Error handling, polish, and API hardening

**Requirement:** §3 Backend & Data Access (error handling and validation)

**Tasks:**

- Central Express error handler middleware
- Input validation on all routes (express-validator)
- 404 handler for unknown API routes
- Frontend toast or inline errors for API failures
- Consistent date/currency formatting (`$12.34`, locale dates)

**Verify:**

- [ ] Invalid payload returns 400 with clear message
- [ ] Network failure shows user-friendly error on frontend
- [ ] No unhandled promise rejections in server logs during normal use

**Commit:** `fix: improve validation and error handling`

---

## Step 14 — CI/CD pipeline with automatic deployment

**Requirement:** §1 Version Control & CI/CD Setup

**Tasks:**

- Add `.github/workflows/ci.yml`
- Jobs: install `server` + `client` deps, lint (if configured), build client
- Configure hosting: MongoDB Atlas, backend (Render/Railway), frontend (Netlify/Vercel)
- Configure **automatic deployment on push to `main`**
- Store deploy tokens and secrets in GitHub repository secrets (not in code)
- Push code to GitHub Classroom repository

**Verify:**

- [ ] Push to branch triggers workflow
- [ ] Workflow passes on `main`
- [ ] Push to `main` triggers automatic deployment
- [ ] Deployed URLs are reachable after push

**Commit:** `chore: add CI/CD pipeline with deploy on push to main`

---

## Step 15 — Documentation

**Requirement:** §6 Documentation

**Tasks:**

- Expand `README.md`: project overview (problem + solution), screenshots, prerequisites, clone/install/run, env table, live URL
- Ensure `docs/DATA_MODEL.md` is current (schema, ERD, design decisions)
- `docs/ARCHITECTURE.md` — how frontend, Express backend, and MongoDB fit together
- `docs/USAGE.md` — register, log in, add/edit/delete expenses, read charts
- `docs/DEPLOYMENT.md` — Atlas, backend host, frontend host, CI/CD deploy flow
- Ensure `.env.example` files are complete and accurate

**Verify:**

- [ ] New developer can follow README and run app locally
- [ ] All six documentation areas are covered
- [ ] ERD matches implemented Mongoose models
- [ ] Live deployed URL appears in README

**Commit:** `docs: add architecture, usage, and deployment guides`

---

## Step 16 — Deploy verification and smoke test

**Requirement:** §1 Version Control & CI/CD · Required practices (verify before deploy)

**Goal:** Test locally, then smoke-test the live URL before final submission.

**Tasks:**

- Confirm MongoDB Atlas, backend host, and frontend host are configured (from Step 14)
- Configure CORS on backend for production frontend origin
- Add deployed URL to README

**Verify (local first, then live):**

- [ ] Local happy path: register → login → CRUD → charts
- [ ] Local auth check: anonymous write blocked; user prompted to log in
- [ ] Production smoke test: same flow on deployed URL
- [ ] No secrets in repository

**Commit:** `chore: verify production deployment`

---

## Step 17 — Demo video and final review

**Requirement:** Deliverables · Evaluation Criteria

**Tasks:**

- Record 2–3 minute demo: **registration, login, and CRUD operations** (required in deliverables)
- Include chart visualization and auth protection demo
- Close all completed GitHub issues
- Move backlog items (OAuth, budgets, cloud functions, etc.) to Backlog column
- Final README check for deployed URL and documentation links

**Verify:**

- [ ] Demo shows registration, login, and full CRUD
- [ ] All MVP issues closed on project board
- [ ] Project deliverables and evaluation criteria satisfied

**Commit:** `docs: add demo link and finalize README` (if needed)

---

## Quick reference — environment variables

### Server (`server/.env`)

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=<long-random-string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client (`client/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

---

## Backlog (post-MVP issues)

- Google OAuth login
- Monthly budget caps with warning badges
- Recurring expenses
- CSV export
- Dark mode toggle
- Cloud functions / scheduled jobs (optional server-side logic per §3)


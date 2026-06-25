# Budget Tracker — Project Plan

## Concept

**Budget Tracker** is a full-stack web application that helps users record daily expenses, organize spending by category, and understand their habits through a visual dashboard. Users register and log in, then add, edit, and delete transactions. Charts summarize spending over time and by category so patterns are easy to see at a glance. **Week 3** adds AI-powered category suggestions while typing expenses and plain-English spending insights on the dashboard.

## Goals

- Give users a simple way to log daily expenses from a dashboard
- Support custom or predefined spending categories
- Show spending trends and category breakdowns with charts
- Secure all write operations behind authentication
- Meet Week 2 course deliverables: version control, database design, backend CRUD, auth, frontend integration, documentation, CI/CD deployment, and demo readiness
- Meet Week 3 deliverables: two server-side AI features (Gemini), incremental build with verify checkpoints, cost documentation, and production smoke tests

## Requirements Alignment

This plan maps to six core project areas:

| Requirement section | How this project addresses it |
|--------------------|-------------------------------|
| **1. Version Control & CI/CD** | GitHub Classroom repo, conventional commits, GitHub Actions CI + deploy on push to `main` |
| **2. Database Design** | MongoDB collections (`users`, `categories`, `transactions`), ERD, documented design decisions |
| **3. Backend & Data Access** | Custom Express.js API with Mongoose (BaaS is an optional alternative; we use a custom backend) |
| **4. Authentication** | JWT + bcrypt registration/login; middleware protects all write routes |
| **5. Frontend Integration** | React + Tailwind dashboard, auth forms, user-scoped data, auth state via context |
| **6. Documentation** | README + `docs/` covering overview, design, architecture, setup, usage, deployment |
| **7. AI Integration (Week 3)** | Google Gemini via server-side `aiService.js`; category suggestion + spending insights; rate limiting; `docs/COST_ANALYSIS.md` |

> **Note:** Formal automated testing (test cases, endpoint testing) is **not required** for Week 2 — covered in Week 3. Manual Verify checkpoints in `BUILD_STEPS.md` are sufficient (Steps 0–28).

## Tech Stack

| Layer      | Technology |
|-----------|------------|
| Frontend  | React.js, Tailwind CSS, React Router, Chart.js (or Recharts) |
| Backend   | Express.js, Node.js |
| Database  | MongoDB (Atlas) with Mongoose ODM |
| Auth      | JWT (httpOnly cookie or Authorization header) + bcrypt password hashing |
| Tooling   | Vite (React), ESLint, dotenv |
| CI/CD     | GitHub Actions (lint, build) + automatic deploy on push to `main` |
| Deploy    | Frontend: Netlify or Vercel · Backend: Render or Railway · DB: MongoDB Atlas |
| AI        | Google Gemini `gemini-2.0-flash` via `@google/generative-ai` (server-side only) |
| VCS       | GitHub Classroom — https://classroom.github.com/a/nUSqhsBz |

## Scope

### In scope (MVP — Week 2)

- User registration and login
- Protected routes and API endpoints (anonymous users can view prompts to log in; mutations require auth)
- **Transactions (expenses):** create, read, update, delete
  - Fields: amount, description, category, date, user reference
- **Categories:** create, read, update, delete (per user or system defaults + user overrides)
- **Dashboard**
  - Summary cards (total spent, transaction count, top category)
  - Expense entry form
  - Transaction list with edit/delete
  - Charts: spending by category (pie/donut), spending over time (line/bar)
- Environment-based configuration (`.env` / `.env.example`)
- API documentation in README
- ERD and schema documentation

### In scope (Week 3 — AI features)

- **Smart category suggestion** — debounced AI classification while typing an expense description, with keyword fallback when Gemini is unavailable
- **AI spending insights** — button-triggered plain-English summary of spending for the selected date range (3–5 bullets + actionable tip)
- **Server-side Gemini integration** via `aiService.js` — API key in `server/.env` only; never exposed to the React client
- **Per-user AI rate limit** — 30 requests/hour shared across both AI endpoints
- **Insights cache** — in-memory, 1-hour TTL per user/date range (bypass with Regenerate)
- AI documentation in README and `docs/COST_ANALYSIS.md`

### Out of scope (backlog)

- Google OAuth / social login
- AI budget recommendations with monthly caps
- Receipt OCR for auto-fill expense fields
- Streaming insights (SSE)
- Recurring transactions
- Budget limits and alerts
- Multi-currency support
- Receipt image uploads
- Shared household budgets
- Export to CSV/PDF
- Cloud functions / scheduled jobs (optional server-side enhancement)

## Architecture

```
┌─────────────────┐     HTTPS/JSON      ┌─────────────────┐     Mongoose     ┌─────────────────┐
│  React +        │ ◄─────────────────► │  Express API    │ ◄──────────────► │  MongoDB Atlas  │
│  Tailwind       │   /api/auth         │  (REST)         │                  │                 │
│  (Vite)         │   /api/transactions │                 │                  │  users          │
│                 │   /api/categories   │  auth middleware│                  │  categories     │
│  Dashboard +    │   /api/analytics    │  validation     │                  │  transactions   │
│  Charts + AI    │   /api/ai           │  aiRateLimiter  │                  │                 │
└─────────────────┘                     └─────────────────┘                  └─────────────────┘
         │                                       │
         │                                       ▼
         │                              ┌─────────────────┐
         └─────────────────────────────►│  Google Gemini  │
                                        │  (server-side)  │
                                        └─────────────────┘
```

### Frontend structure (planned)

```
client/
├── src/
│   ├── components/     # ExpenseForm, TransactionList, InsightsPanel, charts
│   ├── pages/          # Login, Register, Dashboard
│   ├── context/        # AuthContext
│   ├── hooks/          # useAuth, useCategorySuggestion, useDashboardData
│   ├── services/       # api client (axios/fetch)
│   └── utils/          # formatters, date helpers
```

### Backend structure (planned)

```
server/
├── models/             # User, Category, Transaction
├── routes/             # auth, transactions, categories, analytics, ai
├── middleware/         # authenticate, aiRateLimiter, errorHandler, validate
├── controllers/        # route handlers (including aiController)
├── services/           # aiService (Gemini client)
├── utils/              # aiPrompts, categoryKeywords, insightsCache, analyticsQueries
└── config/             # db connection
```

## Data Model

### Entity Relationship (text ERD)

```
User (1) ──────< (many) Transaction
User (1) ──────< (many) Category
Category (1) ──< (many) Transaction
```

### Collections

#### `users`

| Field        | Type     | Notes                          |
|-------------|----------|--------------------------------|
| `_id`       | ObjectId | Primary key                    |
| `email`     | String   | Unique, required, indexed        |
| `password`  | String   | bcrypt hash, never returned    |
| `name`      | String   | Display name                   |
| `createdAt` | Date     | Timestamps                     |
| `updatedAt` | Date     | Timestamps                     |

#### `categories`

| Field        | Type     | Notes                                    |
|-------------|----------|------------------------------------------|
| `_id`       | ObjectId | Primary key                              |
| `userId`    | ObjectId | Ref `User`, indexed                      |
| `name`      | String   | e.g. Food, Transport, Entertainment      |
| `color`     | String   | Hex color for charts (optional)          |
| `createdAt` | Date     | Timestamps                               |
| `updatedAt` | Date     | Timestamps                               |

Unique compound index: `{ userId: 1, name: 1 }`

#### `transactions`

| Field        | Type     | Notes                              |
|-------------|----------|--------------------------------------|
| `_id`       | ObjectId | Primary key                          |
| `userId`    | ObjectId | Ref `User`, indexed                  |
| `categoryId`| ObjectId | Ref `Category`, indexed              |
| `amount`    | Number   | Positive expense amount              |
| `description`| String  | Optional memo                        |
| `date`      | Date     | Expense date (default: today)        |
| `createdAt` | Date     | Timestamps                           |
| `updatedAt` | Date     | Timestamps                           |

Indexes: `{ userId: 1, date: -1 }`, `{ userId: 1, categoryId: 1 }`

### Design decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data store | MongoDB (NoSQL) | Flexible schema for expenses; pairs naturally with Express + Mongoose |
| Backend approach | Custom Express API | Full control over auth, validation, and analytics aggregations (BaaS is an optional alternative) |
| User data isolation | `userId` on every collection | Enforces per-user read/write scope in the data-access layer |
| Categories per user | Separate `categories` collection | Users can customize labels/colors without affecting others |
| Expense date vs. createdAt | Dedicated `date` field | Supports back-dated entries; `createdAt` tracks record creation |
| Auth mechanism | JWT + bcrypt | Stateless API auth; passwords hashed before storage (not plaintext) |
| Analytics | Server-side aggregation | Keeps chart logic off the client; reduces data transfer |
| AI provider | Google Gemini Flash (`gemini-2.0-flash`) | Free tier; fast JSON responses; server-side only |
| AI key storage | `GEMINI_API_KEY` in server `.env` | Never in client or `VITE_*` vars; committed placeholder in `.env.example` |
| AI rate limiting | In-memory per-user counter (30/hr) | Prevents abuse; shared across both AI endpoints |
| Category suggestion fallback | Keyword map (`categoryKeywords.js`) | Zero-cost fallback when Gemini is down or rate-limited |
| Insights payload | Compact aggregated summary (~200 tokens) | Sends analytics bundle, not raw transactions |
| Insights cache | In-memory Map, 1h TTL | Reduces API cost; Regenerate bypasses cache |

## API Endpoints (planned)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/api/auth/register` | No | Create account |
| POST   | `/api/auth/login` | No | Login, return JWT |
| POST   | `/api/auth/logout` | Yes | Clear session/token |
| GET    | `/api/auth/me` | Yes | Current user profile |
| GET    | `/api/categories` | Yes | List user's categories |
| POST   | `/api/categories` | Yes | Create category |
| PUT    | `/api/categories/:id` | Yes | Update category |
| DELETE | `/api/categories/:id` | Yes | Delete category |
| GET    | `/api/transactions` | Yes | List transactions (filters: date range, category) |
| POST   | `/api/transactions` | Yes | Create expense |
| GET    | `/api/transactions/:id` | Yes | Get one transaction |
| PUT    | `/api/transactions/:id` | Yes | Update transaction |
| DELETE | `/api/transactions/:id` | Yes | Delete transaction |
| GET    | `/api/analytics/summary` | Yes | Totals, counts, top category |
| GET    | `/api/analytics/by-category` | Yes | Aggregated spend per category |
| GET    | `/api/analytics/over-time` | Yes | Daily/weekly/monthly totals |
| POST   | `/api/ai/suggest-category` | Yes | Suggest category from expense description |
| POST   | `/api/ai/spending-insights` | Yes | Generate plain-English spending summary for date range |

## Authentication & Security

- Passwords hashed with bcrypt (cost factor ≥ 10) — secure storage handled in our custom backend (BaaS providers handle this automatically if that route is chosen)
- JWT signed with secret from `JWT_SECRET` (never committed)
- All `POST`, `PUT`, `PATCH`, `DELETE` on protected resources require valid token (including `/api/ai/*`)
- Users may only access their own categories and transactions (`userId` check on every query — equivalent to BaaS read/write permissions)
- Anonymous users prompted to log in before any write/mutation action; AI hooks disabled on client when logged out
- CORS configured for frontend origin only in production
- Rate limiting on AI routes (30 req/hour per user via `aiRateLimiter`)
- `GEMINI_API_KEY` stored in server `.env` only; never committed or sent to the browser
- `.env` in `.gitignore`; `.env.example` committed with placeholder keys; `.netlify/` and `.vercel/` ignored

## UI / UX Overview

1. **Login / Register** — Simple forms, link between pages, show validation errors
2. **Dashboard** — Default landing after login
   - Header with user name and logout
   - Quick-add expense form (amount, category, date, description)
   - **AI category suggestion** chip below description field (debounced, Accept/Dismiss)
   - Summary stat cards
   - **AI spending insights** card (Generate / Regenerate; clears on date range change)
   - Two charts: category breakdown + spending over time
   - Scrollable transaction table with edit/delete actions
3. **Categories** — Inline management or modal (name + color)
4. **Anonymous state** — Redirect to login when attempting writes; dashboard read-only or login wall; no AI API calls

## GitHub Issues & Project Board

Map each build step (see `BUILD_STEPS.md`, Steps 0–28) to a GitHub issue. Suggested columns:

| Column    | Purpose |
|-----------|---------|
| Backlog   | OAuth, receipt OCR, streaming insights, budgets, exports, etc. |
| To Do     | Next build steps |
| In Progress | Current step |
| Done      | Verified and merged |

Week 2 issues map to Steps 0–16; Week 3 AI issues map to Steps 18–27; Step 28 is demo and final review. Use `scripts/create-github-issues.sh` or `gh issue create`. Close each issue when its Verify checkpoint passes.

## Documentation Deliverables

Documentation must include at minimum:

| Requirement | Location | Contents |
|-------------|----------|----------|
| **Project overview** — what the app does and the problem it solves | `README.md` | Budget tracking problem statement, features, screenshots |
| **Design documentation** — data model/schema, ERD, key design decisions | `docs/DATA_MODEL.md` | Schema tables, Mermaid ERD, design decisions table |
| **Architecture overview** — how frontend, backend, and database fit together | `docs/ARCHITECTURE.md` | System diagram, request flow, auth flow |
| **Installation & setup** — prerequisites, clone, install, `.env`, run locally | `README.md` | Step-by-step local dev instructions, env var table |
| **Usage guide** — register, log in, exercise CRUD features | `docs/USAGE.md` | Walkthrough of main user flows |
| **Deployment notes** — how deployed and live URL | `docs/DEPLOYMENT.md` + `README.md` | Atlas, backend host, frontend host, public URL |
| **AI cost analysis** — token usage and estimated cost | `docs/COST_ANALYSIS.md` | Per-feature token estimates; Gemini free-tier totals |

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

- Trigger on push and pull request to `main`
- Jobs: install dependencies, lint (if configured), build client
- **Deploy on push to `main`** — automatic deployment to hosting platforms (tokens stored as GitHub secrets)
- Manual Verify checkpoints replace formal automated tests for Week 2

## Demo Video Checklist (2–3 min)

1. Register a new user
2. Log in
3. Create categories (if separate flow)
4. Add daily expenses
5. Edit and delete a transaction
6. Show dashboard charts updating
7. Demonstrate AI category suggestion (type description → Accept chip)
8. Generate AI spending insights for current date range
9. Log out and show write action blocked for anonymous user

## Success Criteria

Aligned with project deliverables and evaluation criteria:

**Deliverables**
- [ ] GitHub Classroom repository with clean commit history
- [ ] Deployed application URL
- [ ] `PLAN.md` and `BUILD_STEPS.md` in repo
- [ ] GitHub issues / project board reflecting build progress (Steps 0–28)
- [ ] Demo video (2–3 min): registration, login, CRUD operations, and AI features
- [ ] Full documentation (overview, design/ERD, architecture, setup, usage, deployment, AI cost analysis)

**Evaluation**
- [ ] Meaningful conventional commits after each verified step
- [ ] `BUILD_STEPS.md` followed with Verify checkpoints before moving on (Steps 0–28)
- [ ] CI/CD pipeline functional with deploy on push to `main`
- [ ] Data model well designed and documented with ERD
- [ ] Auth secure and functional; protects all write actions and AI endpoints; anonymous users prompted to log in
- [ ] CRUD operations work correctly against MongoDB
- [ ] Frontend communicates with Express backend
- [ ] Charts render real data from database
- [ ] Two AI features functional (category suggestion + spending insights)
- [ ] `GEMINI_API_KEY` server-side only; secrets not in git; `.env` ignored; `.env.example` committed
- [ ] Local verify and production smoke test passed before final submission (Step 27)
- [ ] Code clean and well-documented

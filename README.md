# Budget Tracker

A full-stack expense tracking web app that helps you log daily spending, organize it by category, and understand habits through a visual dashboard.

**Live demo:** [https://budgetcash.netlify.app](https://budgetcash.netlify.app)

**Youtube Demo Link:** [https://youtu.be/p4nDjpiis7s](https://youtu.be/p4nDjpiis7s)

Deployment verified — see [docs/VERIFICATION.md](docs/VERIFICATION.md) for smoke-test checklist and results.

---

## Problem and solution

Tracking everyday expenses in a spreadsheet or notes app makes it hard to see patterns. Budget Tracker gives you a single dashboard to:

- Register and log in securely
- Add, edit, and delete expenses with amount, category, date, and description
- Manage custom spending categories with chart colors
- View summary stats and charts (spending by category and over time)
- Filter data by date range (this week, this month, or all time)
- **AI category suggestion** while typing an expense description (debounced)
- **AI spending insights** — plain-English summary for the selected date range

All data is scoped to the logged-in user. Anonymous users cannot create or modify records.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), Tailwind CSS, React Router, Chart.js |
| Backend | Express.js, Node.js |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT (`Authorization: Bearer`) + bcrypt |
| AI | Google Gemini (`gemini-2.5-flash`, server-side only) |
| CI/CD | GitHub Actions → Netlify (frontend) + Render (API) |

## Prerequisites

- **Node.js** 20+ and npm
- **MongoDB Atlas** cluster (free tier) with a database user
- **Git** for cloning the repository

Optional for deployment: Netlify account, Render account, GitHub repository secrets.

## Installation and local development

### 1. Clone the repository

```bash
git clone https://github.com/FAU-AI-HootCamp-Summer-2026/week3-zjerome2023.git
cd week3-zjerome2023
```

### 2. Configure environment variables

**Server** — copy and edit:

```bash
cd server
cp .env.example .env
```

**Client** — copy and edit:

```bash
cd ../client
cp .env.example .env
```

See the [environment variables](#environment-variables) table below.

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Run the apps

In one terminal (API):

```bash
cd server
npm run dev
```

In another terminal (React client):

```bash
cd client
npm run dev
```

- API: [http://localhost:5001](http://localhost:5001) — health check at `/api/health`
- Client: [http://localhost:5173](http://localhost:5173)

The Express API enables CORS for `CLIENT_URL` (default `http://localhost:5173`). The client sends requests to `VITE_API_URL` (default `http://localhost:5001/api`).

### 5. Verify locally

```bash
curl http://localhost:5001/api/health
# {"status":"ok"}
```

Open the client, register a new account, and add an expense on the dashboard.

### 6. Run API tests

```bash
cd server
npm test
```

See [docs/API_TESTING.md](docs/API_TESTING.md) for automated and manual test cases. Import [docs/postman/Budget-Tracker.postman_collection.json](docs/postman/Budget-Tracker.postman_collection.json) into Postman or Thunder Client.

## Environment variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default `5001`) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs (long random string) |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `7d`) |
| `CLIENT_URL` | Yes (prod) | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `NODE_ENV` | No | `development` or `production` |
| `GEMINI_API_KEY` | Yes (AI) | Google AI Studio API key — **server only**, never in client |
| `AI_MODEL` | No | Gemini model (default `gemini-2.5-flash`) |
| `AI_RATE_LIMIT_WINDOW_MS` | No | Per-user AI rate-limit window (default `3600000` = 1 hour) |
| `AI_RATE_LIMIT_MAX` | No | Max AI requests per user per window (default `30`) |

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | API base URL (e.g. `http://localhost:5001/api`) |

Committed templates: `server/.env.example`, `client/.env.example`. Never commit `.env` files.

## AI features

Both AI features call Google Gemini **from the Express server only**. The API key is stored in `server/.env` as `GEMINI_API_KEY` and is never exposed to the browser or any `VITE_*` variable.

### 1. Smart category suggestion

While adding an expense, type a description (3+ characters). After a 500 ms debounce, the form shows a **Suggested: {category}** chip with **Accept** / **Dismiss**. Accept fills the category dropdown. If Gemini is unavailable, the server falls back to keyword matching or returns no suggestion — the form always remains submittable.

### 2. AI spending insights

On the dashboard, click **Generate insights** for the current date range (this week / this month / all time). The panel shows 3–5 bullet insights plus an actionable tip. **Regenerate** fetches fresh insights (`forceRefresh`). Results are cached for **1 hour** per user and date range. Empty periods show a friendly message without calling Gemini.

### Local Gemini setup

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Add to `server/.env` (see `server/.env.example`):

   ```
   GEMINI_API_KEY=<your-key>
   AI_MODEL=gemini-2.5-flash
   ```

3. Restart the API (`npm run dev` in `server/`).
4. For production, set `GEMINI_API_KEY` and `AI_MODEL` in the Render dashboard (not in git).

### Rate limits and cache

| Control | Value | Notes |
|---------|-------|-------|
| Server rate limit | 30 req/hour per user | Shared across both `/api/ai/*` endpoints (`AI_RATE_LIMIT_MAX`) |
| Insights cache | 1 hour TTL | In-memory; Regenerate bypasses with `forceRefresh: true` |
| Client debounce | 500 ms | Category suggestion only |

### Testing with Postman or curl

1. `POST /api/auth/login` → copy `token`.
2. Add header: `Authorization: Bearer <token>`.
3. Call `POST /api/ai/suggest-category` with body `{ "description": "Whole Foods groceries" }`.
4. Call `POST /api/ai/spending-insights` with body `{ "startDate": "2026-06-01", "endDate": "2026-06-25", "dateRangeLabel": "This month" }`.

Full request/response examples and token cost estimates: [docs/COST_ANALYSIS.md](docs/COST_ANALYSIS.md).

## API overview

All protected routes require `Authorization: Bearer <token>` (or httpOnly `token` cookie set on login).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login; returns JWT |
| POST | `/api/auth/logout` | Yes | Clear session cookie |
| GET | `/api/auth/me` | Yes | Current user profile |
| GET | `/api/categories` | Yes | List user's categories |
| POST | `/api/categories` | Yes | Create category |
| PUT | `/api/categories/:id` | Yes | Update category |
| DELETE | `/api/categories/:id` | Yes | Delete category |
| GET | `/api/transactions` | Yes | List transactions (`?startDate=&endDate=&categoryId=`) |
| POST | `/api/transactions` | Yes | Create expense |
| GET | `/api/transactions/:id` | Yes | Get one transaction |
| PUT | `/api/transactions/:id` | Yes | Update transaction |
| DELETE | `/api/transactions/:id` | Yes | Delete transaction |
| GET | `/api/analytics/summary` | Yes | Total spend, count, top category |
| GET | `/api/analytics/by-category` | Yes | Spend per category |
| GET | `/api/analytics/over-time` | Yes | Totals over time (`?groupBy=day\|week\|month`) |
| POST | `/api/ai/suggest-category` | Yes | Suggest category from expense description |
| POST | `/api/ai/spending-insights` | Yes | Generate plain-English spending summary |
| GET | `/api/health` | No | `{ "status": "ok" }` |

## Project structure

```
week3-zjerome2023/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # Forms, charts, lists
│       ├── context/        # Auth and toast providers
│       ├── hooks/          # useAuth, useDashboardData
│       ├── pages/          # Login, Register, Dashboard
│       ├── services/       # Axios API client
│       └── utils/          # Formatters, date helpers
├── server/                 # Express API
│   ├── config/             # MongoDB connection
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, validation, errors, AI rate limit
│   ├── models/             # User, Category, Transaction
│   ├── routes/             # API route definitions
│   ├── services/           # aiService (Gemini client)
│   └── utils/              # Analytics, AI prompts, cache
├── docs/                   # Design, architecture, usage, deployment
├── .github/workflows/      # CI/CD pipeline
├── PLAN.md                 # Project plan and requirements
└── BUILD_STEPS.md          # Incremental build checklist
```

## Documentation

| Document | Contents |
|----------|----------|
| [PLAN.md](PLAN.md) | Goals, scope, tech stack, requirements alignment |
| [BUILD_STEPS.md](BUILD_STEPS.md) | Step-by-step build and verify checklist |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Schema, ERD, indexes, design decisions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, request and auth flows |
| [docs/USAGE.md](docs/USAGE.md) | User guide: register, CRUD, charts |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Atlas, Render, Netlify, CI/CD deploy flow |
| [docs/API_TESTING.md](docs/API_TESTING.md) | Automated + manual test cases, request/response examples, Postman collection |
| [docs/COST_ANALYSIS.md](docs/COST_ANALYSIS.md) | AI token/cost estimates, Postman/curl examples |
| [docs/VERIFICATION.md](docs/VERIFICATION.md) | Deployment smoke-test checklist and results |

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push and pull requests to `main`:

1. Install server and client dependencies
2. Lint the client
3. Run server API integration tests
4. Build the client

On push to `main`, the workflow also deploys the frontend to Netlify and can trigger a Render backend deploy hook.

### Required GitHub secrets

| Secret | Purpose |
|--------|---------|
| `VITE_API_URL` | Production API URL baked into the client build |
| `NETLIFY_AUTH_TOKEN` | Netlify deploy token |
| `NETLIFY_SITE_ID` | Target Netlify site |
| `RENDER_DEPLOY_HOOK_URL` | Optional Render deploy hook for the API |

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full hosting setup.

## License

ISC (see package manifests).

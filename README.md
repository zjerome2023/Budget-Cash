# Budget Tracker

A full-stack expense tracking web app that helps you log daily spending, organize it by category, and understand habits through a visual dashboard.

**Live demo:** [https://budgetcash.netlify.app](https://budgetcash.netlify.app)

Deployment verified — see [docs/VERIFICATION.md](docs/VERIFICATION.md) for smoke-test checklist and results.

---

## Problem and solution

Tracking everyday expenses in a spreadsheet or notes app makes it hard to see patterns. Budget Tracker gives you a single dashboard to:

- Register and log in securely
- Add, edit, and delete expenses with amount, category, date, and description
- Manage custom spending categories with chart colors
- View summary stats and charts (spending by category and over time)
- Filter data by date range (this week, this month, or all time)

All data is scoped to the logged-in user. Anonymous users cannot create or modify records.

## Screenshots

Save captures to `docs/screenshots/` after running locally. Suggested filenames:

| File | What to capture |
|------|-----------------|
| `dashboard.png` | Dashboard with summary cards, charts, expense form, and transaction list |
| `login.png` | Login page with validation |
| `register.png` | Registration form |
| `categories.png` | Category manager with name and color |

Example embed once images exist:

```markdown
![Dashboard](docs/screenshots/dashboard.png)
```

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), Tailwind CSS, React Router, Chart.js |
| Backend | Express.js, Node.js |
| Database | MongoDB Atlas with Mongoose |
| Auth | JWT (`Authorization: Bearer`) + bcrypt |
| CI/CD | GitHub Actions → Netlify (frontend) + Render (API) |

## Prerequisites

- **Node.js** 20+ and npm
- **MongoDB Atlas** cluster (free tier) with a database user
- **Git** for cloning the repository

Optional for deployment: Netlify account, Render account, GitHub repository secrets.

## Installation and local development

### 1. Clone the repository

```bash
git clone https://github.com/FAU-AI-HootCamp-Summer-2026/week2-zjerome2023.git
cd week2-zjerome2023
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

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | API base URL (e.g. `http://localhost:5001/api`) |

Committed templates: `server/.env.example`, `client/.env.example`. Never commit `.env` files.

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
| GET | `/api/health` | No | `{ "status": "ok" }` |

## Project structure

```
week2-zjerome2023/
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
│   ├── middleware/         # Auth, validation, errors
│   ├── models/             # User, Category, Transaction
│   └── routes/             # API route definitions
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
| [docs/VERIFICATION.md](docs/VERIFICATION.md) | Deployment smoke-test checklist and results |

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on push and pull requests to `main`:

1. Install server and client dependencies
2. Lint the client
3. Build the client

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

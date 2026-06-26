# Budget Tracker — Deployment Verification

Smoke-test results for local development and production (Steps 16 and 27).

## Deployed URLs

| Service | URL |
|---------|-----|
| Frontend (Netlify) | https://budgetcash.netlify.app |
| API (Render) | https://budget-tracker-api-70sh.onrender.com |
| API health | https://budget-tracker-api-70sh.onrender.com/api/health |

## Hosting configuration

| Component | Status | Notes |
|-----------|--------|-------|
| MongoDB Atlas | Configured | Connection via `MONGODB_URI` on Render (not in git) |
| Render API | Live | Health returns `{ "status": "ok" }` |
| Netlify frontend | Live | Serves React build; `VITE_API_URL` points to Render `/api` |
| CORS | Configured | `CLIENT_URL=https://budgetcash.netlify.app` on Render; preflight allows Netlify origin |
| GitHub Actions | Configured | CI lint/build; deploy on push to `main` |
| Gemini AI | Local verified | Set `GEMINI_API_KEY` + `AI_MODEL` on Render for production AI |

## Verify checklist

### Local (MVP — Step 16)

| Check | Result |
|-------|--------|
| `npm test` in `server/` (26 integration tests) | Pass |
| `GET /api/health` returns ok | Pass |
| Register → login | Pass |
| Create / update / delete category | Pass |
| Create / update / delete transaction | Pass |
| Analytics endpoints return data | Pass |
| Anonymous `POST /api/transactions` → 401 | Pass |
| `/dashboard` without session redirects to `/login` (`ProtectedRoute`) | Pass (client routing) |

### Local (AI — Step 27)

| Check | Result |
|-------|--------|
| Happy path: register → login → add expense | Pass |
| Category suggestion (`POST /api/ai/suggest-category`) returns match | Pass |
| Spending insights (`POST /api/ai/spending-insights`) returns bullets + tip | Pass |
| `POST /api/ai/suggest-category` without token → 401 | Pass |
| `POST /api/ai/spending-insights` without token → 401 | Pass |
| Auth UI: `ExpenseForm` / `InsightsPanel` disabled when logged out (no AI calls) | Pass (code review) |
| Login prompt on anonymous write actions | Pass (`useRequireAuth`) |

### Production

| Check | Result |
|-------|--------|
| Netlify app loads | Pass |
| Client bundle uses production `VITE_API_URL` | Pass (`https://budget-tracker-api-70sh.onrender.com/api`) |
| `GET /api/health` returns ok | Pass |
| CORS preflight from Netlify origin | Pass (`Access-Control-Allow-Origin: https://budgetcash.netlify.app`) |
| Anonymous API writes → 401 | Pass (`/categories`, `/transactions`, `/analytics/*`, `/api/ai/*`) |
| `GEMINI_API_KEY` on Render (not in repo) | **Manual** — add in Render dashboard before production AI smoke test |
| Manual UI: category suggestion chip on live site | **Manual** — after merge to `main` + deploy |
| Manual UI: generate insights on live site | **Manual** — after `GEMINI_API_KEY` set on Render |

### Secrets hygiene

| Check | Result |
|-------|--------|
| `.env` in `.gitignore` | Pass |
| `server/.env` and `client/.env` not tracked | Pass |
| No `GEMINI_API_KEY` in `client/` | Pass |
| No real `MONGODB_URI` or `JWT_SECRET` in committed files | Pass |
| `.env.example` uses placeholders only | Pass |

## Manual production UI test

Open https://budgetcash.netlify.app and confirm:

1. **Register** a new account (or log in with an existing one)
2. **Create a category** (name + color)
3. **Add an expense** — appears in the transaction list
4. Type a description → **category suggestion chip** appears (Accept updates dropdown)
5. Click **Generate insights** on the AI spending insights card
6. **Edit and delete** an expense — list and charts update
7. **Change date range** — summary, charts, and insights clear
8. **Log out** — visiting `/dashboard` redirects to `/login`

## Local test commands

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev

# Health
curl http://localhost:5001/api/health

# Anonymous AI (expect 401)
curl -X POST http://localhost:5001/api/ai/suggest-category \
  -H "Content-Type: application/json" \
  -d '{"description":"Whole Foods groceries"}'

curl -X POST http://localhost:5001/api/ai/spending-insights \
  -H "Content-Type: application/json" \
  -d '{"dateRangeLabel":"This month"}'

# Anonymous write (expect 401)
curl -X POST http://localhost:5001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount":10,"categoryId":"665a1b2c3d4e5f6789012345","date":"2026-06-22"}'
```

## Production API checks

```bash
curl https://budget-tracker-api-70sh.onrender.com/api/health

curl -X POST https://budget-tracker-api-70sh.onrender.com/api/ai/suggest-category \
  -H "Content-Type: application/json" \
  -d '{"description":"test"}'
# {"message":"Authentication required"}

curl -X OPTIONS https://budget-tracker-api-70sh.onrender.com/api/transactions \
  -H "Origin: https://budgetcash.netlify.app" \
  -H "Access-Control-Request-Method: POST" -I
```

## Related documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) — hosting setup (includes `GEMINI_API_KEY` on Render)
- [COST_ANALYSIS.md](./COST_ANALYSIS.md) — AI token/cost estimates and API examples
- [API_TESTING.md](./API_TESTING.md) — automated and manual test cases
- [USAGE.md](./USAGE.md) — end-user flows
- [../README.md](../README.md) — live demo link

# Budget Tracker — Deployment Verification (Step 16)

Smoke-test results for local development and production before final submission.

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

## Verify checklist

### Local

| Check | Result |
|-------|--------|
| `GET /api/health` returns ok | Pass |
| Register → login | Pass |
| Create / update / delete category | Pass |
| Create / update / delete transaction | Pass |
| Analytics endpoints return data | Pass |
| Anonymous `POST /api/transactions` → 401 | Pass |
| `/dashboard` without session redirects to `/login` (`ProtectedRoute`) | Pass (client routing) |

### Production

| Check | Result |
|-------|--------|
| Netlify app loads | Pass |
| Client bundle uses production `VITE_API_URL` | Pass (`https://budget-tracker-api-70sh.onrender.com/api`) |
| `GET /api/health` returns ok | Pass |
| CORS preflight from Netlify origin | Pass (`Access-Control-Allow-Origin: https://budgetcash.netlify.app`) |
| Anonymous API writes → 401 | Pass (`/categories`, `/transactions`, `/analytics/*`) |
| Manual UI flow on live site | Register → login → add expense → charts → logout (verify in browser) |

### Secrets hygiene

| Check | Result |
|-------|--------|
| `.env` in `.gitignore` | Pass |
| `server/.env` and `client/.env` not tracked | Pass |
| No real `MONGODB_URI` or `JWT_SECRET` in committed files | Pass |
| `.env.example` uses placeholders only | Pass |

## Manual production UI test

Open https://budgetcash.netlify.app and confirm:

1. **Register** a new account (or log in with an existing one)
2. **Create a category** (name + color)
3. **Add an expense** — appears in the transaction list
4. **Edit and delete** an expense — list and charts update
5. **Change date range** — summary and charts refresh
6. **Log out** — visiting `/dashboard` redirects to `/login`

## Local test commands

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev

# Health
curl http://localhost:5001/api/health

# Anonymous write (expect 401)
curl -X POST http://localhost:5001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount":10,"categoryId":"665a1b2c3d4e5f6789012345","date":"2026-06-22"}'
```

## Production API checks (read-only)

```bash
curl https://budget-tracker-api-70sh.onrender.com/api/health

curl -X OPTIONS https://budget-tracker-api-70sh.onrender.com/api/transactions \
  -H "Origin: https://budgetcash.netlify.app" \
  -H "Access-Control-Request-Method: POST" -I

curl https://budget-tracker-api-70sh.onrender.com/api/categories
# {"message":"Authentication required"}
```

## Related documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) — hosting setup
- [USAGE.md](./USAGE.md) — end-user flows
- [../README.md](../README.md) — live demo link

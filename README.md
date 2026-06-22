# Budget Tracker

Full-stack expense tracking app with React, Express, and MongoDB.

# Status

Steps 0–14 complete. See `PLAN.md` and `BUILD_STEPS.md` for the full build plan.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request to `main`:

- Install server and client dependencies
- Lint the client
- Build the client

On push to `main`, the workflow also deploys the frontend to Netlify and can trigger a Render backend deploy hook.

### Required GitHub secrets

| Secret | Purpose |
|--------|---------|
| `VITE_API_URL` | Production API URL baked into the client build |
| `NETLIFY_AUTH_TOKEN` | Netlify deploy token |
| `NETLIFY_SITE_ID` | Target Netlify site |
| `RENDER_DEPLOY_HOOK_URL` | Optional Render deploy hook for the API |

Configure MongoDB Atlas, Render (`render.yaml`), and Netlify (`netlify.toml`) separately in each host's dashboard.

## Quick start

```bash
# Server
cd server
cp .env.example .env   # fill in values before running the API
npm install

# Client
cd client
cp .env.example .env
npm install
npm run dev
```

## Documentation

- [Project plan](PLAN.md)
- [Build steps](BUILD_STEPS.md)

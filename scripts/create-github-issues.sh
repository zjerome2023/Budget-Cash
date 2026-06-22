#!/usr/bin/env bash
# Create a personal GitHub project board and issues in the repo for BUILD_STEPS.md (Steps 0–16).
# Prerequisites: gh auth login with project scopes (gh auth refresh -s project,read:project)
set -euo pipefail

REPO="FAU-AI-HootCamp-Summer-2026/week2-zjerome2023"
PROJECT_OWNER=$(gh api user -q .login)
PROJECT_TITLE="Budget Tracker"

EXISTING_PROJECT=$(gh project list --owner "$PROJECT_OWNER" --format json \
  | jq -r --arg t "$PROJECT_TITLE" '[.projects[] | select(.title == $t)][0] // empty')

if [[ -n "$EXISTING_PROJECT" ]]; then
  echo "Using existing project board under @$PROJECT_OWNER..."
  PROJECT_JSON="$EXISTING_PROJECT"
else
  echo "Creating project board under @$PROJECT_OWNER..."
  PROJECT_JSON=$(gh project create --owner "$PROJECT_OWNER" --title "$PROJECT_TITLE" --format json)
fi

PROJECT_URL=$(echo "$PROJECT_JSON" | jq -r '.url')
PROJECT_NUMBER=$(echo "$PROJECT_JSON" | jq -r '.number')
echo "Project: $PROJECT_URL"

link_issue() {
  local title="$1"
  local body="$2"
  local issue_url
  issue_url=$(gh issue create --repo "$REPO" --title "$title" --body "$body")
  gh project item-add "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --url "$issue_url"
  echo "  Created: $title"
}

STEPS=(
  "0|GitHub Classroom & repository bootstrap|Step 0 — See BUILD_STEPS.md. Verify repo structure, .gitignore, env examples, planning docs."
  "1|Database design documentation|Step 1 — Create docs/DATA_MODEL.md with ERD and design decisions."
  "2|Express server foundation|Step 2 — Health endpoint GET /api/health, nodemon dev script."
  "3|MongoDB connection|Step 3 — Mongoose connection to Atlas."
  "4|User model and registration|Step 4 — POST /api/auth/register with bcrypt."
  "5|Login and JWT auth middleware|Step 5 — Login, /api/auth/me, authenticate middleware."
  "6|Category CRUD API|Step 6 — Full category routes scoped by userId."
  "7|Transaction CRUD API|Step 7 — Full transaction routes with filters."
  "8|Analytics API|Step 8 — Summary, by-category, over-time aggregation endpoints."
  "9|React app shell (Vite + Tailwind)|Step 9 — Scaffold client with routing and API service."
  "10|Auth UI and protected routes|Step 10 — Register/login forms, AuthContext, ProtectedRoute."
  "11|Dashboard: expenses and categories UI|Step 11 — Expense form, transaction list, category manager."
  "12|Charts|Step 12 — Spending by category and over time charts."
  "13|Error handling, polish, and API hardening|Step 13 — Validation, error handler, frontend error UX."
  "14|CI/CD pipeline with automatic deployment|Step 14 — GitHub Actions + deploy on push to main."
  "15|Documentation|Step 15 — README and docs/ guides."
  "16|Deploy verification and smoke test|Step 16 — Local and production smoke tests."
)

for entry in "${STEPS[@]}"; do
  IFS='|' read -r num title body <<< "$entry"
  link_issue "Step $num: $title" "$body

See [BUILD_STEPS.md](https://github.com/$REPO/blob/main/BUILD_STEPS.md#step-$num)"
done

echo ""
echo "Done. Open project: $PROJECT_URL"

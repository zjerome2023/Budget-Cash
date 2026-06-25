#!/usr/bin/env bash
# Create GitHub issues for BUILD_STEPS.md Steps 18–28 (Week 3 AI features).
# Skips steps that already have an open or closed issue with the same title.
# Prerequisites: gh auth login with project scopes (gh auth refresh -s project,read:project)
set -euo pipefail

REPO="${GITHUB_REPO:-FAU-AI-HootCamp-Summer-2026/week3-zjerome2023}"
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
echo "Repo: $REPO"
echo ""

issue_exists() {
  local title="$1"
  gh issue list --repo "$REPO" --state all --search "in:title \"$title\"" --json title \
    | jq -e --arg t "$title" '[.[] | select(.title == $t)] | length > 0' >/dev/null
}

link_issue() {
  local num="$1"
  local title="$2"
  local body="$3"
  local full_title="Step $num: $title"

  if issue_exists "$full_title"; then
    echo "  Skipped (exists): $full_title"
    return 0
  fi

  local issue_url
  issue_url=$(gh issue create --repo "$REPO" --title "$full_title" --body "$body")
  gh project item-add "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --url "$issue_url"
  echo "  Created: $full_title"
}

STEPS=(
  "18|AI planning and issue setup|Step 18 — Update PLAN.md with AI scope; create issues for Steps 18–28."
  "19|Secrets hygiene for Gemini|Step 19 — GEMINI_API_KEY in server/.env.example; verify .gitignore."
  "20|Shared AI infrastructure|Step 20 — aiService, rate limiter, authenticated /api/ai routes."
  "21|Category suggestion API|Step 21 — POST /api/ai/suggest-category with keyword fallback."
  "22|Category suggestion UI|Step 22 — useCategorySuggestion hook and ExpenseForm chip."
  "23|Extract analytics queries helper|Step 23 — fetchAnalyticsBundle for analytics and insights."
  "24|Spending insights API|Step 24 — POST /api/ai/spending-insights with 1h cache."
  "25|Spending insights UI|Step 25 — InsightsPanel on Dashboard."
  "26|AI documentation|Step 26 — README AI section and docs/COST_ANALYSIS.md."
  "27|Local verify and production deploy|Step 27 — Local happy path + auth; Render env; smoke test."
  "28|Demo video and final review|Step 28 — Record demo with AI features; close all issues; finalize README."
)

for entry in "${STEPS[@]}"; do
  IFS='|' read -r num title body <<< "$entry"
  link_issue "$num" "$title" "$body

See [BUILD_STEPS.md](https://github.com/$REPO/blob/main/BUILD_STEPS.md#step-$num)"
done

echo ""
echo "Done. Open project: $PROJECT_URL"

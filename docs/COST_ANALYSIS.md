# Budget Tracker — AI Cost Analysis

This document estimates token usage and cost for the two Week 3 AI features. Both use **Google Gemini** server-side only (`gemini-2.5-flash` by default). The React client never receives or sends the API key.

## Summary

| Feature | Typical tokens per request | Estimated cost (free tier) | Estimated cost (paid tier)* |
|---------|---------------------------|----------------------------|-----------------------------|
| Smart category suggestion | ~300 input / ~80 output | **$0.00** | ~$0.00005 |
| AI spending insights | ~450 input / ~250 output | **$0.00** | ~$0.00008 |

\* Paid-tier estimates use [Gemini 2.5 Flash pricing](https://ai.google.dev/gemini-api/docs/pricing) ($0.15 / 1M input tokens, $0.60 / 1M output tokens) and are rounded up. Actual usage varies with description length, category count, and insight detail.

**Homework / personal use:** Both features stay at approximately **$0** on the Gemini free tier when used within Google’s published RPM/RPD limits.

## Feature 1 — Smart category suggestion

**Endpoint:** `POST /api/ai/suggest-category`

| Component | Estimate |
|-----------|----------|
| Prompt (categories + description + rules) | 150–400 tokens |
| JSON response (`categoryId`, `confidence`, `reasoning`) | 40–100 tokens |
| **Typical total** | **~300 in / ~80 out** |

**Cost controls in this app:**

- Debounced on the client (500 ms) — reduces duplicate calls while typing
- Keyword fallback when Gemini is unavailable — **0 tokens**
- Server rate limit: **30 requests/hour per user** (shared with insights)

**Usage example (10 expenses/day, ~3 suggestion calls each):** ~30 API calls/day → well within typical free-tier daily limits.

## Feature 2 — AI spending insights

**Endpoint:** `POST /api/ai/spending-insights`

| Component | Estimate |
|-----------|----------|
| Compact analytics payload (~200 tokens target) | 150–300 tokens |
| Summarization prompt + rules | 100–150 tokens |
| JSON response (3–5 bullets + tip) | 150–350 tokens |
| **Typical total** | **~450 in / ~250 out** |

**Cost controls in this app:**

- Button-triggered (not automatic) — user initiates each call
- **1-hour in-memory cache** per user + date range — repeat views cost 0 tokens
- `forceRefresh: true` bypasses cache for Regenerate
- Skips Gemini when `transactionCount === 0`
- Same **30 requests/hour per user** rate limit as category suggestion

**Usage example (5 insight generations/day, 2 cache hits):** ~5 Gemini calls/day → negligible cost on free tier.

## Server-side rate limiting

Configured in `server/.env` (see `server/.env.example`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `AI_RATE_LIMIT_WINDOW_MS` | `3600000` (1 hour) | Rolling window |
| `AI_RATE_LIMIT_MAX` | `30` | Max AI requests per user per window |

This limit applies across **both** `/api/ai/*` endpoints combined.

## Google Gemini free tier (reference)

Free-tier quotas depend on your Google Cloud project and model. Check live limits in [Google AI Studio](https://aistudio.google.com/). As of 2026, Flash-class models on the free tier generally allow hundreds to ~1,500 requests per day — more than enough for development and demo use of this app.

> **Note:** `gemini-2.0-flash` was deprecated in June 2026. Use `AI_MODEL=gemini-2.5-flash` (or newer) in `server/.env`.

## Monthly projection (heavy personal use)

| Scenario | Suggestion calls/mo | Insights calls/mo | Est. tokens/mo | Est. cost (free) |
|----------|--------------------:|------------------:|---------------:|-----------------:|
| Light | 100 | 20 | ~55K | $0 |
| Moderate | 500 | 60 | ~250K | $0 |
| Heavy demo | 2,000 | 200 | ~1M | $0† |

† Still $0 on free tier if within Google’s quotas; paid overflow would be on the order of **cents per month** at Flash pricing.

## Testing API calls (Postman / curl)

All `/api/ai/*` routes require authentication.

### 1. Obtain a JWT

```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "your-password"
}
```

Copy `token` from the response.

### 2. Suggest category

```http
POST {{baseUrl}}/api/ai/suggest-category
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "description": "Whole Foods groceries"
}
```

**Success (200):**

```json
{
  "suggestion": {
    "categoryId": "507f1f77bcf86cd799439011",
    "categoryName": "Groceries",
    "confidence": "high",
    "source": "ai"
  }
}
```

Or `{ "suggestion": null }` when no match. `source` may be `"keyword"` when using the fallback.

**Errors:** `400` (validation), `401` (no token), `429` (rate limit), `502` (AI failure), `503` (missing `GEMINI_API_KEY`).

### 3. Spending insights

```http
POST {{baseUrl}}/api/ai/spending-insights
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "startDate": "2026-06-01",
  "endDate": "2026-06-25",
  "dateRangeLabel": "This month",
  "forceRefresh": false
}
```

**Success with data (200):**

```json
{
  "insights": {
    "bullets": [
      "You spent $142.50 across 8 transactions this month.",
      "Groceries is your top category at 45% of spending.",
      "Spending peaked on June 12 with $38.00 in one day."
    ],
    "tip": "Try setting a weekly grocery cap — your grocery spend is up compared to other categories.",
    "generatedAt": "2026-06-25T12:00:00.000Z",
    "cached": false
  }
}
```

**Empty period (200):**

```json
{
  "insights": null,
  "message": "No transactions in this period. Add expenses to generate insights."
}
```

Set `"forceRefresh": true` to bypass the 1-hour cache (response will have `"cached": false`).

### curl examples

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-password"}' \
  | jq -r '.token')

# Suggest category
curl -X POST http://localhost:5001/api/ai/suggest-category \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Uber ride downtown"}'

# Spending insights
curl -X POST http://localhost:5001/api/ai/spending-insights \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-06-01","endDate":"2026-06-25","dateRangeLabel":"This month"}'
```

Replace `http://localhost:5001` with your Render API URL in production.

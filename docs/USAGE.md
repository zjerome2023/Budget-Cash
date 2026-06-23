# Budget Tracker — Usage Guide

This guide walks through the main user flows: account creation, logging expenses, managing categories, and reading the dashboard charts.

## Getting started

1. Start the API and client locally (see [README.md](../README.md#installation-and-local-development)).
2. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Register a new account

1. Click **Register** in the navigation bar (or go to `/register`).
2. Enter your **name**, **email**, and **password** (minimum 8 characters).
3. Submit the form.

On success you are logged in automatically and redirected to the dashboard. If the email is already registered, an error message appears.

## Log in

1. Go to `/login`.
2. Enter your email and password.
3. Submit the form.

Invalid credentials show an inline error. Successful login redirects to the dashboard.

If you visit `/dashboard` while logged out, you are redirected to the login page.

## Log out

Click **Logout** in the navigation bar. Your session token is cleared and you return to the login page. Write actions (add/edit/delete) are no longer available until you log in again.

## Dashboard overview

After logging in, the dashboard shows:

| Section | Description |
|---------|-------------|
| **Date range filter** | This week, this month, or all time — refreshes stats, charts, and transaction list |
| **Summary cards** | Total spent, transaction count, and top category for the selected range |
| **Spending by category** | Donut chart with category colors |
| **Spending over time** | Bar chart of daily totals |
| **Add expense** | Form: amount, category, date, description |
| **Categories** | Create, edit, and delete your categories |
| **Transactions** | Table with edit and delete actions |

## Add an expense

1. In **Add expense**, enter:
   - **Amount** — positive dollar value (e.g. `12.50`)
   - **Category** — select from the dropdown (create categories first if the list is empty)
   - **Date** — defaults to today; change for back-dated entries
   - **Description** — optional memo
2. Click **Add expense**.

A success toast confirms the entry. The transaction appears in the list below, summary cards update, and charts refresh.

## Edit an expense

1. In the transaction list, click **Edit** on a row.
2. Update amount, category, date, or description in the modal.
3. Click **Save**.

Changes persist in the database and the dashboard refreshes.

## Delete an expense

1. Click **Delete** on a transaction row.
2. Confirm in the dialog.

The expense is removed from the list and analytics update accordingly.

## Manage categories

Categories organize expenses and drive chart colors.

### Create a category

1. In the **Categories** panel, enter a **name** and pick a **color** (hex).
2. Click **Add category**.

Default color is gray (`#6B7280`) if none is chosen.

### Edit a category

1. Click **Edit** next to a category.
2. Change the name or color and save.

Duplicate names for the same user are rejected.

### Delete a category

1. Click **Delete** next to a category and confirm.

The category is removed. Existing transactions that referenced it may need to be reassigned before delete if your data depends on that category.

## Read charts and summary stats

### Summary cards

- **Total spent** — sum of amounts in the selected date range
- **Transactions** — count of records in the range
- **Top category** — category with the highest total spend

### Spending by category

Donut chart segments match your category names and colors. Hover for exact totals. An empty state appears when there are no transactions in the range.

### Spending over time

Bar chart shows daily totals for the selected period. Switch the date range filter to compare this week vs. this month vs. all time.

## Date range filter

Use the dropdown in the dashboard header:

| Option | Range |
|--------|-------|
| **This week** | Monday through today |
| **This month** | First of month through today |
| **All time** | No date filter on API queries |

Changing the range reloads summary, charts, and the filtered transaction list.

## Authentication and write protection

| State | Behavior |
|-------|----------|
| Logged in | Full access to dashboard CRUD and charts |
| Logged out | `/dashboard` redirects to `/login`; API mutations return 401 |

The app stores your JWT in browser `localStorage` and sends it on every API request.

## Formatting

- Currency displays as US dollars (e.g. `$12.34`)
- Dates use locale-aware formatting in the UI

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| "Unable to reach the server" | API running? `VITE_API_URL` correct in `client/.env`? |
| 401 on dashboard actions | Log in again; token may have expired |
| Empty category dropdown | Create at least one category before adding expenses |
| Charts empty | Add transactions in the selected date range |
| CORS errors in production | `CLIENT_URL` on Render must match your Netlify URL |

## Related documentation

- [README.md](../README.md) — installation and environment variables
- [ARCHITECTURE.md](./ARCHITECTURE.md) — how the client talks to the API
- [DATA_MODEL.md](./DATA_MODEL.md) — database schema

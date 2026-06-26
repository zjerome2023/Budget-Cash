# Budget Tracker — API Testing Guide

This document covers automated and manual test cases for core API features (auth, categories, transactions). AI endpoint examples live in [COST_ANALYSIS.md](./COST_ANALYSIS.md).

## Automated tests

Integration tests use Node's built-in test runner, **supertest**, and an in-memory MongoDB instance.

```bash
cd server
npm test
```

| Suite | File | Cases |
|-------|------|-------|
| Auth | `server/tests/auth.test.js` | Register, login, `/me`, logout, validation, 401 |
| Categories | `server/tests/categories.test.js` | CRUD, duplicate name, cross-user 404, 401 |
| Transactions | `server/tests/transactions.test.js` | CRUD, invalid input, cross-user 404, 401 |

Tests run serially (`--test-concurrency=1`) so each suite gets a clean in-memory database.

---

## Manual test cases (Postman / Thunder Client / curl)

Use base URL `http://localhost:5001` locally or `https://budget-tracker-api-70sh.onrender.com` in production.

Import the Postman collection: [docs/postman/Budget-Tracker.postman_collection.json](./postman/Budget-Tracker.postman_collection.json)

### Auth

| # | Test case | Method / route | Input | Expected |
|---|-----------|----------------|-------|----------|
| A1 | Register new user | `POST /api/auth/register` | `{ "name": "Jane", "email": "jane@example.com", "password": "password123" }` | **201** — `{ "user": { "email", "name", "_id" } }` (no password) |
| A2 | Duplicate email | `POST /api/auth/register` | Same email as A1 | **409** — `{ "message": "Email already registered" }` |
| A3 | Invalid email | `POST /api/auth/register` | `{ "email": "bad", "password": "password123", "name": "Jane" }` | **400** — validation message |
| A4 | Short password | `POST /api/auth/register` | Password fewer than 8 chars | **400** |
| A5 | Login success | `POST /api/auth/login` | `{ "email": "jane@example.com", "password": "password123" }` | **200** — `{ "user", "token" }` |
| A6 | Login failure | `POST /api/auth/login` | Wrong password | **401** — `{ "message": "Invalid email or password" }` |
| A7 | Current user | `GET /api/auth/me` | Header: `Authorization: Bearer <token>` | **200** — `{ "user" }` |
| A8 | No token | `GET /api/auth/me` | No auth header | **401** — `{ "message": "Authentication required" }` |
| A9 | Invalid token | `GET /api/auth/me` | `Authorization: Bearer invalid` | **401** — `{ "message": "Invalid token" }` |
| A10 | Logout | `POST /api/auth/logout` | Valid Bearer token | **200** — `{ "message": "Logged out" }` |

#### Example: register + login

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "user": {
    "_id": "665a1b2c3d4e5f6789012345",
    "email": "jane@example.com",
    "name": "Jane Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Categories

All category routes require `Authorization: Bearer <token>`.

| # | Test case | Method / route | Input | Expected |
|---|-----------|----------------|-------|----------|
| C1 | List categories | `GET /api/categories` | Valid token | **200** — `{ "categories": [] }` |
| C2 | Create category | `POST /api/categories` | `{ "name": "Groceries", "color": "#3B82F6" }` | **201** — `{ "category": { "_id", "name", "color", "userId" } }` |
| C3 | Duplicate name | `POST /api/categories` | Same name as C2 | **409** |
| C4 | Update category | `PUT /api/categories/:id` | `{ "name": "Food", "color": "#EF4444" }` | **200** — updated category |
| C5 | Delete category | `DELETE /api/categories/:id` | Valid id | **200** — `{ "message": "Category deleted" }` |
| C6 | Not found | `PUT /api/categories/:id` | Another user's id | **404** |
| C7 | No auth | `GET /api/categories` | No token | **401** |
| C8 | Invalid id | `DELETE /api/categories/bad-id` | Valid token | **400** |

#### Example: create category

```http
POST /api/categories
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Groceries",
  "color": "#3B82F6"
}
```

Response:

```json
{
  "category": {
    "_id": "665a1b2c3d4e5f6789012346",
    "userId": "665a1b2c3d4e5f6789012345",
    "name": "Groceries",
    "color": "#3B82F6",
    "createdAt": "2026-06-26T12:00:00.000Z",
    "updatedAt": "2026-06-26T12:00:00.000Z"
  }
}
```

---

### Transactions

All transaction routes require `Authorization: Bearer <token>`.

| # | Test case | Method / route | Input | Expected |
|---|-----------|----------------|-------|----------|
| T1 | Create transaction | `POST /api/transactions` | `{ "amount": 24.5, "categoryId": "<id>", "date": "2026-06-01", "description": "Groceries" }` | **201** — `{ "transaction" }` |
| T2 | List transactions | `GET /api/transactions` | Valid token | **200** — `{ "transactions": [...] }` |
| T3 | Get one | `GET /api/transactions/:id` | Valid id | **200** — `{ "transaction" }` |
| T4 | Update | `PUT /api/transactions/:id` | `{ "amount": 30, "description": "Updated" }` | **200** |
| T5 | Delete | `DELETE /api/transactions/:id` | Valid id | **200** — `{ "message": "Transaction deleted" }` |
| T6 | Invalid category | `POST /api/transactions` | Unknown `categoryId` | **400** — `{ "message": "Invalid category" }` |
| T7 | Negative amount | `POST /api/transactions` | `{ "amount": -5, ... }` | **400** |
| T8 | Cross-user access | `GET /api/transactions/:id` | Another user's transaction id | **404** |
| T9 | No auth | `POST /api/transactions` | No token | **401** |

Optional query params for list: `?startDate=2026-06-01&endDate=2026-06-30&categoryId=<id>`

#### Example: create transaction

```http
POST /api/transactions
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "amount": 24.50,
  "categoryId": "665a1b2c3d4e5f6789012346",
  "date": "2026-06-01",
  "description": "Weekly groceries"
}
```

Response:

```json
{
  "transaction": {
    "_id": "665a1b2c3d4e5f6789012347",
    "userId": "665a1b2c3d4e5f6789012345",
    "categoryId": {
      "_id": "665a1b2c3d4e5f6789012346",
      "name": "Groceries",
      "color": "#3B82F6"
    },
    "amount": 24.5,
    "description": "Weekly groceries",
    "date": "2026-06-01T00:00:00.000Z"
  }
}
```

---

### Health check

| # | Test case | Method / route | Expected |
|---|-----------|----------------|----------|
| H1 | Health | `GET /api/health` | **200** — `{ "status": "ok" }` |

---

## Edge-case verification checklist

Run after automated tests or before submission:

- [ ] Register → login → create category → create transaction → list → update → delete (happy path)
- [ ] All protected routes return **401** without token
- [ ] Invalid MongoDB ids return **400**
- [ ] Cross-user resource access returns **404**
- [ ] Duplicate category name returns **409**
- [ ] Invalid transaction amount returns **400**
- [ ] AI routes documented in [COST_ANALYSIS.md](./COST_ANALYSIS.md)

## Related documentation

- [README.md](../README.md) — API overview table
- [COST_ANALYSIS.md](./COST_ANALYSIS.md) — AI endpoints and Postman/curl examples
- [VERIFICATION.md](./VERIFICATION.md) — deployment smoke tests

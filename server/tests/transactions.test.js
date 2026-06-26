import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import {
  authHeader,
  clearDatabase,
  createCategory,
  loginUser,
  registerUser,
  setupTestEnv,
  teardownTestEnv,
} from './helpers.js';

describe('Transactions API', () => {
  let app;
  let token;
  let categoryId;

  before(async () => {
    app = await setupTestEnv();
  });

  after(async () => {
    await teardownTestEnv();
  });

  beforeEach(async () => {
    await clearDatabase();
    const agent = request(app);
    await registerUser(agent);
    const loginRes = await loginUser(agent);
    token = loginRes.body.token;

    const { res: categoryRes } = await createCategory(agent, token);
    categoryId = categoryRes.body.category._id;
  });

  it('creates a transaction and returns 201', async () => {
    const agent = request(app);
    const res = await agent
      .post('/api/transactions')
      .set(authHeader(token))
      .send({
        amount: 24.5,
        categoryId,
        date: '2026-06-01',
        description: 'Weekly groceries',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.transaction.amount, 24.5);
    assert.equal(res.body.transaction.description, 'Weekly groceries');
    assert.ok(res.body.transaction.categoryId);
  });

  it('lists transactions for authenticated user', async () => {
    const agent = request(app);
    await agent
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ amount: 10, categoryId, date: '2026-06-01' });

    const res = await agent.get('/api/transactions').set(authHeader(token));

    assert.equal(res.status, 200);
    assert.equal(res.body.transactions.length, 1);
  });

  it('gets a single transaction by id', async () => {
    const agent = request(app);
    const createRes = await agent
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ amount: 15, categoryId, date: '2026-06-02' });

    const transactionId = createRes.body.transaction._id;
    const res = await agent
      .get(`/api/transactions/${transactionId}`)
      .set(authHeader(token));

    assert.equal(res.status, 200);
    assert.equal(res.body.transaction._id, transactionId);
  });

  it('updates a transaction', async () => {
    const agent = request(app);
    const createRes = await agent
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ amount: 12, categoryId, date: '2026-06-03' });

    const transactionId = createRes.body.transaction._id;
    const res = await agent
      .put(`/api/transactions/${transactionId}`)
      .set(authHeader(token))
      .send({ amount: 18.75, description: 'Updated memo' });

    assert.equal(res.status, 200);
    assert.equal(res.body.transaction.amount, 18.75);
    assert.equal(res.body.transaction.description, 'Updated memo');
  });

  it('deletes a transaction', async () => {
    const agent = request(app);
    const createRes = await agent
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ amount: 9.99, categoryId, date: '2026-06-04' });

    const transactionId = createRes.body.transaction._id;
    const res = await agent
      .delete(`/api/transactions/${transactionId}`)
      .set(authHeader(token));

    assert.equal(res.status, 200);
    assert.match(res.body.message, /deleted/i);

    const listRes = await agent.get('/api/transactions').set(authHeader(token));
    assert.equal(listRes.body.transactions.length, 0);
  });

  it('returns 400 for invalid category on create', async () => {
    const agent = request(app);
    const res = await agent
      .post('/api/transactions')
      .set(authHeader(token))
      .send({
        amount: 10,
        categoryId: '507f1f77bcf86cd799439011',
        date: '2026-06-01',
      });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /invalid category/i);
  });

  it('returns 400 for invalid transaction body', async () => {
    const agent = request(app);
    const res = await agent
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ amount: -5, categoryId, date: '2026-06-01' });

    assert.equal(res.status, 400);
  });

  it('returns 404 when accessing another user transaction', async () => {
    const agent = request(app);
    const createRes = await agent
      .post('/api/transactions')
      .set(authHeader(token))
      .send({ amount: 20, categoryId, date: '2026-06-05' });

    const transactionId = createRes.body.transaction._id;

    await registerUser(agent, {
      email: 'other@example.com',
      name: 'Other User',
    });
    const otherLogin = await loginUser(agent, 'other@example.com');

    const res = await agent
      .get(`/api/transactions/${transactionId}`)
      .set(authHeader(otherLogin.body.token));

    assert.equal(res.status, 404);
  });

  it('returns 401 for unauthenticated transaction requests', async () => {
    const agent = request(app);

    const listRes = await agent.get('/api/transactions');
    assert.equal(listRes.status, 401);

    const createRes = await agent
      .post('/api/transactions')
      .send({ amount: 10, categoryId, date: '2026-06-01' });
    assert.equal(createRes.status, 401);
  });
});

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

describe('Categories API', () => {
  let app;
  let token;

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
  });

  it('lists categories for authenticated user', async () => {
    const agent = request(app);
    await createCategory(agent, token);

    const res = await agent.get('/api/categories').set(authHeader(token));

    assert.equal(res.status, 200);
    assert.equal(res.body.categories.length, 1);
    assert.equal(res.body.categories[0].name, 'Groceries');
  });

  it('creates a category and returns 201', async () => {
    const agent = request(app);
    const { res } = await createCategory(agent, token, { name: 'Transport' });

    assert.equal(res.status, 201);
    assert.equal(res.body.category.name, 'Transport');
    assert.equal(res.body.category.color, '#3B82F6');
  });

  it('rejects duplicate category names with 409', async () => {
    const agent = request(app);
    await createCategory(agent, token, { name: 'Groceries' });

    const { res } = await createCategory(agent, token, { name: 'Groceries' });
    assert.equal(res.status, 409);
    assert.match(res.body.message, /already exists/i);
  });

  it('updates a category', async () => {
    const agent = request(app);
    const { res: createRes } = await createCategory(agent, token);
    const categoryId = createRes.body.category._id;

    const res = await agent
      .put(`/api/categories/${categoryId}`)
      .set(authHeader(token))
      .send({ name: 'Food', color: '#EF4444' });

    assert.equal(res.status, 200);
    assert.equal(res.body.category.name, 'Food');
    assert.equal(res.body.category.color, '#EF4444');
  });

  it('returns 404 when updating another user category', async () => {
    const agent = request(app);
    const { res: createRes } = await createCategory(agent, token);
    const categoryId = createRes.body.category._id;

    await registerUser(agent, {
      email: 'other@example.com',
      name: 'Other User',
    });
    const otherLogin = await loginUser(agent, 'other@example.com');

    const res = await agent
      .put(`/api/categories/${categoryId}`)
      .set(authHeader(otherLogin.body.token))
      .send({ name: 'Stolen', color: '#000000' });

    assert.equal(res.status, 404);
  });

  it('deletes a category', async () => {
    const agent = request(app);
    const { res: createRes } = await createCategory(agent, token);
    const categoryId = createRes.body.category._id;

    const res = await agent
      .delete(`/api/categories/${categoryId}`)
      .set(authHeader(token));

    assert.equal(res.status, 200);
    assert.match(res.body.message, /deleted/i);

    const listRes = await agent.get('/api/categories').set(authHeader(token));
    assert.equal(listRes.body.categories.length, 0);
  });

  it('returns 401 for unauthenticated category requests', async () => {
    const agent = request(app);

    const listRes = await agent.get('/api/categories');
    assert.equal(listRes.status, 401);

    const createRes = await agent.post('/api/categories').send({ name: 'Test' });
    assert.equal(createRes.status, 401);
  });

  it('returns 400 for invalid category id', async () => {
    const agent = request(app);
    const res = await agent
      .delete('/api/categories/not-a-valid-id')
      .set(authHeader(token));

    assert.equal(res.status, 400);
  });
});

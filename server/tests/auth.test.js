import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import {
  authHeader,
  clearDatabase,
  loginUser,
  registerUser,
  setupTestEnv,
  teardownTestEnv,
} from './helpers.js';

describe('Auth API', () => {
  let app;

  before(async () => {
    app = await setupTestEnv();
  });

  after(async () => {
    await teardownTestEnv();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it('registers a new user and returns 201 without password', async () => {
    const agent = request(app);
    const { res } = await registerUser(agent);

    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, 'test@example.com');
    assert.equal(res.body.user.name, 'Test User');
    assert.equal(res.body.user.password, undefined);
  });

  it('rejects duplicate registration with 409', async () => {
    const agent = request(app);
    await registerUser(agent);

    const { res } = await registerUser(agent);
    assert.equal(res.status, 409);
    assert.match(res.body.message, /already registered/i);
  });

  it('rejects invalid registration input with 400', async () => {
    const agent = request(app);
    const res = await agent.post('/api/auth/register').send({
      name: 'Test',
      email: 'not-an-email',
      password: 'short',
    });

    assert.equal(res.status, 400);
    assert.ok(res.body.message);
  });

  it('logs in with valid credentials and returns a token', async () => {
    const agent = request(app);
    await registerUser(agent);

    const res = await loginUser(agent);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'test@example.com');
    assert.ok(res.body.token);
  });

  it('rejects invalid login credentials with 401', async () => {
    const agent = request(app);
    await registerUser(agent);

    const res = await loginUser(agent, 'test@example.com', 'wrong-password');
    assert.equal(res.status, 401);
    assert.match(res.body.message, /invalid email or password/i);
  });

  it('returns current user for GET /api/auth/me with valid token', async () => {
    const agent = request(app);
    await registerUser(agent);
    const loginRes = await loginUser(agent);

    const res = await agent
      .get('/api/auth/me')
      .set(authHeader(loginRes.body.token));

    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'test@example.com');
  });

  it('returns 401 for GET /api/auth/me without token', async () => {
    const agent = request(app);
    const res = await agent.get('/api/auth/me');

    assert.equal(res.status, 401);
    assert.match(res.body.message, /authentication required/i);
  });

  it('returns 401 for GET /api/auth/me with invalid token', async () => {
    const agent = request(app);
    const res = await agent
      .get('/api/auth/me')
      .set(authHeader('invalid.token.value'));

    assert.equal(res.status, 401);
    assert.match(res.body.message, /invalid token/i);
  });

  it('logs out successfully with valid token', async () => {
    const agent = request(app);
    await registerUser(agent);
    const loginRes = await loginUser(agent);

    const res = await agent
      .post('/api/auth/logout')
      .set(authHeader(loginRes.body.token));

    assert.equal(res.status, 200);
    assert.match(res.body.message, /logged out/i);
  });
});

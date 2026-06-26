import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export async function setupTestEnv() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-for-integration-tests';
  process.env.JWT_EXPIRES_IN = '1h';

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();

  const { connectDB } = await import('../config/db.js');
  await connectDB(process.env.MONGODB_URI);

  const { default: app } = await import('../app.js');
  return app;
}

export async function teardownTestEnv() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export async function clearDatabase() {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
}

export async function registerUser(agent, overrides = {}) {
  const payload = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    ...overrides,
  };

  const res = await agent.post('/api/auth/register').send(payload);
  return { res, payload };
}

export async function loginUser(agent, email = 'test@example.com', password = 'password123') {
  const res = await agent.post('/api/auth/login').send({ email, password });
  return res;
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function createCategory(agent, token, overrides = {}) {
  const payload = {
    name: 'Groceries',
    color: '#3B82F6',
    ...overrides,
  };

  const res = await agent
    .post('/api/categories')
    .set(authHeader(token))
    .send(payload);

  return { res, payload };
}

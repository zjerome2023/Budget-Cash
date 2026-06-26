import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import transactionRoutes from './routes/transactions.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';

const CLIENT_URL = process.env.CLIENT_URL;
const allowedOrigin = CLIENT_URL?.replace(/\/$/, '');

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !allowedOrigin) {
        return callback(null, true);
      }
      if (origin.replace(/\/$/, '') === allowedOrigin) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'Budget Tracker API', health: '/api/health' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

export default app;

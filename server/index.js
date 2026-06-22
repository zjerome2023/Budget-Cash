import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import transactionRoutes from './routes/transactions.js';

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'Budget Tracker API', health: '/api/health' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  try {
    await connectDB(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();

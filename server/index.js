import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ message: 'Budget Tracker API', health: '/api/health' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (MONGODB_URI) {
    console.log('MONGODB_URI configured');
  } else {
    console.warn('MONGODB_URI not set — database connection added in Step 3');
  }
});

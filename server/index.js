import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import submissionRoutes from './routes/submissions.js';
import configRoutes from './routes/config.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // adjust if your frontend runs elsewhere
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/submissions', submissionRoutes);
app.use('/api/config', configRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel available at http://localhost:5173/admin`);
});
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: '*', // Allow Vite frontend during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Health Check
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.status(200).json({
    status: 'ok',
    service: 'ProjectPulse API',
    version: '1.0.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 Route Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint '${req.originalUrl}' not found.` });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` ProjectPulse Backend API Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

export default app;

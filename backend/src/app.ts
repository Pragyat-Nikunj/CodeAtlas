import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './config/logger.js';
import projectRoutes from './routes/project.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { globalRateLimiter } from './middleware/rateLimit.middleware.js';
dotenv.config();

const app: Application = express();

// 1. Global Middleware
app.use(cors());
app.use(express.json());
app.use(globalRateLimiter);

// 2. Request Logging Middleware
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// 3. API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/jobs', jobsRoutes);

// 4. 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// 5. Global Error Handler
app.use(errorHandler);

export default app;

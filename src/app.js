import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';
import adminRoutes from './routes/admin.routes.js';
import usersRoutes from './routes/users.routes.js';
import dashboardsRoutes from './routes/dashboards.routes.js';
import commentsRoutes from './routes/comments.routes.js';

import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { logger } from './configs/logger.js';
// import { tenantResolver } from './middlewares/tenantResolver.js';

export const createApp = () => {
  const app = express();
  app.set('trust proxy', 1);
  //  app.use(tenantResolver)
  app.use(helmet());

  app.use(cors({
    // origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    origin: "*",

    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', limiter);

  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/superadmin', superadminRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/dashboards', dashboardsRoutes);
  app.use('/api/comments', commentsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  });

  return app;
};

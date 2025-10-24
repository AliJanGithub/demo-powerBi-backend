import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './configs/secrets.js';
import { connectDB } from './configs/db.js';
import { logger } from './configs/logger.js';
import { emailService } from './services/email.service.js';
import { createApp } from './app.js';
import { setupCommentSocket } from './sockets/comments.socket.js';
// server.js
import { setupNotificationSocket } from './sockets/notifications.socket.js';



const startServer = async () => {
  try {
    await connectDB();
     console.log("🧩 EMAIL CONFIG DEBUG:", config.email.smtp);

    await emailService.initialize();

    const app = createApp();
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: config.frontendUrl,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    const commentSocketHandlers = setupCommentSocket(io);

    app.set('commentSocket', commentSocketHandlers);
    // after: const commentSocketHandlers = setupCommentSocket(io);
const notificationSocketHandlers = setupNotificationSocket(io);

app.set('notificationSocket', notificationSocketHandlers);

    httpServer.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
      logger.info(`Frontend URL: ${config.frontendUrl}`);
    });

    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection:', err);
      httpServer.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

import jwt from 'jsonwebtoken';
import { config } from '../configs/secrets.js';
import { User } from '../models/user.model.js';
import { Dashboard } from '../models/dashboard.model.js';
import { logger } from '../configs/logger.js';

export const setupCommentSocket = (io) => {
  const commentNamespace = io.of('/comments');

  commentNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.userId).select('-passwordHash -inviteTokenHash');

      if (!user || !user.isActive) {
        return next(new Error('Invalid or inactive user'));
      }

      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  commentNamespace.on('connection', (socket) => {
    logger.info(`User ${socket.user.email} connected to comments socket`);

    socket.on('join_dashboard', async (dashboardId) => {
      try {
        const dashboard = await Dashboard.findById(dashboardId);

        if (!dashboard) {
          socket.emit('error', { message: 'Dashboard not found' });
          return;
        }

        const hasAccess =
          socket.user.role === 'SUPER_ADMIN' ||
          (socket.user.role === 'ADMIN' && dashboard.createdBy.toString() === socket.user._id.toString()) ||
          (socket.user.role === 'USER' && dashboard.accessUsers.some(u => u.toString() === socket.user._id.toString()));

        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        socket.join(`dashboard:${dashboardId}`);
        logger.info(`User ${socket.user.email} joined dashboard ${dashboardId}`);

        socket.emit('joined_dashboard', { dashboardId });
      } catch (error) {
        logger.error('Error joining dashboard:', error.message);
        socket.emit('error', { message: 'Failed to join dashboard' });
      }
    });

    socket.on('leave_dashboard', (dashboardId) => {
      socket.leave(`dashboard:${dashboardId}`);
      logger.info(`User ${socket.user.email} left dashboard ${dashboardId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User ${socket.user.email} disconnected from comments socket`);
    });
  });

  return {
    broadcastNewComment: (dashboardId, comment) => {
      commentNamespace.to(`dashboard:${dashboardId}`).emit('new_comment', comment);
    },
    broadcastCommentUpdate: (dashboardId, comment) => {
      commentNamespace.to(`dashboard:${dashboardId}`).emit('comment_updated', comment);
    },
    broadcastCommentDelete: (dashboardId, commentId) => {
      commentNamespace.to(`dashboard:${dashboardId}`).emit('comment_deleted', { commentId });
    }
  };
};

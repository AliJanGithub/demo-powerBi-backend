import jwt from 'jsonwebtoken';
import { config } from '../configs/secrets.js';
import { User } from '../models/user.model.js';
import { notificationService } from '../services/notification.service.js';
import { logger } from '../configs/logger.js';

export const setupNotificationSocket = (io) => {
  const notificationNamespace = io.of('/notifications');

  // Initialize notification service with socket namespace
  notificationService.setSocketNamespace(notificationNamespace);

  notificationNamespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication token required'));

      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (!user || !user.isActive) return next(new Error('Invalid or inactive user'));

      socket.user = user;
      next();
    } catch (error) {
      logger.error('Notification socket auth error:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return next(new Error('Token expired. Please refresh your session.'));
      } else if (error.name === 'JsonWebTokenError') {
        return next(new Error('Invalid token. Please login again.'));
      }
      
      next(new Error('Authentication failed'));
    }
  });

  notificationNamespace.on('connection', (socket) => {
    logger.info(`🔔 User ${socket.user?.email || 'unknown'} connected to notifications socket`);

    if (socket.user) {
      socket.join(`user:${socket.user._id.toString()}`);
    }

    // Client can request to mark notification as read via socket
    socket.on('mark_read', async (notificationId) => {
      try {
        const notification = await notificationService.markAsRead(notificationId, socket.user._id);
        if (notification) {
          socket.emit('notification_read', { notificationId });
        }
      } catch (error) {
        logger.error('Error marking notification as read:', error.message);
      }
    });

    // Client can request unread count
    socket.on('get_unread_count', async () => {
      try {
        const count = await notificationService.getUnreadCount(socket.user._id);
        socket.emit('unread_count', { count });
      } catch (error) {
        logger.error('Error getting unread count:', error.message);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`🔕 User ${socket.user?.email || 'unknown'} disconnected from notifications`);
    });
  });

  return {
    sendToUser: (userId, notification) => {
      notificationNamespace.to(`user:${userId.toString()}`).emit('new_notification', notification);
    },
    notificationService
  };
};

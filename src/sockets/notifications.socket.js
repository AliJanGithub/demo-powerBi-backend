// sockets/notifications.socket.js
import jwt from 'jsonwebtoken';
import { config } from '../configs/secrets.js';
import { User } from '../models/user.model.js';
import { Notification } from '../models/notification.model.js';
import { logger } from '../configs/logger.js';

export const setupNotificationSocket = (io) => {
  const notificationNamespace = io.of('/notifications');

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
      next(new Error('Authentication failed'));
    }
  });

  notificationNamespace.on('connection', (socket) => {
    
    logger.info(`🔔 User ${socket.user.email} connected to notifications socket`);

 socket.join(`user:${socket.user._id.toString()}`);

    socket.on('disconnect', () => {
      logger.info(`🔕 User ${socket.user.email} disconnected from notifications`);
    });
  });

  // Methods for sending notifications
  return {
    sendToUser: (userId, notification) => {
notificationNamespace.to(`user:${userId.toString()}`).emit('new_notification', notification);    }
  };
};

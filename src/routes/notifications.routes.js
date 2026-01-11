import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/notifications - Get user's notifications (with pagination)
// Query params: page, limit, unreadOnly
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', notificationController.deleteNotification);

export default router;

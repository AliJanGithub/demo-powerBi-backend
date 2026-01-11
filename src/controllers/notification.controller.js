import { notificationService } from '../services/notification.service.js';
import { asyncHandler } from '../utils/helpers.js';

// Get user's notifications with pagination
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const result = await notificationService.getUserNotifications(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
    unreadOnly: unreadOnly === 'true'
  });

  res.json({
    success: true,
    data: result
  });
});

// Get unread notification count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);

  res.json({
    success: true,
    data: { unreadCount: count }
  });
});

// Mark single notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await notificationService.markAsRead(id, req.user._id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification }
  });
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await notificationService.deleteNotification(id, req.user._id);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification deleted'
  });
});

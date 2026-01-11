import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';

class NotificationService {
  constructor() {
    this.notificationNamespace = null;
  }

  setSocketNamespace(namespace) {
    this.notificationNamespace = namespace;
  }

  // Extract @username mentions from comment text
  extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return [...new Set(mentions)];
  }

  // Send real-time notification via socket
  emitNotification(userId, notification) {
    if (this.notificationNamespace) {
      this.notificationNamespace
        .to(`user:${userId.toString()}`)
        .emit('new_notification', notification);
    }
  }

  // Create and send comment notification to dashboard users
  async sendCommentNotifications({ dashboard, comment, sender, app }) {
    const notifications = [];
    
    const recipientIds = new Set([
      dashboard.createdBy.toString(),
      ...dashboard.accessUsers.map(u => u.toString())
    ]);

    recipientIds.delete(sender._id.toString());

    const notificationSocket = app?.get('notificationSocket');

    for (const recipientId of recipientIds) {
      const notification = await Notification.create({
        recipient: recipientId,
        sender: sender._id,
        type: 'COMMENT',
        message: `${sender.name || sender.email} commented on "${dashboard.title}"`,
        dashboard: dashboard._id,
        comment: comment._id
      });

      const populatedNotification = await notification.populate([
        { path: 'sender', select: 'name email' },
        { path: 'dashboard', select: 'title' }
      ]);

      notifications.push(populatedNotification);

      if (notificationSocket) {
        notificationSocket.sendToUser(recipientId, populatedNotification);
      }
    }

    return notifications;
  }

  // Create and send mention notifications
  async sendMentionNotifications({ commentText, dashboard, comment, sender, app }) {
    const notifications = [];
    const mentionedUsernames = this.extractMentions(commentText);

    if (mentionedUsernames.length === 0) return notifications;

    // Find users by name (case-insensitive) in same company
    const mentionedUsers = await User.find({
      name: { $in: mentionedUsernames.map(n => new RegExp(`^${n}$`, 'i')) },
      company: sender.company,
      isActive: true
    });

    const notificationSocket = app?.get('notificationSocket');

    for (const mentionedUser of mentionedUsers) {
      if (mentionedUser._id.toString() === sender._id.toString()) continue;

      const notification = await Notification.create({
        recipient: mentionedUser._id,
        sender: sender._id,
        type: 'MENTION',
        message: `${sender.name || sender.email} mentioned you in a comment on "${dashboard.title}"`,
        dashboard: dashboard._id,
        comment: comment._id
      });

      const populatedNotification = await notification.populate([
        { path: 'sender', select: 'name email' },
        { path: 'dashboard', select: 'title' }
      ]);

      notifications.push(populatedNotification);

      if (notificationSocket) {
        notificationSocket.sendToUser(mentionedUser._id.toString(), populatedNotification);
      }
    }

    return notifications;
  }

  // Send dashboard assigned notification
  async sendDashboardAssignedNotification(dashboard, sender, assignedUserIds, app) {
    const notifications = [];
    const notificationSocket = app?.get('notificationSocket');

    for (const userId of assignedUserIds) {
      const notification = await Notification.create({
        recipient: userId,
        sender: sender._id,
        type: 'DASHBOARD_ASSIGNED',
        message: `${sender.name || sender.email} assigned you to dashboard "${dashboard.title}"`,
        dashboard: dashboard._id
      });

      const populatedNotification = await notification.populate([
        { path: 'sender', select: 'name email' },
        { path: 'dashboard', select: 'title' }
      ]);

      notifications.push(populatedNotification);

      if (notificationSocket) {
        notificationSocket.sendToUser(userId.toString(), populatedNotification);
      }
    }

    return notifications;
  }

  // Send dashboard created notification to all users invited by the admin
  async sendDashboardCreatedNotification(dashboard, admin, app) {
    const notifications = [];
    
    // Find all active users invited by this admin
    const invitedUsers = await User.find({
      invitedBy: admin._id,
      isActive: true,
      role: 'USER'
    });

    if (invitedUsers.length === 0) {
      return notifications;
    }

    const notificationSocket = app?.get('notificationSocket');

    for (const user of invitedUsers) {
      const notification = await Notification.create({
        recipient: user._id,
        sender: admin._id,
        type: 'DASHBOARD_CREATED',
        message: `${admin.name || admin.email} created a new dashboard: "${dashboard.title}"`,
        dashboard: dashboard._id
      });

      const populatedNotification = await notification.populate([
        { path: 'sender', select: 'name email' },
        { path: 'dashboard', select: 'title' }
      ]);

      notifications.push(populatedNotification);

      if (notificationSocket) {
        notificationSocket.sendToUser(user._id.toString(), populatedNotification);
      }
    }

    return notifications;
  }

  // Get user notifications with pagination
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    const query = { recipient: userId };
    if (unreadOnly) query.isRead = false;

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', 'name email')
        .populate('dashboard', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userId, isRead: false })
    ]);

    return {
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      unreadCount
    };
  }

  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    ).populate('sender', 'name email').populate('dashboard', 'title');
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    return { success: true };
  }

  async deleteNotification(notificationId, userId) {
    return Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({ recipient: userId, isRead: false });
  }
}

export const notificationService = new NotificationService();

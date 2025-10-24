// controllers/notification.controller.js
import { Notification } from '../models/notification.model.js';

export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: notifications });
};

// models/notification.model.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['NEW_DASHBOARD', 'COMMENT'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    dashboard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dashboard'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);

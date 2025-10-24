import mongoose from 'mongoose';

const AuditSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

AuditSchema.index({ user: 1, createdAt: -1 });
AuditSchema.index({ action: 1 });
AuditSchema.index({ resource: 1, resourceId: 1 });
AuditSchema.index({ createdAt: -1 });

export const Audit = mongoose.model('Audit', AuditSchema);

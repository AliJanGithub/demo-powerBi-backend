import mongoose from 'mongoose';

const DashboardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  embedUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  department: {
    type: String,
    enum: ['FINANCE', 'SALES', 'MARKETING', 'GENERAL', 'OTHER', 'HR'],
    required: true}
    ,
  accessUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

DashboardSchema.index({ createdBy: 1 });
DashboardSchema.index({ department: 1 });

DashboardSchema.index({ company: 1 });
DashboardSchema.index({ accessUsers: 1 });
DashboardSchema.index({ tags: 1 });

export const Dashboard = mongoose.model('Dashboard', DashboardSchema);

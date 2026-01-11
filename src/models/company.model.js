import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
    subdomain: {        // 👈 Added for multi-tenancy
    type: String,

    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionPlan: {
  type: String,
  enum: ['TRIAL', 'PRO', 'ENTERPRISE'],
  default: 'TRIAL'
},
subscriptionEnd: {
  type: Date
},

}, {
  timestamps: true
});

CompanySchema.index({ name: 1 });
CompanySchema.index({ createdBy: 1 });

export const Company = mongoose.model('Company', CompanySchema);

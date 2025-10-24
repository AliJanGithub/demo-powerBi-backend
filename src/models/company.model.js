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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

CompanySchema.index({ name: 1 });
CompanySchema.index({ createdBy: 1 });

export const Company = mongoose.model('Company', CompanySchema);

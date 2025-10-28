// import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';

// const UserSchema = new mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   name: {
//     type: String,
//     trim: true
//   },
//   passwordHash: {
//     type: String
//   },
//   role: {
//     type: String,
//     enum: ['SUPER_ADMIN', 'ADMIN', 'USER'],
//     default: 'USER'
//   },
//   company: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Company'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   invitedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   inviteTokenHash: {
//     type: String
//   },
//   inviteExpiresAt: {
//     type: Date
//   }
// }, {
//   timestamps: true
// });

// UserSchema.index({ email: 1 });
// UserSchema.index({ role: 1, company: 1 });
// UserSchema.index({ inviteTokenHash: 1 });

// UserSchema.methods.comparePassword = async function(candidatePassword) {
//   if (!this.passwordHash) {
//     return false;
//   }
//   return bcrypt.compare(candidatePassword, this.passwordHash);
// };

// UserSchema.methods.hashPassword = async function(password) {
//   const salt = await bcrypt.genSalt(10);
//   this.passwordHash = await bcrypt.hash(password, salt);
// };

// UserSchema.pre('save', function(next) {
//   if (this.role === 'SUPER_ADMIN') {
//     this.company = undefined;
//   }
//   next();
// });

// export const User = mongoose.model('User', UserSchema);
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  passwordHash: {
    type: String
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    default: 'USER'
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
    logo: {
    data: Buffer,
    contentType: String
  },
  inviteTokenHash: {
    type: String
  },
  inviteExpiresAt: {
    type: Date
  },

  // 🔥 Add these two for password reset
  passwordResetTokenHash: {
    type: String
  },
  passwordResetExpiresAt: {
    type: Date
  }

}, {
  timestamps: true
});

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, company: 1 });
UserSchema.index({ inviteTokenHash: 1 });
UserSchema.index({ company: 1, email: 1 }); // optional optimization

UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.passwordHash) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.methods.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

UserSchema.pre('save', function(next) {
  if (this.role === 'SUPER_ADMIN') {
    this.company = undefined;
  }
  next();
});

export const User = mongoose.model('User', UserSchema);

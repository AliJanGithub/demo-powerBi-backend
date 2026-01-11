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
//     logo: {
//     data: Buffer,
//     contentType: String
//   },
//   inviteTokenHash: {
//     type: String
//   },
//   inviteExpiresAt: {
//     type: Date
//   },

//   // 🔥 Add these two for password reset
//   passwordResetTokenHash: {
//     type: String
//   },
//   passwordResetExpiresAt: {
//     type: Date
//   },
// subscriptionPlan: {
//   type: String,
//   enum: ['TRIAL', 'PRO', 'ENTERPRISE'],
//   default: 'TRIAL'
// },
// subscriptionEnd: {
//   type: Date
// },
// theme: {
//   primaryColor: {
//     type: String,
//     default: '#3B82F6'
//   },
//   secondaryColor: {
//     type: String,
//     default: '#10B981'
//   }
// },

// }, {
//   timestamps: true
// });

// UserSchema.index({ email: 1 });
// UserSchema.index({ role: 1, company: 1 });
// UserSchema.index({ inviteTokenHash: 1 });
// UserSchema.index({ company: 1, email: 1 }); // optional optimization

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
  passwordResetTokenHash: {
    type: String 
  },
  passwordResetExpiresAt: {
    type: Date
  },
  subscriptionPlan: {
    type: String,
    enum: ['TRIAL', 'PRO', 'ENTERPRISE'],
    default: 'TRIAL'
  },
  subscriptionEnd: {
    type: Date
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#10B981'
    }
  },
  
  // ✅ ADD FAVORITES HERE
  favoriteDashboards: [{
    dashboardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dashboard',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    order: {
      type: Number,
      default: 0
    },
    tags: [{
      type: String,
      trim: true
    }]
  }]

}, {
  timestamps: true
});

// Existing indexes...
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, company: 1 });
UserSchema.index({ inviteTokenHash: 1 });
UserSchema.index({ company: 1, email: 1 });

// ✅ Add index for favorites querying
UserSchema.index({ 'favoriteDashboards.dashboardId': 1 });

// ✅ Helper methods for favorites
UserSchema.methods.addFavorite = async function(dashboardId, tags = []) {
  const existing = this.favoriteDashboards.find(
    fav => fav.dashboardId.toString() === dashboardId.toString()
  );
  
  if (!existing) {
    this.favoriteDashboards.push({
      dashboardId,
      order: this.favoriteDashboards.length,
      tags
    });
    return this.save();
  }
  return this;
};

UserSchema.methods.removeFavorite = async function(dashboardId) {
  this.favoriteDashboards = this.favoriteDashboards.filter(
    fav => fav.dashboardId.toString() !== dashboardId.toString()
  );
  return this.save();
};

UserSchema.methods.isFavorite = function(dashboardId) {
  return this.favoriteDashboards.some(
    fav => fav.dashboardId.toString() === dashboardId.toString()
  );
};

UserSchema.methods.updateFavoriteOrder = async function(dashboardIdsOrder) {
  // Reorder favorites based on provided array of dashboard IDs
  const favoritesMap = new Map();
  this.favoriteDashboards.forEach(fav => {
    favoritesMap.set(fav.dashboardId.toString(), fav);
  });
  
  this.favoriteDashboards = dashboardIdsOrder.map((id, index) => {
    const fav = favoritesMap.get(id.toString());
    if (fav) {
      fav.order = index;
      return fav;
    }
    return null;
  }).filter(fav => fav !== null);
  
  return this.save();
};

// Existing methods...
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
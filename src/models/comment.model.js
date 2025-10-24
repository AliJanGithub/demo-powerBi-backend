import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  dashboard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dashboard',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  edited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
// Your CommentSchema file (where the schema is defined)

CommentSchema.virtual('replies', {
  ref: 'Comment',          // Model to use
  localField: '_id',       // Field on the Comment model (the parent's ID)
  foreignField: 'parent',  // Field on the Comment model (the child's parent ID)
  justOne: false           // We want many replies, not just one
});

// Important: Tell Mongoose to include virtuals when converting to JSON
CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.index({ dashboard: 1, createdAt: -1 });
CommentSchema.index({ user: 1 });
CommentSchema.index({ parent: 1 });

export const Comment = mongoose.model('Comment', CommentSchema);

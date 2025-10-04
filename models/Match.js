const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  blockedAt: Date,
  
  // Match preferences
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Ensure user1 is always the smaller user ID for consistency
matchSchema.pre('save', function(next) {
  if (this.user1 > this.user2) {
    [this.user1, this.user2] = [this.user2, this.user1];
  }
  next();
});

// Compound index to prevent duplicate matches
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ user1: 1, isActive: 1 });
matchSchema.index({ user2: 1, isActive: 1 });
matchSchema.index({ lastMessageAt: -1 });
matchSchema.index({ matchedAt: -1 });

module.exports = mongoose.model('Match', matchSchema);
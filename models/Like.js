const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  liker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  liked: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'superlike', 'pass'],
    default: 'like'
  },
  isMatch: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate likes
likeSchema.index({ liker: 1, liked: 1 }, { unique: true });
likeSchema.index({ liked: 1, createdAt: -1 });
likeSchema.index({ isMatch: 1 });

module.exports = mongoose.model('Like', likeSchema);
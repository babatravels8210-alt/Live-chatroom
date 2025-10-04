const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'voice', 'video', 'file', 'gift', 'system'],
    default: 'text'
  },
  
  // Media attachments
  media: {
    url: String,
    filename: String,
    size: Number,
    mimetype: String,
    duration: Number // for voice/video messages
  },
  
  // Gift information
  gift: {
    type: {
      type: String,
      enum: ['rose', 'heart', 'diamond', 'crown', 'car', 'house']
    },
    value: Number,
    animation: String
  },
  
  // Message status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  
  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reply to another message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Message metadata
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    location: {
      country: String,
      city: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ type: 1 });

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(
    r => r.user.toString() === userId.toString() && r.emoji === emoji
  );
  
  if (!existingReaction) {
    this.reactions.push({
      user: userId,
      emoji: emoji
    });
    return true;
  }
  return false;
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(
    r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
  );
};

// Method to get reaction counts
messageSchema.methods.getReactionCounts = function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
  });
  return counts;
};

module.exports = mongoose.model('Message', messageSchema);
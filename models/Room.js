const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['voice', 'video', 'text'],
    default: 'voice'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: ''
  },
  maxParticipants: {
    type: Number,
    default: 50,
    min: 2,
    max: 100
  },
  currentParticipants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['host', 'moderator', 'participant'],
      default: 'participant'
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isVideoOff: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['music', 'gaming', 'education', 'entertainment', 'business', 'casual', 'other'],
    default: 'casual'
  },
  tags: [String],
  
  // Room settings
  settings: {
    allowGuests: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    recordSession: {
      type: Boolean,
      default: false
    },
    enableChat: {
      type: Boolean,
      default: true
    }
  },
  
  // Statistics
  stats: {
    totalJoins: {
      type: Number,
      default: 0
    },
    totalMessages: {
      type: Number,
      default: 0
    },
    peakParticipants: {
      type: Number,
      default: 0
    }
  },
  
  // Scheduled rooms
  scheduledFor: Date,
  duration: Number, // in minutes
  
  endedAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
roomSchema.index({ host: 1 });
roomSchema.index({ isActive: 1 });
roomSchema.index({ category: 1 });
roomSchema.index({ createdAt: -1 });
roomSchema.index({ 'currentParticipants.user': 1 });

// Virtual for participant count
roomSchema.virtual('participantCount').get(function() {
  return this.currentParticipants.length;
});

// Method to add participant
roomSchema.methods.addParticipant = function(userId, role = 'participant') {
  const existingParticipant = this.currentParticipants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!existingParticipant && this.currentParticipants.length < this.maxParticipants) {
    this.currentParticipants.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
    this.stats.totalJoins += 1;
    
    if (this.currentParticipants.length > this.stats.peakParticipants) {
      this.stats.peakParticipants = this.currentParticipants.length;
    }
    
    return true;
  }
  return false;
};

// Method to remove participant
roomSchema.methods.removeParticipant = function(userId) {
  this.currentParticipants = this.currentParticipants.filter(
    p => p.user.toString() !== userId.toString()
  );
};

// Method to check if user is host
roomSchema.methods.isHost = function(userId) {
  return this.host.toString() === userId.toString();
};

// Method to check if user is moderator
roomSchema.methods.isModerator = function(userId) {
  const participant = this.currentParticipants.find(
    p => p.user.toString() === userId.toString()
  );
  return participant && (participant.role === 'moderator' || participant.role === 'host');
};

module.exports = mongoose.model('Room', roomSchema);
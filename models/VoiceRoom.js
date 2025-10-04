const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['host', 'speaker', 'audience'],
    default: 'audience'
  },
  isSpeaking: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

const voiceRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  theme: {
    type: String,
    required: true,
    enum: [
      'General',
      'Gaming',
      'Music',
      'Study',
      'Karaoke',
      'Dating',
      'Comedy',
      'Storytelling',
      'Podcast',
      'Debate'
    ],
    default: 'General'
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [participantSchema],
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isLive: {
    type: Boolean,
    default: true
  },
  thumbnail: {
    type: String,
    default: '/thumbnails/general.jpg'
  },
  settings: {
    maxParticipants: {
      type: Number,
      default: 100
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

voiceRoomSchema.index({ isActive: 1, createdAt: -1 });
voiceRoomSchema.index({ host: 1 });
voiceRoomSchema.index({ theme: 1 });

voiceRoomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

voiceRoomSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

voiceRoomSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('VoiceRoom', voiceRoomSchema);
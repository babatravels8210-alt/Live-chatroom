const mongoose = require('mongoose');

const datingProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    min: 18,
    max: 100,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'],
    required: true
  },
  interestedIn: [{
    type: String,
    enum: ['male', 'female', 'non-binary', 'other', 'everyone'],
    required: true
  }],
  
  // Location
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Physical Attributes
  height: {
    type: Number, // in cm
    min: 100,
    max: 250
  },
  bodyType: {
    type: String,
    enum: ['slim', 'average', 'athletic', 'muscular', 'heavy', 'prefer-not-to-say']
  },
  ethnicity: {
    type: String,
    enum: ['asian', 'black', 'white', 'hispanic', 'middle-eastern', 'mixed', 'other', 'prefer-not-to-say']
  },
  
  // Lifestyle
  education: {
    type: String,
    enum: ['high-school', 'some-college', 'bachelors', 'masters', 'phd', 'other']
  },
  occupation: String,
  income: {
    type: String,
    enum: ['under-30k', '30k-50k', '50k-70k', '70k-100k', '100k-150k', '150k-plus', 'prefer-not-to-say']
  },
  smoking: {
    type: String,
    enum: ['never', 'occasionally', 'regularly', 'trying-to-quit']
  },
  drinking: {
    type: String,
    enum: ['never', 'socially', 'regularly', 'trying-to-quit']
  },
  exercise: {
    type: String,
    enum: ['never', 'rarely', 'sometimes', 'regularly', 'daily']
  },
  religion: {
    type: String,
    enum: ['christian', 'muslim', 'hindu', 'buddhist', 'jewish', 'atheist', 'agnostic', 'other', 'prefer-not-to-say']
  },
  
  // Relationship Preferences
  relationshipType: [{
    type: String,
    enum: ['casual', 'serious', 'friends', 'hookup', 'marriage']
  }],
  wantChildren: {
    type: String,
    enum: ['yes', 'no', 'maybe', 'someday', 'already-have']
  },
  
  // Photos
  photos: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    caption: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Interests & Personality
  interests: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  bio: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  personality: {
    type: String,
    maxlength: 500,
    default: ''
  },
  idealPartner: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Preferences
  ageRange: {
    min: {
      type: Number,
      min: 18,
      max: 100,
      default: 18
    },
    max: {
      type: Number,
      min: 18,
      max: 100,
      default: 65
    }
  },
  distance: {
    type: Number,
    min: 1,
    max: 500,
    default: 50
  },
  
  // Verification & Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationPhotos: [{
    url: String,
    publicId: String,
    type: {
      type: String,
      enum: ['face', 'document', 'lifestyle']
    }
  }],
  
  // Activity & Engagement
  lastActive: {
    type: Date,
    default: Date.now
  },
  profileCompletion: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  matchesCount: {
    type: Number,
    default: 0
  },
  
  // Settings
  showAge: {
    type: Boolean,
    default: true
  },
  showDistance: {
    type: Boolean,
    default: true
  },
  allowMessages: {
    type: Boolean,
    default: true
  },
  discoverable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
datingProfileSchema.index({ user: 1 });
datingProfileSchema.index({ age: 1 });
datingProfileSchema.index({ gender: 1 });
datingProfileSchema.index({ location: '2dsphere' });
datingProfileSchema.index({ interests: 1 });
datingProfileSchema.index({ lastActive: -1 });
datingProfileSchema.index({ discoverable: 1, isVerified: 1 });

// Calculate profile completion
datingProfileSchema.methods.calculateProfileCompletion = function() {
  let completion = 0;
  const totalFields = 15;
  
  if (this.fullName) completion += 5;
  if (this.age) completion += 5;
  if (this.gender) completion += 5;
  if (this.interestedIn && this.interestedIn.length > 0) completion += 5;
  if (this.location && this.location.city) completion += 5;
  if (this.height) completion += 5;
  if (this.bodyType) completion += 5;
  if (this.education) completion += 5;
  if (this.occupation) completion += 5;
  if (this.photos && this.photos.length > 0) completion += 10;
  if (this.photos && this.photos.length >= 3) completion += 10;
  if (this.interests && this.interests.length > 0) completion += 10;
  if (this.bio && this.bio.length > 50) completion += 10;
  if (this.relationshipType && this.relationshipType.length > 0) completion += 5;
  if (this.ageRange && this.ageRange.min !== 18 && this.ageRange.max !== 65) completion += 5;
  
  this.profileCompletion = Math.min(completion, 100);
  return this.profileCompletion;
};

// Get public profile data
datingProfileSchema.methods.getPublicProfile = function() {
  const profile = this.toObject();
  return {
    _id: profile._id,
    user: profile.user,
    fullName: profile.fullName,
    age: profile.age,
    gender: profile.gender,
    interestedIn: profile.interestedIn,
    location: profile.location,
    height: profile.height,
    bodyType: profile.bodyType,
    ethnicity: profile.ethnicity,
    education: profile.education,
    occupation: profile.occupation,
    photos: profile.photos,
    interests: profile.interests,
    bio: profile.bio,
    personality: profile.personality,
    idealPartner: profile.idealPartner,
    relationshipType: profile.relationshipType,
    wantChildren: profile.wantChildren,
    smoking: profile.smoking,
    drinking: profile.drinking,
    exercise: profile.exercise,
    religion: profile.religion,
    lastActive: profile.lastActive,
    profileCompletion: profile.profileCompletion,
    likesCount: profile.likesCount,
    matchesCount: profile.matchesCount,
    showAge: profile.showAge,
    showDistance: profile.showDistance,
    discoverable: profile.discoverable,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
};

module.exports = mongoose.model('DatingProfile', datingProfileSchema);
const express = require('express');
const { body, validationResult } = require('express-validator');
const DatingProfile = require('../models/DatingProfile');
const Like = require('../models/Like');
const Match = require('../models/Match');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create or update dating profile
router.post('/profile', authenticateToken, [
  body('fullName').isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),
  body('age').isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('gender').isIn(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']).withMessage('Invalid gender'),
  body('interestedIn').isArray().withMessage('Interested in must be an array'),
  body('interestedIn.*').isIn(['male', 'female', 'non-binary', 'other', 'everyone']).withMessage('Invalid interest preference'),
  body('bio').optional().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters'),
  body('ageRange.min').optional().isInt({ min: 18, max: 100 }).withMessage('Minimum age must be between 18 and 100'),
  body('ageRange.max').optional().isInt({ min: 18, max: 100 }).withMessage('Maximum age must be between 18 and 100'),
  body('distance').optional().isInt({ min: 1, max: 500 }).withMessage('Distance must be between 1 and 500 km')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const profileData = req.body;
    profileData.user = req.user._id;

    let profile = await DatingProfile.findOne({ user: req.user._id });
    
    if (profile) {
      // Update existing profile
      Object.assign(profile, profileData);
      profile.profileCompletion = profile.calculateProfileCompletion();
      await profile.save();
    } else {
      // Create new profile
      profile = new DatingProfile(profileData);
      profile.profileCompletion = profile.calculateProfileCompletion();
      await profile.save();
    }

    res.json({
      message: 'Profile updated successfully',
      profile: profile.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get user's own dating profile
router.get('/profile/me', authenticateToken, async (req, res) => {
  try {
    const profile = await DatingProfile.findOne({ user: req.user._id })
      .populate('user', 'username email avatar isOnline lastSeen');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Get public dating profile by user ID
router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const profile = await DatingProfile.findOne({ user: req.params.userId })
      .populate('user', 'username avatar isOnline lastSeen');

    if (!profile || !profile.discoverable) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if user has blocked this profile
    const currentUser = await User.findById(req.user._id);
    if (currentUser.blockedUsers.includes(profile.user._id)) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile: profile.getPublicProfile() });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Get potential matches (discovery)
router.get('/discover', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const currentProfile = await DatingProfile.findOne({ user: req.user._id });
    if (!currentProfile) {
      return res.status(400).json({ message: 'Please complete your profile first' });
    }

    // Get users that current user has already liked or passed
    const existingLikes = await Like.find({ liker: req.user._id });
    const excludedUserIds = existingLikes.map(like => like.liked);

    // Build query for potential matches
    const query = {
      user: { 
        $ne: req.user._id,
        $nin: excludedUserIds
      },
      discoverable: true,
      isVerified: true,
      age: {
        $gte: currentProfile.ageRange.min,
        $lte: currentProfile.ageRange.max
      },
      gender: { $in: currentProfile.interestedIn }
    };

    // Add gender filter based on user's interestedIn
    if (!currentProfile.interestedIn.includes('everyone')) {
      query.gender = { $in: currentProfile.interestedIn };
    }

    // Location-based filtering (simplified - in production use geospatial queries)
    if (currentProfile.location && currentProfile.location.coordinates) {
      // Add location-based filtering here
    }

    const profiles = await DatingProfile.find(query)
      .populate('user', 'username avatar isOnline lastSeen')
      .sort({ lastActive: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DatingProfile.countDocuments(query);

    res.json({
      profiles: profiles.map(p => p.getPublicProfile()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ message: 'Failed to get potential matches' });
  }
});

// Like a user
router.post('/like/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'like' } = req.body;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot like yourself' });
    }

    // Check if target user exists and has a profile
    const targetProfile = await DatingProfile.findOne({ user: userId });
    if (!targetProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Check if already liked
    const existingLike = await Like.findOne({ 
      liker: req.user._id, 
      liked: userId 
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Already liked this user' });
    }

    // Create new like
    const like = new Like({
      liker: req.user._id,
      liked: userId,
      type
    });

    await like.save();

    // Check for mutual like (match)
    const mutualLike = await Like.findOne({
      liker: userId,
      liked: req.user._id
    });

    let isMatch = false;
    if (mutualLike) {
      like.isMatch = true;
      await like.save();

      // Create match record
      const match = new Match({
        user1: req.user._id,
        user2: userId,
        matchedAt: new Date()
      });

      await match.save();

      // Update profile counts
      await DatingProfile.updateOne(
        { user: req.user._id },
        { $inc: { matchesCount: 1 } }
      );

      await DatingProfile.updateOne(
        { user: userId },
        { $inc: { matchesCount: 1 } }
      );

      isMatch = true;
    }

    // Update likes count
    await DatingProfile.updateOne(
      { user: userId },
      { $inc: { likesCount: 1 } }
    );

    res.json({
      message: isMatch ? 'It\'s a match!' : 'Liked successfully',
      isMatch,
      match: isMatch ? match : null
    });

  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Failed to like user' });
  }
});

// Pass on a user
router.post('/pass/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot pass on yourself' });
    }

    // Check if already liked or passed
    const existingLike = await Like.findOne({
      liker: req.user._id,
      liked: userId
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Already interacted with this user' });
    }

    // Create pass record
    const pass = new Like({
      liker: req.user._id,
      liked: userId,
      type: 'pass'
    });

    await pass.save();

    res.json({ message: 'Passed successfully' });

  } catch (error) {
    console.error('Pass error:', error);
    res.status(500).json({ message: 'Failed to pass on user' });
  }
});

// Get user's matches
router.get('/matches', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const matches = await Match.find({
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
      isActive: true
    })
    .populate('user1', 'username avatar isOnline lastSeen')
    .populate('user2', 'username avatar isOnline lastSeen')
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Match.countDocuments({
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
      isActive: true
    });

    // Format matches for frontend
    const formattedMatches = matches.map(match => {
      const otherUser = match.user1._id.toString() === req.user._id.toString() 
        ? match.user2 
        : match.user1;
      
      return {
        _id: match._id,
        user: otherUser,
        matchedAt: match.matchedAt,
        lastMessageAt: match.lastMessageAt,
        isActive: match.isActive
      };
    });

    res.json({
      matches: formattedMatches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Failed to get matches' });
  }
});

// Unmatch a user
router.delete('/unmatch/:matchId', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (!match.user1.equals(req.user._id) && !match.user2.equals(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    match.isActive = false;
    match.blockedBy = req.user._id;
    match.blockedAt = new Date();
    await match.save();

    res.json({ message: 'Unmatched successfully' });

  } catch (error) {
    console.error('Unmatch error:', error);
    res.status(500).json({ message: 'Failed to unmatch' });
  }
});

// Get likes received
router.get('/likes/received', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const likes = await Like.find({
      liked: req.user._id,
      type: { $in: ['like', 'superlike'] }
    })
    .populate('liker', 'username avatar isOnline lastSeen')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Like.countDocuments({
      liked: req.user._id,
      type: { $in: ['like', 'superlike'] }
    });

    res.json({
      likes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({ message: 'Failed to get likes' });
  }
});

// Get likes given
router.get('/likes/given', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const likes = await Like.find({
      liker: req.user._id,
      type: { $in: ['like', 'superlike'] }
    })
    .populate('liked', 'username avatar isOnline lastSeen')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Like.countDocuments({
      liker: req.user._id,
      type: { $in: ['like', 'superlike'] }
    });

    res.json({
      likes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get given likes error:', error);
    res.status(500).json({ message: 'Failed to get given likes' });
  }
});

module.exports = router;
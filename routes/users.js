const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Message = require('../models/Message');

const router = express.Router();

// Get user profile
router.get('/getProfile/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    const user = await User.findById(userId)
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar')
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if profile is private and user is not following
    if (user.preferences.privateProfile && 
        userId !== req.user._id.toString() && 
        !user.followers.some(f => f._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'This profile is private' });
    }

    res.json({
      user: {
        ...user.toObject(),
        isFollowing: user.followers.some(f => f._id.toString() === req.user._id.toString()),
        followersCount: user.followers.length,
        followingCount: user.following.length
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get user profile' });
  }
});

// Update user profile
router.post('/updateProfile', [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username, bio, avatar, phoneNumber, preferences } = req.body;
    const user = req.user;

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Follow/Unfollow user
router.post('/follow/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    if (userId === currentUser._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userId
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );
      
      await currentUser.save();
      await targetUser.save();

      res.json({
        message: 'Unfollowed successfully',
        isFollowing: false
      });
    } else {
      // Follow
      currentUser.following.push(userId);
      targetUser.followers.push(currentUser._id);
      
      await currentUser.save();
      await targetUser.save();

      res.json({
        message: 'Followed successfully',
        isFollowing: true
      });
    }

  } catch (error) {
    console.error('Follow/Unfollow error:', error);
    res.status(500).json({ message: 'Failed to follow/unfollow user' });
  }
});

// Get user's followers
router.get('/followers/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'followers',
        select: 'username avatar bio isOnline lastSeen',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      followers: user.followers,
      pagination: {
        current: page,
        limit
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Failed to get followers' });
  }
});

// Get user's following
router.get('/following/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'following',
        select: 'username avatar bio isOnline lastSeen',
        options: {
          limit: limit * 1,
          skip: (page - 1) * limit
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      following: user.following,
      pagination: {
        current: page,
        limit
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Failed to get following' });
  }
});

// Block/Unblock user
router.post('/block/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    if (userId === currentUser._id.toString()) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isBlocked = currentUser.blockedUsers.includes(userId);

    if (isBlocked) {
      // Unblock
      currentUser.blockedUsers = currentUser.blockedUsers.filter(
        id => id.toString() !== userId
      );
      
      await currentUser.save();

      res.json({
        message: 'User unblocked successfully',
        isBlocked: false
      });
    } else {
      // Block
      currentUser.blockedUsers.push(userId);
      
      // Also unfollow each other
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userId
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );
      targetUser.following = targetUser.following.filter(
        id => id.toString() !== currentUser._id.toString()
      );
      currentUser.followers = currentUser.followers.filter(
        id => id.toString() !== userId
      );
      
      await currentUser.save();
      await targetUser.save();

      res.json({
        message: 'User blocked successfully',
        isBlocked: true
      });
    }

  } catch (error) {
    console.error('Block/Unblock error:', error);
    res.status(500).json({ message: 'Failed to block/unblock user' });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: searchRegex },
            { bio: searchRegex }
          ]
        },
        { _id: { $ne: req.user._id } }, // Exclude current user
        { isBanned: false } // Exclude banned users
      ]
    })
      .select('username avatar bio isOnline lastSeen')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ isOnline: -1, lastSeen: -1 });

    const total = await User.countDocuments({
      $and: [
        {
          $or: [
            { username: searchRegex },
            { bio: searchRegex }
          ]
        },
        { _id: { $ne: req.user._id } },
        { isBanned: false }
      ]
    });

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

// Get private messages with a user
router.get('/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user exists and is not blocked
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if either user has blocked the other
    if (req.user.blockedUsers.includes(userId) || 
        targetUser.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Cannot access messages with this user' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ],
      isDeleted: false
    })
      .populate('sender', 'username avatar')
      .populate('recipient', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      messages: messages.reverse(), // Show oldest first
      pagination: {
        current: page,
        limit
      }
    });

  } catch (error) {
    console.error('Get private messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

// Send private message
router.post('/sendMessage', [
  body('recipientId').notEmpty().withMessage('Recipient ID is required'),
  body('content').isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
  body('type').optional().isIn(['text', 'image', 'voice', 'video', 'file']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { recipientId, content, type = 'text', media } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if either user has blocked the other
    if (req.user.blockedUsers.includes(recipientId) || 
        recipient.blockedUsers.includes(req.user._id)) {
      return res.status(403).json({ message: 'Cannot send message to this user' });
    }

    // Check recipient's message preferences
    if (!recipient.preferences.allowDirectMessages && 
        !recipient.following.includes(req.user._id)) {
      return res.status(403).json({ message: 'User only accepts messages from people they follow' });
    }

    // Create message
    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content,
      type,
      media
    });

    await message.save();
    await message.populate('sender', 'username avatar');
    await message.populate('recipient', 'username avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send private message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get conversation list
router.get('/conversations', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get latest message with each user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ],
          recipient: { $exists: true }, // Only private messages
          isDeleted: false
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: {
              if: { $eq: ['$sender', req.user._id] },
              then: '$recipient',
              else: '$sender'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            _id: 1,
            username: 1,
            avatar: 1,
            isOnline: 1,
            lastSeen: 1
          },
          lastMessage: {
            content: 1,
            type: 1,
            createdAt: 1,
            isRead: 1
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit * 1
      }
    ]);

    res.json({
      conversations,
      pagination: {
        current: page,
        limit
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Failed to get conversations' });
  }
});

module.exports = router;
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');
const Transaction = require('../models/Transaction');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isOnline: true }),
      User.countDocuments({ isBanned: true }),
      Room.countDocuments({ isActive: true }),
      Message.countDocuments(),
      Transaction.countDocuments({ status: 'completed' })
    ]);

    const [totalUsers, onlineUsers, bannedUsers, activeRooms, totalMessages, totalTransactions] = stats;

    // Get revenue stats
    const revenueStats = await Transaction.aggregate([
      {
        $match: {
          type: 'purchase',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalCoins: { $sum: '$coins' }
        }
      }
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, totalCoins: 0 };

    // Get recent activity
    const recentUsers = await User.find()
      .select('username avatar createdAt isOnline')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentRooms = await Room.find({ isActive: true })
      .populate('host', 'username avatar')
      .select('name type currentParticipants createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        onlineUsers,
        bannedUsers,
        activeRooms,
        totalMessages,
        totalTransactions,
        totalRevenue: revenue.totalRevenue,
        totalCoins: revenue.totalCoins
      },
      recentUsers,
      recentRooms
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Failed to get dashboard stats' });
  }
});

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'online') {
      query.isOnline = true;
    } else if (status === 'verified') {
      query.isVerified = true;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// Get user details
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar')
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's transaction summary
    const transactionSummary = await Transaction.getUserSummary(userId);

    // Get user's recent activity
    const recentMessages = await Message.find({ sender: userId })
      .populate('room', 'name')
      .populate('recipient', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentRooms = await Room.find({ 
      'currentParticipants.user': userId 
    })
      .populate('host', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      user,
      transactionSummary,
      recentMessages,
      recentRooms
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Failed to get user details' });
  }
});

// Ban/Unban user
router.post('/users/:userId/ban', [
  body('reason').optional().isLength({ max: 500 }).withMessage('Ban reason too long'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { userId } = req.params;
    const { reason, duration } = req.body; // duration in hours

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }

    if (user.isBanned) {
      // Unban user
      user.isBanned = false;
      user.banReason = undefined;
      user.banExpires = undefined;
      await user.save();

      res.json({
        message: 'User unbanned successfully',
        user: user.getPublicProfile()
      });
    } else {
      // Ban user
      user.isBanned = true;
      user.banReason = reason || 'Violation of community guidelines';
      
      if (duration) {
        user.banExpires = new Date(Date.now() + duration * 60 * 60 * 1000);
      }

      // Set user offline
      user.isOnline = false;
      user.lastSeen = new Date();

      await user.save();

      res.json({
        message: 'User banned successfully',
        user: user.getPublicProfile()
      });
    }

  } catch (error) {
    console.error('Ban/Unban user error:', error);
    res.status(500).json({ message: 'Failed to ban/unban user' });
  }
});

// Delete user account
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // Remove user from all rooms
    await Room.updateMany(
      { 'currentParticipants.user': userId },
      { $pull: { currentParticipants: { user: userId } } }
    );

    // Mark user's messages as deleted
    await Message.updateMany(
      { sender: userId },
      { isDeleted: true, deletedAt: new Date() }
    );

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User account deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user account' });
  }
});

// Get all rooms with filters
router.get('/rooms', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query;

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const rooms = await Room.find(query)
      .populate('host', 'username avatar')
      .populate('currentParticipants.user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Room.countDocuments(query);

    res.json({
      rooms,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Failed to get rooms' });
  }
});

// Delete room
router.delete('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Deactivate room instead of deleting
    room.isActive = false;
    room.endedAt = new Date();
    await room.save();

    res.json({ message: 'Room deactivated successfully' });

  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Failed to delete room' });
  }
});

// Get reported content
router.get('/reports', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    // For demo purposes, return mock reported content
    // In production, you would have a separate Report model
    const reports = [
      {
        _id: '1',
        type: 'user',
        reportedUser: { username: 'baduser1', avatar: '' },
        reporter: { username: 'gooduser1', avatar: '' },
        reason: 'Inappropriate behavior',
        description: 'User was using offensive language',
        status: 'pending',
        createdAt: new Date()
      },
      {
        _id: '2',
        type: 'message',
        reportedMessage: { content: 'Spam message content' },
        reporter: { username: 'gooduser2', avatar: '' },
        reason: 'Spam',
        description: 'User is sending spam messages',
        status: 'resolved',
        createdAt: new Date()
      }
    ];

    res.json({
      reports,
      pagination: {
        current: page,
        pages: 1,
        total: reports.length
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Failed to get reports' });
  }
});

// Report user
router.post('/reportUser', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { userId, reason, description } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In production, save to Report model
    // For demo, just return success
    res.json({
      message: 'User reported successfully',
      reportId: `report_${Date.now()}`
    });

  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ message: 'Failed to report user' });
  }
});

// Get transaction analytics
router.get('/analytics/transactions', async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
          }
        };
        break;
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: weekStart } };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        };
        break;
    }

    const analytics = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalCoins: { $sum: '$coins' }
        }
      }
    ]);

    res.json({
      period,
      analytics
    });

  } catch (error) {
    console.error('Get transaction analytics error:', error);
    res.status(500).json({ message: 'Failed to get transaction analytics' });
  }
});

// Update gift catalog
router.post('/gifts/update', [
  body('gifts').isArray().withMessage('Gifts must be an array'),
  body('gifts.*.type').notEmpty().withMessage('Gift type is required'),
  body('gifts.*.name').notEmpty().withMessage('Gift name is required'),
  body('gifts.*.coins').isInt({ min: 1 }).withMessage('Gift coins must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { gifts } = req.body;

    // In production, save to database
    // For demo, just return success
    res.json({
      message: 'Gift catalog updated successfully',
      gifts
    });

  } catch (error) {
    console.error('Update gift catalog error:', error);
    res.status(500).json({ message: 'Failed to update gift catalog' });
  }
});

module.exports = router;
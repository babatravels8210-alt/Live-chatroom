const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const Room = require('../models/Room');

const router = express.Router();

// Gift types and their coin values
const GIFT_TYPES = {
  rose: { coins: 1, name: 'Rose', animation: 'rose-float' },
  heart: { coins: 5, name: 'Heart', animation: 'heart-pulse' },
  diamond: { coins: 10, name: 'Diamond', animation: 'diamond-sparkle' },
  crown: { coins: 50, name: 'Crown', animation: 'crown-glow' },
  car: { coins: 100, name: 'Sports Car', animation: 'car-drive' },
  house: { coins: 500, name: 'Mansion', animation: 'house-build' }
};

// Coin packages
const COIN_PACKAGES = {
  small: { coins: 100, price: 99, currency: 'INR' }, // ₹99 for 100 coins
  medium: { coins: 500, price: 449, currency: 'INR' }, // ₹449 for 500 coins
  large: { coins: 1000, price: 799, currency: 'INR' }, // ₹799 for 1000 coins
  mega: { coins: 2500, price: 1899, currency: 'INR' }, // ₹1899 for 2500 coins
  ultimate: { coins: 5000, price: 3499, currency: 'INR' } // ₹3499 for 5000 coins
};

// Get wallet balance and transaction history
router.get('/balance', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('coins');
    
    // Get recent transactions
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('gift.recipient', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get transaction summary
    const summary = await Transaction.getUserSummary(req.user._id);

    res.json({
      balance: user.coins,
      transactions,
      summary
    });

  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ message: 'Failed to get wallet balance' });
  }
});

// Get coin packages
router.get('/packages', (req, res) => {
  res.json({
    packages: COIN_PACKAGES,
    gifts: GIFT_TYPES
  });
});

// Add coins (purchase)
router.post('/addCoins', [
  body('packageId').isIn(Object.keys(COIN_PACKAGES)).withMessage('Invalid package ID'),
  body('paymentMethod').isIn(['razorpay', 'cashfree', 'google_play', 'app_store']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { packageId, paymentMethod, paymentDetails } = req.body;
    const package = COIN_PACKAGES[packageId];

    if (!package) {
      return res.status(400).json({ message: 'Invalid package' });
    }

    // Create transaction record
    const transaction = new Transaction({
      user: req.user._id,
      type: 'purchase',
      amount: package.price,
      coins: package.coins,
      currency: package.currency,
      paymentGateway: paymentMethod,
      paymentId: paymentDetails?.paymentId,
      orderId: paymentDetails?.orderId,
      signature: paymentDetails?.signature,
      status: 'pending'
    });

    await transaction.save();

    // For demo purposes, automatically approve the transaction
    // In production, this would be handled by payment gateway webhooks
    if (paymentDetails?.paymentId) {
      transaction.status = 'completed';
      await transaction.save();

      // Add coins to user account
      const user = await User.findById(req.user._id);
      user.coins += package.coins;
      await user.save();

      res.json({
        message: 'Coins added successfully',
        transaction: transaction.toObject(),
        newBalance: user.coins
      });
    } else {
      res.json({
        message: 'Payment initiated',
        transaction: transaction.toObject(),
        orderId: transaction._id
      });
    }

  } catch (error) {
    console.error('Add coins error:', error);
    res.status(500).json({ message: 'Failed to add coins' });
  }
});

// Send gift
router.post('/sendGift', [
  body('recipientId').notEmpty().withMessage('Recipient ID is required'),
  body('giftType').isIn(Object.keys(GIFT_TYPES)).withMessage('Invalid gift type'),
  body('roomId').optional().isMongoId().withMessage('Invalid room ID'),
  body('message').optional().isLength({ max: 200 }).withMessage('Message too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { recipientId, giftType, roomId, message } = req.body;
    const gift = GIFT_TYPES[giftType];

    if (!gift) {
      return res.status(400).json({ message: 'Invalid gift type' });
    }

    // Check if sender has enough coins
    const sender = await User.findById(req.user._id);
    if (sender.coins < gift.coins) {
      return res.status(400).json({ 
        message: 'Insufficient coins',
        required: gift.coins,
        available: sender.coins
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if in room context
    let room = null;
    if (roomId) {
      room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      // Check if both users are in the room
      const senderInRoom = room.currentParticipants.some(
        p => p.user.toString() === req.user._id.toString()
      );
      const recipientInRoom = room.currentParticipants.some(
        p => p.user.toString() === recipientId
      );

      if (!senderInRoom || !recipientInRoom) {
        return res.status(400).json({ message: 'Both users must be in the room to send gifts' });
      }
    }

    // Deduct coins from sender
    sender.coins -= gift.coins;
    await sender.save();

    // Add coins to recipient (50% of gift value)
    const recipientCoins = Math.floor(gift.coins * 0.5);
    recipient.coins += recipientCoins;
    await recipient.save();

    // Create transaction records
    const senderTransaction = new Transaction({
      user: req.user._id,
      type: 'gift_sent',
      amount: 0,
      coins: -gift.coins,
      status: 'completed',
      gift: {
        recipient: recipientId,
        giftType,
        message,
        room: roomId
      }
    });

    const recipientTransaction = new Transaction({
      user: recipientId,
      type: 'gift_received',
      amount: 0,
      coins: recipientCoins,
      status: 'completed',
      gift: {
        recipient: req.user._id, // sender from recipient's perspective
        giftType,
        message,
        room: roomId
      }
    });

    await Promise.all([senderTransaction.save(), recipientTransaction.save()]);

    // Create gift message
    const giftMessage = new Message({
      sender: req.user._id,
      recipient: roomId ? undefined : recipientId,
      room: roomId,
      content: message || `Sent a ${gift.name}!`,
      type: 'gift',
      gift: {
        type: giftType,
        value: gift.coins,
        animation: gift.animation
      }
    });

    await giftMessage.save();
    await giftMessage.populate('sender', 'username avatar');
    if (!roomId) {
      await giftMessage.populate('recipient', 'username avatar');
    }

    res.json({
      message: 'Gift sent successfully',
      gift: {
        type: giftType,
        name: gift.name,
        coins: gift.coins,
        animation: gift.animation
      },
      senderBalance: sender.coins,
      recipientEarned: recipientCoins,
      giftMessage
    });

  } catch (error) {
    console.error('Send gift error:', error);
    res.status(500).json({ message: 'Failed to send gift' });
  }
});

// Get transaction history
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    let query = { user: req.user._id };
    if (type && type !== 'all') {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate('gift.recipient', 'username avatar')
      .populate('gift.room', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to get transaction history' });
  }
});

// Get earnings summary
router.get('/earnings', async (req, res) => {
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
      case 'year':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1)
          }
        };
        break;
    }

    const earnings = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'gift_received',
          status: 'completed',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalCoins: { $sum: '$coins' },
          totalGifts: { $sum: 1 },
          giftTypes: {
            $push: '$gift.giftType'
          }
        }
      }
    ]);

    const result = earnings[0] || { totalCoins: 0, totalGifts: 0, giftTypes: [] };

    // Count gift types
    const giftTypeCounts = {};
    result.giftTypes.forEach(type => {
      giftTypeCounts[type] = (giftTypeCounts[type] || 0) + 1;
    });

    res.json({
      period,
      totalCoins: result.totalCoins,
      totalGifts: result.totalGifts,
      giftTypeCounts,
      currentBalance: req.user.coins
    });

  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ message: 'Failed to get earnings summary' });
  }
});

// Redeem coins (placeholder for future implementation)
router.post('/redeem', [
  body('amount').isInt({ min: 100 }).withMessage('Minimum redemption amount is 100 coins'),
  body('method').isIn(['bank_transfer', 'upi', 'paypal']).withMessage('Invalid redemption method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { amount, method, details } = req.body;

    // Check if user has enough coins
    if (req.user.coins < amount) {
      return res.status(400).json({ 
        message: 'Insufficient coins',
        available: req.user.coins,
        requested: amount
      });
    }

    // For demo purposes, just create a pending transaction
    const transaction = new Transaction({
      user: req.user._id,
      type: 'withdrawal',
      amount: amount * 0.01, // 1 coin = ₹0.01 (example rate)
      coins: -amount,
      currency: 'INR',
      status: 'pending',
      metadata: {
        redemptionMethod: method,
        redemptionDetails: details
      }
    });

    await transaction.save();

    res.json({
      message: 'Redemption request submitted successfully',
      transaction: transaction.toObject(),
      note: 'Your request will be processed within 3-5 business days'
    });

  } catch (error) {
    console.error('Redeem coins error:', error);
    res.status(500).json({ message: 'Failed to process redemption request' });
  }
});

module.exports = router;
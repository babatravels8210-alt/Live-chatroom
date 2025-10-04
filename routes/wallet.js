const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const Room = require('../models/Room');
const crypto = require('crypto');
const axios = require('axios');

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

// Cashfree API configuration
const CASHFREE_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.cashfree.com' 
  : 'https://sandbox.cashfree.com';

const getCashfreeHeaders = () => {
  return {
    'X-Client-Id': process.env.CASHFREE_APP_ID,
    'X-Client-Secret': process.env.CASHFREE_SECRET_KEY,
    'Content-Type': 'application/json',
    'x-api-version': '2023-08-01'
  };
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

// Create Cashfree payment order
router.post('/createOrder', [
  body('packageId').isIn(Object.keys(COIN_PACKAGES)).withMessage('Invalid package ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { packageId } = req.body;
    const package = COIN_PACKAGES[packageId];
    
    if (!package) {
      return res.status(400).json({ message: 'Invalid package' });
    }
    
    // Check if Cashfree credentials are configured
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res.status(500).json({ message: 'Payment gateway not configured properly' });
    }
    
    // Create order data
    const orderId = `order_${Date.now()}_${req.user._id}`;
    const orderData = {
      order_id: orderId,
      order_amount: package.price,
      order_currency: package.currency,
      customer_details: {
        customer_id: req.user._id.toString(),
        customer_email: req.user.email,
        customer_phone: "9999999999" // Placeholder, should be updated with actual user phone
      },
      order_meta: {
        return_url: process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/payment-success?order_id={order_id}` : `https://yourdomain.com/payment-success?order_id={order_id}`
      }
    };
    
    // Create order with Cashfree API
    const response = await axios.post(
      `${CASHFREE_BASE_URL}/pg/orders`,
      orderData,
      { headers: getCashfreeHeaders() }
    );
    
    if (response.data) {
      // Create transaction record
      const transaction = new Transaction({
        user: req.user._id,
        type: 'purchase',
        amount: package.price,
        coins: package.coins,
        currency: package.currency,
        paymentGateway: 'cashfree',
        orderId: orderId,
        status: 'pending'
      });
      
      await transaction.save();
      
      res.json({
        message: 'Order created successfully',
        orderId: response.data.order_id,
        paymentLink: response.data.payment_link,
        transactionId: transaction._id
      });
    } else {
      res.status(500).json({ message: 'Failed to create payment order' });
    }
    
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
});

// Verify Cashfree payment
router.post('/verifyPayment', [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('transactionId').notEmpty().withMessage('Transaction ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    
    const { orderId, transactionId } = req.body;
    
    // Check if Cashfree credentials are configured
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res.status(500).json({ message: 'Payment gateway not configured properly' });
    }
    
    // Get order status from Cashfree API
    const response = await axios.get(
      `${CASHFREE_BASE_URL}/pg/orders/${orderId}`,
      { headers: getCashfreeHeaders() }
    );
    
    if (response.data) {
      const orderStatus = response.data.order_status;
      const paymentDetails = response.data.payment_details;
      
      // Find transaction
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      if (transaction.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // Update transaction based on payment status
      if (orderStatus === 'PAID') {
        transaction.status = 'completed';
        transaction.paymentId = paymentDetails ? paymentDetails.payment_id : null;
        await transaction.save();
        
        // Add coins to user account
        const user = await User.findById(req.user._id);
        user.coins += transaction.coins;
        await user.save();
        
        res.json({
          message: 'Payment verified and coins added successfully',
          transaction: transaction.toObject(),
          newBalance: user.coins
        });
      } else if (orderStatus === 'CANCELLED' || orderStatus === 'FAILED') {
        transaction.status = 'failed';
        await transaction.save();
        
        res.status(400).json({
          message: 'Payment failed or cancelled',
          transaction: transaction.toObject()
        });
      } else {
        res.json({
          message: 'Payment status pending',
          transaction: transaction.toObject(),
          status: orderStatus
        });
      }
    } else {
      res.status(500).json({ message: 'Failed to verify payment' });
    }
    
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
});

// Handle Cashfree webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const payload = req.body;
    
    // Verify webhook signature
    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }
    
    if (!signature) {
      return res.status(400).json({ message: 'Missing signature' });
    }
    
    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload + timestamp)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    
    // Parse payload
    const eventData = JSON.parse(payload.toString());
    const orderId = eventData.data.order_id;
    const orderStatus = eventData.data.order_status;
    
    // Find transaction by orderId
    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Update transaction based on webhook event
    if (orderStatus === 'PAID') {
      transaction.status = 'completed';
      transaction.paymentId = eventData.data.payment_details ? eventData.data.payment_details.payment_id : null;
      await transaction.save();
      
      // Add coins to user account
      const user = await User.findById(transaction.user);
      if (user) {
        user.coins += transaction.coins;
        await user.save();
      }
    } else if (orderStatus === 'CANCELLED' || orderStatus === 'FAILED') {
      transaction.status = 'failed';
      await transaction.save();
    }
    
    res.json({ message: 'Webhook processed successfully' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Failed to process webhook', error: error.message });
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
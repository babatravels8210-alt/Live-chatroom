const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Message = require('../models/Message');
const Room = require('../models/Room');
const cashfreeService = require('../services/cashfreeService');

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
  body('paymentMethod').isIn(['cashfree', 'google_play', 'app_store']).withMessage('Invalid payment method')
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

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${req.user._id}`;

    // Create transaction record
    const transaction = new Transaction({
      user: req.user._id,
      type: 'purchase',
      amount: package.price,
      coins: package.coins,
      currency: package.currency,
      paymentGateway: paymentMethod,
      orderId: orderId,
      status: 'pending'
    });

    await transaction.save();

    // Handle Cashfree payment
    if (paymentMethod === 'cashfree') {
      // Create Cashfree order
      const cashfreeOrder = await cashfreeService.createOrder({
        amount: package.price,
        currency: package.currency,
        orderId: orderId,
        customerDetails: {
          customerId: req.user._id.toString(),
          phone: req.user.phone || '9999999999',
          email: req.user.email,
          name: req.user.username
        },
        returnUrl: `${process.env.CLIENT_URL}/payment/callback`,
        orderNote: `Purchase of ${package.coins} coins`,
        orderTags: {
          packageId: packageId,
          userId: req.user._id.toString()
        }
      });

      if (!cashfreeOrder.success) {
        transaction.status = 'failed';
        await transaction.save();
        return res.status(500).json({ 
          message: 'Failed to create payment order',
          error: cashfreeOrder.error
        });
      }

      // Update transaction with Cashfree order details
      transaction.paymentId = cashfreeOrder.data.cf_order_id;
      transaction.metadata = {
        payment_session_id: cashfreeOrder.data.payment_session_id,
        order_status: cashfreeOrder.data.order_status
      };
      await transaction.save();

      return res.json({
        message: 'Payment order created successfully',
        transaction: transaction.toObject(),
        paymentSessionId: cashfreeOrder.data.payment_session_id,
        orderId: orderId,
        cashfreeOrderId: cashfreeOrder.data.cf_order_id
      });
    }

    // For demo purposes with other payment methods, automatically approve the transaction
    // In production, this would be handled by payment gateway webhooks
    if (paymentDetails?.paymentId) {
      transaction.status = 'completed';
      transaction.paymentId = paymentDetails.paymentId;
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

  // Cashfree Payment Webhook
  router.post("/webhook/cashfree", async (req, res) => {
    try {
      const signature = req.headers["x-webhook-signature"];
      const timestamp = req.headers["x-webhook-timestamp"];
      const rawBody = JSON.stringify(req.body);

      // Verify webhook signature
      const isValid = cashfreeService.verifyWebhookSignature(signature, rawBody, timestamp);
      
      if (!isValid) {
        console.error("Invalid webhook signature");
        return res.status(400).json({ message: "Invalid signature" });
      }

      const webhookData = req.body;
      const { type, data } = webhookData;

      // Handle payment success
      if (type === "PAYMENT_SUCCESS_WEBHOOK") {
        const orderId = data.order.order_id;
        const paymentId = data.payment.cf_payment_id;
        const paymentStatus = data.payment.payment_status;

        if (paymentStatus === "SUCCESS") {
          // Find transaction by order ID
          const transaction = await Transaction.findOne({ orderId: orderId });

          if (!transaction) {
            console.error("Transaction not found for order:", orderId);
            return res.status(404).json({ message: "Transaction not found" });
          }

          // Update transaction status
          transaction.status = "completed";
          transaction.paymentId = paymentId;
          transaction.metadata = {
            ...transaction.metadata,
            payment_method: data.payment.payment_method,
            payment_time: data.payment.payment_time
          };
          await transaction.save();

          // Add coins to user account
          const user = await User.findById(transaction.user);
          if (user) {
            user.coins += transaction.coins;
            await user.save();
            console.log(`Added ${transaction.coins} coins to user ${user._id}`);
          }
        }
      }

      // Handle payment failure
      if (type === "PAYMENT_FAILED_WEBHOOK") {
        const orderId = data.order.order_id;
        
        const transaction = await Transaction.findOne({ orderId: orderId });
        if (transaction) {
          transaction.status = "failed";
          transaction.metadata = {
            ...transaction.metadata,
            failure_reason: data.payment.payment_message
          };
          await transaction.save();
        }
      }

      res.status(200).json({ message: "Webhook processed successfully" });

    } catch (error) {
      console.error("Cashfree webhook error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Verify payment status (for client-side verification)
  router.get("/verify-payment/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;

      // Get order from Cashfree
      const cashfreeOrder = await cashfreeService.getOrder(orderId);

      if (!cashfreeOrder.success) {
        return res.status(404).json({ 
          message: "Order not found",
          error: cashfreeOrder.error
        });
      }

      // Get transaction from database
      const transaction = await Transaction.findOne({ orderId: orderId });

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Get payment details
      const paymentDetails = await cashfreeService.getPaymentDetails(orderId);

      res.json({
        order: cashfreeOrder.data,
        transaction: transaction.toObject(),
        payments: paymentDetails.success ? paymentDetails.data : []
      });

    } catch (error) {
      console.error("Verify payment error:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });


module.exports = router;
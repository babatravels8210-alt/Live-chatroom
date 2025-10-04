const express = require('express');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const router = express.Router();

// Handle Cashfree webhook
router.post('/cashfree-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const payload = req.body;
    
    // Verify webhook signature
    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }
    
    if (!signature) {
      console.error('Missing signature in webhook request');
      return res.status(400).json({ message: 'Missing signature' });
    }
    
    if (!timestamp) {
      console.error('Missing timestamp in webhook request');
      return res.status(400).json({ message: 'Missing timestamp' });
    }
    
    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload + timestamp)
      .digest('hex');
    
    // Compare signatures
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }
    
    // Parse payload
    const eventData = JSON.parse(payload.toString());
    const eventType = eventData.type;
    const orderId = eventData.data.order_id;
    const orderStatus = eventData.data.order_status;
    
    console.log(`Received Cashfree webhook: ${eventType} for order ${orderId} with status ${orderStatus}`);
    
    // Find transaction by orderId
    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) {
      console.error(`Transaction not found for order ID: ${orderId}`);
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Handle different event types
    switch (eventType) {
      case 'PAYMENT_SUCCESS':
        // Update transaction status
        transaction.status = 'completed';
        transaction.paymentId = eventData.data.payment_details ? eventData.data.payment_details.payment_id : null;
        await transaction.save();
        
        // Add coins to user account
        const user = await User.findById(transaction.user);
        if (user) {
          user.coins += transaction.coins;
          await user.save();
          console.log(`Added ${transaction.coins} coins to user ${user._id}`);
        }
        break;
        
      case 'PAYMENT_FAILED':
        transaction.status = 'failed';
        transaction.failureReason = eventData.data.error_details ? eventData.data.error_details.error_description : 'Payment failed';
        await transaction.save();
        console.log(`Marked transaction ${transaction._id} as failed`);
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }
    
    res.json({ message: 'Webhook processed successfully' });
    
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    res.status(500).json({ message: 'Failed to process webhook', error: error.message });
  }
});

module.exports = router;
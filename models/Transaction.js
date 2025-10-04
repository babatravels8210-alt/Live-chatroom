const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'gift_sent', 'gift_received', 'refund', 'bonus', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  coins: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Payment gateway details
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'cashfree', 'google_play', 'app_store'],
    required: function() {
      return this.type === 'purchase';
    }
  },
  paymentId: String,
  orderId: String,
  signature: String,
  
  // Gift details
  gift: {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    giftType: String,
    message: String,
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    }
  },
  
  // Transaction status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Failure details
  failureReason: String,
  
  // Metadata
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    userAgent: String
  },
  
  // Admin notes
  adminNotes: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ paymentId: 1 });
transactionSchema.index({ orderId: 1 });

// Static method to get user transaction summary
transactionSchema.statics.getUserSummary = async function(userId) {
  const summary = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        totalCoins: { $sum: '$coins' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return summary.reduce((acc, item) => {
    acc[item._id] = {
      totalAmount: item.totalAmount,
      totalCoins: item.totalCoins,
      count: item.count
    };
    return acc;
  }, {});
};

module.exports = mongoose.model('Transaction', transactionSchema);
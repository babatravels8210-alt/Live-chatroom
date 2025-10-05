const { Cashfree } = require('cashfree-pg');

// Initialize Cashfree with environment configuration
const initializeCashfree = () => {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const environment = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX';

  if (!appId || !secretKey) {
    throw new Error('Cashfree credentials not configured. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in environment variables.');
  }

  // Set environment (SANDBOX or PRODUCTION)
  const cashfreeEnv = environment === 'PRODUCTION' ? Cashfree.PRODUCTION : Cashfree.SANDBOX;
  
  return new Cashfree(cashfreeEnv, appId, secretKey);
};

/**
 * Create a payment order with Cashfree
 * @param {Object} orderData - Order details
 * @param {number} orderData.amount - Order amount
 * @param {string} orderData.currency - Currency code (default: INR)
 * @param {string} orderData.orderId - Unique order ID
 * @param {Object} orderData.customerDetails - Customer information
 * @param {string} orderData.returnUrl - URL to redirect after payment
 * @returns {Promise<Object>} - Cashfree order response
 */
const createOrder = async (orderData) => {
  try {
    const cashfree = initializeCashfree();

    const request = {
      order_amount: orderData.amount,
      order_currency: orderData.currency || 'INR',
      order_id: orderData.orderId,
      customer_details: {
        customer_id: orderData.customerDetails.customerId,
        customer_phone: orderData.customerDetails.phone,
        customer_email: orderData.customerDetails.email || `${orderData.customerDetails.customerId}@example.com`,
        customer_name: orderData.customerDetails.name || 'Customer'
      },
      order_meta: {
        return_url: orderData.returnUrl || `${process.env.CLIENT_URL}/payment/callback`
      }
    };

    // Add optional fields if provided
    if (orderData.orderNote) {
      request.order_note = orderData.orderNote;
    }

    if (orderData.orderTags) {
      request.order_tags = orderData.orderTags;
    }

    const response = await cashfree.PGCreateOrder(request);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Cashfree Create Order Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Get order details from Cashfree
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Order details
 */
const getOrder = async (orderId) => {
  try {
    const cashfree = initializeCashfree();
    const response = await cashfree.PGFetchOrder(orderId);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Cashfree Get Order Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Verify payment signature from Cashfree webhook
 * @param {string} signature - Webhook signature
 * @param {string} rawBody - Raw request body
 * @param {string} timestamp - Webhook timestamp
 * @returns {boolean} - Verification result
 */
const verifyWebhookSignature = (signature, rawBody, timestamp) => {
  try {
    const cashfree = initializeCashfree();
    cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
    return true;
  } catch (error) {
    console.error('Cashfree Webhook Verification Error:', error.message);
    return false;
  }
};

/**
 * Get payment details for an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Payment details
 */
const getPaymentDetails = async (orderId) => {
  try {
    const cashfree = initializeCashfree();
    const response = await cashfree.PGOrderFetchPayments(orderId);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Cashfree Get Payment Details Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Create a refund for a payment
 * @param {Object} refundData - Refund details
 * @param {string} refundData.orderId - Order ID
 * @param {string} refundData.refundId - Unique refund ID
 * @param {number} refundData.refundAmount - Amount to refund
 * @param {string} refundData.refundNote - Reason for refund
 * @returns {Promise<Object>} - Refund response
 */
const createRefund = async (refundData) => {
  try {
    const cashfree = initializeCashfree();
    
    const request = {
      order_id: refundData.orderId,
      refund_id: refundData.refundId,
      refund_amount: refundData.refundAmount,
      refund_note: refundData.refundNote || 'Refund requested'
    };

    const response = await cashfree.PGOrderCreateRefund(request);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Cashfree Create Refund Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

module.exports = {
  createOrder,
  getOrder,
  verifyWebhookSignature,
  getPaymentDetails,
  createRefund
};
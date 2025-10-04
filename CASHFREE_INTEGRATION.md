# Cashfree Payment Integration Documentation

This document explains how the Cashfree payment gateway is integrated into the Date Chat Pro application.

## Overview

The Cashfree payment integration allows users to purchase coins for the virtual wallet system. Coins can be used to send gifts to other users in the dating platform.

## Implementation Details

### Backend Integration

The backend uses direct API calls to Cashfree instead of the SDK to avoid DOM-related issues in the Node.js environment.

#### Key Components

1. **Environment Configuration**
   - `CASHFREE_APP_ID`: Your Cashfree application ID
   - `CASHFREE_SECRET_KEY`: Your Cashfree secret key
   - `CASHFREE_WEBHOOK_SECRET`: Secret for webhook verification

2. **API Endpoints**
   - `/api/wallet/createOrder`: Creates a payment order with Cashfree
   - `/api/wallet/verifyPayment`: Manually verifies payment status
   - `/api/wallet/webhook`: Handles automatic payment status updates from Cashfree

3. **Coin Packages**
   - Small: 100 coins for ₹99
   - Medium: 500 coins for ₹449
   - Large: 1000 coins for ₹799
   - Mega: 2500 coins for ₹1899
   - Ultimate: 5000 coins for ₹3499

### Frontend Integration

The frontend provides a user interface for purchasing coins and sending gifts.

#### Payment Flow

1. User selects a coin package
2. Application creates a Cashfree order
3. User is redirected to Cashfree payment page
4. After payment, user is redirected back to application
5. Application verifies payment status
6. Coins are added to user's wallet

## API Implementation

### Creating a Payment Order

```javascript
// POST /api/wallet/createOrder
const orderData = {
  order_id: `order_${Date.now()}_${userId}`,
  order_amount: packagePrice,
  order_currency: 'INR',
  customer_details: {
    customer_id: userId,
    customer_email: userEmail
  }
};

const response = await axios.post(
  `${CASHFREE_BASE_URL}/pg/orders`,
  orderData,
  { headers: getCashfreeHeaders() }
);
```

### Verifying Payment Status

```javascript
// POST /api/wallet/verifyPayment
const response = await axios.get(
  `${CASHFREE_BASE_URL}/pg/orders/${orderId}`,
  { headers: getCashfreeHeaders() }
);
```

### Webhook Handling

```javascript
// POST /api/wallet/webhook
const signature = req.headers['x-webhook-signature'];
const timestamp = req.headers['x-webhook-timestamp'];
const payload = req.body;

const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload + timestamp)
  .digest('hex');
```

## Security Considerations

1. All API calls to Cashfree include proper authentication headers
2. Webhook requests are verified using HMAC signatures
3. Payment data is stored securely in the database
4. User coins are updated only after successful payment verification

## Error Handling

The integration includes comprehensive error handling for:
- Network failures
- Authentication errors
- Invalid responses
- Webhook verification failures

## Testing

To test the payment integration:
1. Configure Cashfree sandbox credentials
2. Use test payment methods provided by Cashfree
3. Verify transaction records in the database

## Deployment

For production deployment:
1. Update environment variables with production credentials
2. Configure webhook URL in Cashfree dashboard
3. Test payment flow with small transactions

## Troubleshooting

Common issues and solutions:
- **DOM-related errors**: Using direct API calls instead of SDK
- **Authentication failures**: Verify environment variables
- **Webhook not received**: Check Cashfree dashboard configuration
- **Coins not updated**: Verify webhook signature verification
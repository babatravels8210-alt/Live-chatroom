# Cashfree Payment Gateway Setup Guide

This guide will help you set up Cashfree Payment Gateway for the Live Chatroom application.

## Prerequisites

- Cashfree account (Sign up at [https://www.cashfree.com/](https://www.cashfree.com/))
- Node.js application with the Cashfree SDK installed

## Step 1: Get Cashfree Credentials

1. Log in to your [Cashfree Merchant Dashboard](https://merchant.cashfree.com/merchants/login)
2. Navigate to **Developers** → **API Keys**
3. Copy your credentials:
   - **App ID** (Client ID)
   - **Secret Key** (Client Secret)

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# Payment Gateway (Cashfree)
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENVIRONMENT=SANDBOX  # Use PRODUCTION for live environment
```

### Environment Options:
- **SANDBOX**: For testing (uses sandbox.cashfree.com)
- **PRODUCTION**: For live transactions (uses api.cashfree.com)

## Step 3: Install Dependencies

```bash
npm install cashfree-pg
```

## Step 4: Configure Webhook URL

1. Go to your Cashfree Dashboard
2. Navigate to **Developers** → **Webhooks**
3. Add your webhook URL:
   ```
   https://your-domain.com/api/wallet/webhook/cashfree
   ```
4. Select the following webhook events:
   - Payment Success
   - Payment Failed
   - Payment User Dropped

## Step 5: Test the Integration

### Testing in Sandbox Mode

1. Set `CASHFREE_ENVIRONMENT=SANDBOX` in your `.env` file
2. Use Cashfree's test credentials
3. Use test card details for payments:
   - **Card Number**: 4111 1111 1111 1111
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **OTP**: 123456

### API Endpoints

#### 1. Create Payment Order
```
POST /api/wallet/addCoins
```

**Request Body:**
```json
{
  "packageId": "small",
  "paymentMethod": "cashfree"
}
```

**Response:**
```json
{
  "message": "Payment order created successfully",
  "transaction": { ... },
  "paymentSessionId": "session_xxx",
  "orderId": "order_xxx",
  "cashfreeOrderId": "cf_order_xxx"
}
```

#### 2. Verify Payment
```
GET /api/wallet/verify-payment/:orderId
```

**Response:**
```json
{
  "order": { ... },
  "transaction": { ... },
  "payments": [ ... ]
}
```

## Step 6: Frontend Integration

### Using Cashfree Checkout

```javascript
// After creating order, use the payment session ID
const paymentSessionId = response.paymentSessionId;

// Load Cashfree SDK
const cashfree = Cashfree({
  mode: "sandbox" // or "production"
});

// Create checkout
const checkoutOptions = {
  paymentSessionId: paymentSessionId,
  returnUrl: "https://your-domain.com/payment/callback"
};

cashfree.checkout(checkoutOptions);
```

### Payment Callback Handling

After payment, Cashfree will redirect to your `returnUrl` with order details:

```javascript
// In your callback page
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('order_id');

// Verify payment status
fetch(`/api/wallet/verify-payment/${orderId}`)
  .then(response => response.json())
  .then(data => {
    if (data.order.order_status === 'PAID') {
      // Payment successful
      console.log('Payment completed!');
    } else {
      // Payment failed or pending
      console.log('Payment status:', data.order.order_status);
    }
  });
```

## Coin Packages

The following coin packages are available:

| Package | Coins | Price (INR) |
|---------|-------|-------------|
| Small   | 100   | ₹99         |
| Medium  | 500   | ₹449        |
| Large   | 1000  | ₹799        |
| Mega    | 2500  | ₹1899       |
| Ultimate| 5000  | ₹3499       |

## Security Best Practices

1. **Never expose your Secret Key** in client-side code
2. **Always verify webhook signatures** to ensure requests are from Cashfree
3. **Use HTTPS** for all API endpoints
4. **Validate order amounts** on the server side
5. **Store sensitive data securely** in environment variables

## Webhook Signature Verification

Cashfree sends a signature with each webhook request. The application automatically verifies this signature using the `cashfreeService.verifyWebhookSignature()` method.

## Troubleshooting

### Common Issues

1. **"Cashfree credentials not configured" error**
   - Ensure `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` are set in `.env`
   - Restart your server after updating environment variables

2. **Payment order creation fails**
   - Check if your Cashfree account is activated
   - Verify your API credentials are correct
   - Ensure you're using the correct environment (SANDBOX/PRODUCTION)

3. **Webhook not receiving events**
   - Verify webhook URL is publicly accessible
   - Check webhook configuration in Cashfree Dashboard
   - Ensure your server is running and accepting POST requests

4. **Payment verification fails**
   - Check if the order ID is correct
   - Verify the payment was actually completed
   - Check Cashfree Dashboard for payment status

## Support

- **Cashfree Documentation**: [https://docs.cashfree.com/](https://docs.cashfree.com/)
- **Cashfree Support**: [https://www.cashfree.com/contact-us/](https://www.cashfree.com/contact-us/)
- **Developer Community**: [Discord](https://discord.gg/cashfree)

## Migration from Razorpay

If you're migrating from Razorpay:

1. The payment flow remains similar
2. Update your frontend to use Cashfree SDK instead of Razorpay
3. Update environment variables
4. Test thoroughly in sandbox mode before going live
5. Update webhook URLs in your payment gateway dashboard

## Additional Resources

- [Cashfree Node.js SDK](https://github.com/cashfree/cashfree-pg-sdk-nodejs)
- [API Reference](https://docs.cashfree.com/reference/pg-new-apis-endpoint)
- [Integration Guide](https://docs.cashfree.com/docs/payment-gateway)
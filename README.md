# Date Chat Pro - Live Chat & Dating Application

A premium dating and live chat application with video calling capabilities, virtual wallet system, and gift sending features.

## Features

- **Real-time Chat**: Powered by Socket.IO for instant messaging
- **Video/Voice Calls**: WebRTC integration for high-quality communication
- **Dating Profile System**: Complete profile management with discovery features
- **Virtual Wallet**: Coin-based economy with purchase and gift functionalities
- **Payment Integration**: Cashfree payment gateway for coin purchases
- **Admin Panel**: User moderation and analytics dashboard
- **Responsive UI**: Beautiful React TypeScript frontend

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Redis for session management
- Socket.IO for real-time communication
- JWT for authentication
- Cashfree Payment Gateway SDK

### Frontend
- React 18 with TypeScript
- Socket.IO Client
- Axios for API calls
- Responsive CSS design

## Payment Integration (Cashfree)

This application uses Cashfree as the payment gateway for purchasing coins. The integration includes:

1. **Order Creation**: Users can purchase coin packages through Cashfree
2. **Payment Verification**: Server-side verification of payment status
3. **Webhook Handling**: Automatic processing of payment success/failure events
4. **Transaction Logging**: Complete record of all payment transactions

### Environment Variables

To configure Cashfree payments, set the following environment variables:

```
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_WEBHOOK_SECRET=your_cashfree_webhook_secret
```

### Cashfree Setup

1. Create an account at [Cashfree](https://www.cashfree.com/)
2. Create an application in the Cashfree dashboard
3. Obtain your App ID and Secret Key
4. Set up webhook URL to point to `/api/wallet/webhook`
5. Configure the webhook secret in your environment variables

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Rooms
- `GET /api/rooms` - Get all chat rooms
- `GET /api/rooms/:id` - Get specific room details
- `POST /api/rooms` - Create a new room
- `POST /api/rooms/:id/join` - Join a room
- `POST /api/rooms/:id/leave` - Leave a room
- `GET /api/rooms/:id/messages` - Get room messages

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload user avatar
- `POST /api/users/block/:id` - Block a user
- `POST /api/users/unblock/:id` - Unblock a user
- `GET /api/users/blocked` - Get blocked users list
- `GET /api/users/search` - Search users

### Dating
- `GET /api/dating/profile/me` - Get own dating profile
- `POST /api/dating/profile` - Create/update dating profile
- `GET /api/dating/profile/:id` - Get public dating profile
- `GET /api/dating/discover` - Discover potential matches
- `POST /api/dating/like/:id` - Like a user
- `POST /api/dating/pass/:id` - Pass on a user
- `GET /api/dating/matches` - Get matches
- `DELETE /api/dating/unmatch/:id` - Unmatch a user
- `GET /api/dating/likes/received` - Get received likes
- `GET /api/dating/likes/given` - Get given likes

### Wallet
- `GET /api/wallet/balance` - Get wallet balance and transaction history
- `GET /api/wallet/packages` - Get available coin packages
- `POST /api/wallet/createOrder` - Create Cashfree payment order
- `POST /api/wallet/verifyPayment` - Verify Cashfree payment status
- `POST /api/wallet/sendGift` - Send gift to another user
- `GET /api/wallet/transactions` - Get transaction history
- `GET /api/wallet/earnings` - Get earnings summary
- `POST /api/wallet/redeem` - Redeem coins (placeholder)
- `POST /api/wallet/webhook` - Cashfree webhook endpoint

## Deployment

### Render Deployment

This application is configured for deployment on Render. The `render.yaml` file contains all necessary configuration.

1. Fork this repository
2. Connect your fork to Render
3. Add environment variables in Render dashboard:
   - `CASHFREE_APP_ID`
   - `CASHFREE_SECRET_KEY`
   - `CASHFREE_WEBHOOK_SECRET`
   - `MONGODB_URI`
   - `REDIS_URL`
   - `JWT_SECRET`

Render will automatically handle the build and deployment process.

### Docker Deployment

You can also deploy using Docker:

```bash
docker-compose up -d
```

This will start the application with MongoDB and Redis containers.

## Development

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/date-chat-pro.git
   cd date-chat-pro
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your actual values
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Start the client:
   ```bash
   cd client
   npm start
   ```

### Building for Production

1. Build the client:
   ```bash
   npm run build:client
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact the development team or create an issue in the repository.
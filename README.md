# Date Chat Pro - Premium Dating & Live Chat Application

A comprehensive dating application with real-time chat, video calling, and premium features built with Node.js, React, and Socket.IO.

## 🚀 Live Demo

**Production URL**: [https://datechatpro.onrender.com](https://datechatpro.onrender.com)

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication
- OAuth integration (Google, Facebook)
- Email/Phone verification
- Rate limiting and security headers
- Password reset functionality

### 💕 Dating Features
- **Smart Matching Algorithm**: AI-powered matching based on preferences
- **Swipe Interface**: Tinder-like swipe functionality
- **Real-time Chat**: Instant messaging with read receipts
- **Video Calling**: WebRTC-powered video calls
- **Profile Verification**: Photo and identity verification
- **Advanced Filters**: Age, location, interests, lifestyle preferences

### 📱 User Features
- **Comprehensive Profiles**: Detailed dating profiles with photos
- **Photo Uploads**: Multiple photos with Cloudinary integration
- **Interest Tags**: Add interests and hobbies
- **Privacy Controls**: Control who can see and message you
- **Block/Report**: Safety features for users

### 💰 Premium Features
- **Unlimited Likes**: Like unlimited profiles
- **Super Likes**: Stand out from the crowd
- **Boost**: Increase profile visibility
- **See Who Likes You**: View your admirers
- **Rewind**: Undo accidental swipes
- **Passport**: Match with people worldwide

### 💬 Communication
- **Real-time Messaging**: Instant chat with typing indicators
- **Video/Voice Calls**: High-quality WebRTC calls
- **Message Reactions**: React to messages with emojis
- **Media Sharing**: Share photos and videos
- **Gift System**: Send virtual gifts

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Primary database
- **Redis** - Caching and sessions
- **JWT** - Authentication tokens
- **Cloudinary** - Image storage
- **Razorpay** - Payment processing

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Socket.IO Client** - Real-time features
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/babatravels8210-alt/Live-chatroom.git
cd date-chat-pro
```

### 2. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=12000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/datechatpro
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Start Development

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:12000

## 🏗️ Building for Production

### Build Commands
```bash
# Build client
npm run build:client

# Start production server
npm start
```

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Dating Endpoints
- `GET /api/dating/profile/me` - Get user's dating profile
- `POST /api/dating/profile` - Create/update dating profile
- `GET /api/dating/discover` - Get potential matches
- `POST /api/dating/like/:userId` - Like a user
- `GET /api/dating/matches` - Get user's matches

## 📄 License

This project is licensed under the MIT License.
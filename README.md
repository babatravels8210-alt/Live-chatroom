# Achat Pro - Voice Chat Application 🎤

A comprehensive voice chat application inspired by Achat Pro, featuring 24/7 live voice party rooms, gaming features, virtual gifts, and social interactions.

## 🚀 Live Demo
**Live Development URL**: [https://12000-396275ca-08c5-41d8-9348-a8697b89621b.proxy.daytona.works](https://12000-396275ca-08c5-41d8-9348-a8697b89621b.proxy.daytona.works)

**GitHub Repository**: [https://github.com/babatravels8210-alt/Live-chatroom](https://github.com/babatravels8210-alt/Live-chatroom)

## ✨ Features

### 🎤 Voice Chat Rooms
- **24/7 Live Voice Rooms** - Always active voice chat spaces
- **Multiple Themes** - Gaming, Music, Study, Karaoke, Dating, Comedy
- **User Roles** - Host, Speaker, Audience with different permissions
- **Real-time Voice** - High-quality voice streaming with Agora SDK
- **Room Management** - Create, join, and manage voice rooms

### 🎮 Gaming Features
- **Interactive Games** - Built-in games within voice rooms
- **Voice-based Gaming** - Play games using voice commands
- **Tournaments** - Compete with other users in voice rooms
- **Leaderboards** - Track gaming achievements and rankings

### 🎁 Gift System
- **Virtual Gifts** - Send animated gifts to users
- **Gift Categories** - Love, Romance, Luxury, Royal, Mythical
- **Rarity Levels** - Common, Rare, Epic, Legendary gifts
- **Coin Economy** - Earn and spend coins on gifts

### 👥 Social Features
- **User Profiles** - Customizable profiles with voice verification
- **Friend System** - Add friends and create groups
- **Family System** - Create and join voice chat families
- **Matching** - Find people with similar interests

### 💎 Premium Features
- **VIP Membership** - Exclusive rooms and features
- **Boost Profile** - Increase visibility in rooms
- **Premium Gifts** - Access to exclusive gift categories
- **Priority Support** - Dedicated customer support

### 🔒 Safety Features
- **Voice Verification** - Verify users with voice recognition
- **Moderation Tools** - Report and block problematic users
- **Content Filtering** - Automatic detection of inappropriate content
- **Privacy Controls** - Control who can see and interact with you

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Primary database
- **Redis** - Caching and sessions
- **Agora SDK** - Voice chat infrastructure
- **JWT** - Authentication tokens
- **Cloudinary** - Media storage

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Socket.IO Client** - Real-time features
- **Agora RTC SDK** - Voice chat client
- **React Router** - Navigation
- **CSS3** - Modern styling with animations

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/babatravels8210-alt/Live-chatroom.git
cd achat-pro
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
# Application Settings
NODE_ENV=development
PORT=12000
CLIENT_URL=http://localhost:3000

# Database
DB_URI=mongodb://localhost:27017/achatpro
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Agora (Voice Chat)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate

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

## 📱 API Documentation

### Voice Room Endpoints
- `GET /api/voice/rooms` - Get all voice rooms
- `POST /api/voice/rooms` - Create new voice room
- `GET /api/voice/rooms/:roomId` - Get specific room details
- `POST /api/voice/rooms/:roomId/join` - Join a voice room
- `POST /api/voice/rooms/:roomId/leave` - Leave a voice room

### User Management
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Gift System
- `GET /api/gifts` - Get available gifts
- `POST /api/gifts/send` - Send gift to user
- `GET /api/wallet/balance` - Get user coin balance
- `POST /api/wallet/purchase` - Purchase coins

## 🎮 Features in Development

### Phase 2: Advanced Features
- [ ] Gaming integration (Car racing, Draw & Guess)
- [ ] Voice effects and filters
- [ ] Room recording and playback
- [ ] AI-powered moderation
- [ ] Advanced analytics dashboard

### Phase 3: Social Expansion
- [ ] Family system with ranks
- [ ] Voice-based matching algorithm
- [ ] Virtual events and parties
- [ ] Cross-platform mobile app
- [ ] Integration with music streaming services

## 🔧 Configuration

### Agora Setup
1. Create account at [Agora.io](https://www.agora.io/)
2. Create new project and get App ID
3. Generate temporary tokens for testing
4. Update environment variables with your credentials

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create database named "achatpro"
3. Update connection string in environment variables

### Cloudinary Setup
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get cloud name, API key, and API secret
3. Update environment variables

## 📁 Project Structure

```
achat-pro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── voice/      # Voice chat components
│   │   │   ├── gift/       # Gift system components
│   │   │   └── dating/     # Legacy dating components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
├── routes/                 # Express routes
├── models/                 # MongoDB models
├── middleware/             # Express middleware
├── socket/                 # Socket.IO handlers
├── config/                 # Configuration files
└── public/                 # Static files
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, email support@achatpro.com or join our Discord server.
# P Chat Pro - Complete Setup Guide

## 🎉 Project Overview

**P Chat Pro** is a premium live chat application with advanced features including:
- 🎤 Voice Chat Rooms
- 🎮 Interactive Games (Draw & Guess, Undercover, Car Racing, Trivia, Truth or Dare, Karaoke)
- 👨‍👩‍👧‍👦 Family System
- 💝 Dating Profiles
- 💰 Virtual Currency (Coins)
- 🎁 Gift System
- 👑 Admin Panel for Complete App Management

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Admin Panel Access](#admin-panel-access)
5. [Features Overview](#features-overview)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/babatravels8210-alt/Live-chatroom.git
   cd Live-chatroom
   ```

2. **Install dependencies:**
   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build the client:**
   ```bash
   cd client
   npm run build
   cd ..
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Access the app:**
   - Main App: `http://localhost:12000`
   - Admin Panel: `http://localhost:12000/admin`

## 💻 Local Development

### Running in Development Mode

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

This will run:
- Backend on `http://localhost:12000`
- Frontend on `http://localhost:3000`

### Project Structure

```
Live-chatroom/
├── client/                 # React frontend
│   ├── public/
│   │   ├── logo.webp      # App logo
│   │   ├── index.html     # HTML template
│   │   └── manifest.json  # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/     # Admin panel components
│   │   │   ├── voice/     # Voice chat components
│   │   │   ├── games/     # Game components
│   │   │   ├── family/    # Family system
│   │   │   ├── dating/    # Dating features
│   │   │   └── gift/      # Gift system
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── App.tsx        # Main app component
│   └── package.json
├── routes/                # API routes
│   ├── admin.js          # Admin endpoints
│   ├── auth.js           # Authentication
│   ├── users.js          # User management
│   ├── rooms.js          # Room management
│   ├── wallet.js         # Wallet/coins
│   ├── dating.js         # Dating features
│   └── voiceRooms.js     # Voice chat
├── models/               # MongoDB models
│   ├── User.js
│   ├── Room.js
│   ├── Message.js
│   ├── Transaction.js
│   └── VoiceRoom.js
├── middleware/           # Express middleware
│   └── auth.js          # Authentication middleware
├── config/              # Configuration
│   └── database.js      # Database connection
├── socket/              # Socket.IO handlers
│   └── socketHandler.js
├── server.js            # Main server file
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## 🌐 Production Deployment

### Deploy to Render.com

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Web Service:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `p-chat-pro`
     - **Build Command:** `npm install && cd client && npm install && npm run build`
     - **Start Command:** `npm start`

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=12000
   JWT_SECRET=your-secret-key
   MONGODB_URI=your-mongodb-connection-string
   ALLOWED_ORIGINS=https://your-app.onrender.com
   ```

4. **Deploy and wait for build to complete**

5. **Access your app:**
   - Main App: `https://your-app.onrender.com`
   - Admin Panel: `https://your-app.onrender.com/admin`

### MongoDB Setup (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all)
5. Get connection string
6. Add to Render environment variables

## 👑 Admin Panel Access

### Creating First Admin User

**Using MongoDB Compass/Atlas:**

1. Connect to your database
2. Go to `users` collection
3. Insert document:
   ```json
   {
     "username": "admin",
     "email": "admin@pchatpro.com",
     "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpQjP.yga",
     "isAdmin": true,
     "isVerified": true,
     "coins": 10000,
     "createdAt": new Date(),
     "updatedAt": new Date()
   }
   ```

**Default Credentials:**
- Email: `admin@pchatpro.com`
- Password: `admin123`

**⚠️ Change password immediately after first login!**

### Admin Panel Features

- **Dashboard:** View app statistics
- **User Management:** Ban, delete, manage users
- **Coin Management:** Update user balances
- **Room Monitoring:** Track active rooms
- **Transaction Analytics:** View revenue data

## ✨ Features Overview

### 1. Voice Chat Rooms
- Create and join voice rooms
- Multiple room types (Party, Gaming, Study, Karaoke)
- Real-time voice communication
- Room moderation tools

### 2. Interactive Games
- **Draw & Guess:** Pictionary-style game
- **Undercover:** Social deduction game
- **Car Racing:** Real-time racing
- **Trivia Quiz:** Knowledge competition
- **Truth or Dare:** Classic party game
- **Karaoke Battle:** Singing competition

### 3. Family System
- Create or join families
- Family levels and rankings
- Family chat and events
- Member management

### 4. Dating Features
- Create dating profile
- Match with other users
- Private messaging
- Profile customization

### 5. Virtual Economy
- Earn and spend coins
- Purchase gifts
- Premium features
- Transaction history

### 6. Admin Panel
- Complete app control
- User management
- Statistics dashboard
- Content moderation

## ⚙️ Configuration

### Environment Variables

**Required:**
```env
NODE_ENV=production
PORT=12000
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-uri
```

**Optional:**
```env
REDIS_URL=your-redis-url
AGORA_APP_ID=your-agora-id
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
RZP_KEY_ID=your-razorpay-key
```

### Database Configuration

The app works with or without MongoDB:
- **With MongoDB:** Full functionality
- **Without MongoDB:** Limited features (good for testing)

### Redis Configuration

Redis is optional:
- **With Redis:** Better performance and caching
- **Without Redis:** App works normally

## 🔧 Troubleshooting

### Build Errors

**Problem:** Client build fails
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection

**Problem:** Cannot connect to MongoDB
- Check connection string format
- Verify IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Admin Panel Access

**Problem:** Cannot login to admin panel
- Verify admin user exists in database
- Check `isAdmin: true` is set
- Verify JWT_SECRET is configured

### Port Already in Use

**Problem:** Port 12000 is already in use
```bash
# Find process using port
lsof -i :12000
# Kill the process
kill -9 <PID>
```

## 📱 App Access URLs

### Local Development
- Main App: `http://localhost:12000`
- Admin Panel: `http://localhost:12000/admin`
- Games: `http://localhost:12000/games`
- Family: `http://localhost:12000/family`

### Production (Render)
- Main App: `https://your-app.onrender.com`
- Admin Panel: `https://your-app.onrender.com/admin`
- Games: `https://your-app.onrender.com/games`
- Family: `https://your-app.onrender.com/family`

## 🎯 Next Steps After Deployment

1. **Create Admin Account** (see Admin Panel section)
2. **Test All Features** (voice, games, family system)
3. **Configure Payment Gateway** (Razorpay for India)
4. **Set Up Agora** (for voice chat)
5. **Configure Cloudinary** (for media uploads)
6. **Add Analytics** (Google Analytics, etc.)
7. **Set Up Monitoring** (error tracking)
8. **Custom Domain** (optional)

## 📞 Support

For issues or questions:
- Check this guide first
- Review `DEPLOYMENT_GUIDE.md` for deployment issues
- Review `ADMIN_PANEL_GUIDE.md` for admin access
- Create GitHub issue for bugs
- Check server logs for errors

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS properly
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set up rate limiting (already configured)
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Backup database regularly

## 📊 Performance Tips

1. **Use Render Paid Plan** - Free tier sleeps after inactivity
2. **Add Redis** - For better caching
3. **Optimize Images** - Use Cloudinary
4. **Enable CDN** - For static assets
5. **Database Indexing** - Optimize queries
6. **Monitor Performance** - Use APM tools

## 🎨 Customization

### Changing App Name
Already updated to "P Chat Pro" throughout the app.

### Changing Logo
Logo is located at: `client/public/logo.webp`
Replace with your own logo (recommended size: 512x512px)

### Changing Colors
Edit CSS files in `client/src/components/*/` directories

### Adding Features
Follow the existing code structure in `routes/` and `client/src/components/`

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

Developed by NinjaTech AI Team
Repository: https://github.com/babatravels8210-alt/Live-chatroom

---

**Happy Chatting! 🎉**
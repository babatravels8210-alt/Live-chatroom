# Achat Pro - Complete Setup Guide 🚀

## Quick Start for Production

### Prerequisites
- Node.js 16+ installed
- MongoDB installed or MongoDB Atlas account
- Agora.io account for voice chat
- Cloudinary account for media storage

### Step 1: Environment Setup

Create `.env` file in root directory:

```bash
# Application Settings
NODE_ENV=production
PORT=12000
CLIENT_URL=https://your-domain.com

# Database
DB_URI=mongodb://localhost:27017/achatpro
# OR use MongoDB Atlas:
# DB_URI=mongodb+srv://username:password@cluster.mongodb.net/achatpro

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this

# Agora Voice Chat (Get from agora.io)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate

# Cloudinary (Get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 3: Build Frontend

```bash
npm run build:client
```

### Step 4: Start Production Server

```bash
npm start
```

Your app will be running on `http://localhost:12000`

## Agora Setup (Voice Chat)

1. Go to [Agora.io](https://www.agora.io/)
2. Create free account
3. Create new project
4. Get your App ID
5. Generate App Certificate
6. Add to `.env` file

## MongoDB Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB
# Ubuntu/Debian:
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Add to `.env` file

## Cloudinary Setup (Media Storage)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Create free account
3. Get Cloud Name, API Key, API Secret
4. Add to `.env` file

## Production Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set AGORA_APP_ID=your-app-id
heroku config:set AGORA_APP_CERTIFICATE=your-certificate
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
heroku config:set CLOUDINARY_API_KEY=your-api-key
heroku config:set CLOUDINARY_API_SECRET=your-api-secret

# Deploy
git push heroku main
```

### Deploy to VPS (Ubuntu)

```bash
# SSH to your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install mongodb

# Clone repository
git clone https://github.com/babatravels8210-alt/Live-chatroom.git
cd Live-chatroom

# Install dependencies
npm install
cd client && npm install && cd ..

# Create .env file
nano .env
# (Add your environment variables)

# Build frontend
npm run build:client

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start server.js --name achat-pro

# Setup PM2 to start on boot
pm2 startup
pm2 save

# Setup Nginx as reverse proxy
sudo apt-get install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/achat-pro

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:12000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/achat-pro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Features Checklist

### ✅ Completed Features
- [x] Voice chat rooms with Agora SDK
- [x] Real-time voice streaming
- [x] Room creation and management
- [x] User roles (Host, Speaker, Audience)
- [x] Gift system with multiple rarities
- [x] Beautiful UI with animations
- [x] Responsive design
- [x] Socket.IO real-time updates

### 🚧 In Development
- [ ] Gaming features (Car racing, Draw & Guess)
- [ ] Family system
- [ ] Voice effects and filters
- [ ] Premium membership features
- [ ] Mobile app (React Native)

## Troubleshooting

### Voice Chat Not Working
- Check Agora credentials in `.env`
- Ensure HTTPS is enabled (Agora requires HTTPS in production)
- Check browser microphone permissions

### Database Connection Error
- Verify MongoDB is running: `sudo systemctl status mongodb`
- Check connection string in `.env`
- Ensure MongoDB port 27017 is open

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf client/build`
- Rebuild: `npm run build:client`

## Support

For issues or questions:
- GitHub Issues: https://github.com/babatravels8210-alt/Live-chatroom/issues
- Email: support@achatpro.com

## License

MIT License - See LICENSE file for details
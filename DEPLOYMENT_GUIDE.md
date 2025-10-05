# 🚀 Live Chatroom - Complete Production Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Options](#deployment-options)
4. [Platform-Specific Guides](#platform-specific-guides)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers complete production deployment of the Live Chatroom application across multiple platforms including cloud services, VPS, and containerized environments.

### Application Stack
- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: React (TypeScript)
- **Mobile**: Flutter
- **Database**: MongoDB
- **Real-time**: Socket.IO + Agora SDK
- **Storage**: Cloudinary

---

## Prerequisites

### Required Accounts & Services
1. **MongoDB Atlas** (Database)
   - Free tier: 512MB storage
   - Sign up: https://www.mongodb.com/cloud/atlas

2. **Agora.io** (Voice Chat)
   - Free tier: 10,000 minutes/month
   - Sign up: https://www.agora.io/

3. **Cloudinary** (Media Storage)
   - Free tier: 25GB storage
   - Sign up: https://cloudinary.com/

4. **Domain Name** (Optional but recommended)
   - Namecheap, GoDaddy, or any provider

5. **SSL Certificate** (For HTTPS)
   - Free: Let's Encrypt
   - Paid: DigiCert, Comodo

### Environment Variables Setup

Create `.env` file in root directory:

```bash
# Application Settings
NODE_ENV=production
PORT=12000
CLIENT_URL=https://your-domain.com

# Database
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/livechatroom?retryWrites=true&w=majority

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d

# Agora Voice Chat
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (Optional - for session management)
REDIS_URL=redis://localhost:6379

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Gateway (Optional)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Deployment Options

### Option 1: Heroku (Easiest - Recommended for Beginners)

**Cost**: Free tier available (550 dyno hours/month)

#### Step-by-Step Deployment

1. **Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create New App**
```bash
cd Live-chatroom
heroku create live-chatroom-app
```

4. **Add MongoDB Addon**
```bash
heroku addons:create mongolab:sandbox
```

5. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set AGORA_APP_ID=your-agora-app-id
heroku config:set AGORA_APP_CERTIFICATE=your-agora-certificate
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
heroku config:set CLOUDINARY_API_KEY=your-api-key
heroku config:set CLOUDINARY_API_SECRET=your-api-secret
```

6. **Deploy Application**
```bash
git push heroku main
```

7. **Open Application**
```bash
heroku open
```

8. **View Logs**
```bash
heroku logs --tail
```

#### Heroku Configuration Files

Create `Procfile` in root:
```
web: npm start
```

Create `app.json`:
```json
{
  "name": "Live Chatroom",
  "description": "Real-time voice chat application",
  "repository": "https://github.com/babatravels8210-alt/Live-chatroom",
  "keywords": ["node", "express", "socket.io", "voice-chat"],
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "NODE_ENV": {
      "value": "production"
    },
    "JWT_SECRET": {
      "generator": "secret"
    }
  }
}
```

---

### Option 2: Render.com (Easy & Free)

**Cost**: Free tier available (750 hours/month)

#### Deployment Steps

1. **Sign up at Render.com**
   - Visit: https://render.com/
   - Connect GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect repository: `babatravels8210-alt/Live-chatroom`

3. **Configure Service**
   - **Name**: live-chatroom
   - **Environment**: Node
   - **Build Command**: 
     ```bash
     npm install && cd client && npm install && cd .. && npm run build:client
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```

4. **Add Environment Variables**
   - Go to "Environment" tab
   - Add all variables from `.env` file

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

6. **Custom Domain** (Optional)
   - Go to "Settings" → "Custom Domain"
   - Add your domain
   - Update DNS records

---

### Option 3: DigitalOcean App Platform

**Cost**: Starting at $5/month

#### Deployment Steps

1. **Create Account**
   - Visit: https://www.digitalocean.com/
   - Get $200 credit (new users)

2. **Create New App**
   - Click "Create" → "Apps"
   - Connect GitHub repository

3. **Configure App**
   - **Name**: live-chatroom
   - **Branch**: main
   - **Build Command**: 
     ```bash
     npm install && cd client && npm install && cd .. && npm run build:client
     ```
   - **Run Command**: 
     ```bash
     npm start
     ```

4. **Add Database**
   - Click "Add Resource" → "Database"
   - Select MongoDB
   - Choose plan (Dev: Free, Basic: $15/month)

5. **Environment Variables**
   - Add all required variables
   - Use database connection string from DigitalOcean

6. **Deploy**
   - Review and create
   - Wait for deployment

---

### Option 4: AWS (Amazon Web Services)

**Cost**: Free tier for 12 months, then pay-as-you-go

#### Using AWS Elastic Beanstalk

1. **Install AWS CLI & EB CLI**
```bash
# Install AWS CLI
pip install awscli

# Install EB CLI
pip install awsebcli
```

2. **Configure AWS Credentials**
```bash
aws configure
# Enter: Access Key ID, Secret Access Key, Region, Output format
```

3. **Initialize Elastic Beanstalk**
```bash
cd Live-chatroom
eb init

# Select:
# - Region: us-east-1 (or your preferred region)
# - Application name: live-chatroom
# - Platform: Node.js
# - SSH: Yes (for debugging)
```

4. **Create Environment**
```bash
eb create live-chatroom-prod

# Options:
# - Load balancer: Application
# - Environment type: LoadBalanced
```

5. **Set Environment Variables**
```bash
eb setenv NODE_ENV=production \
  JWT_SECRET=your-secret \
  AGORA_APP_ID=your-app-id \
  AGORA_APP_CERTIFICATE=your-certificate \
  CLOUDINARY_CLOUD_NAME=your-cloud-name \
  CLOUDINARY_API_KEY=your-api-key \
  CLOUDINARY_API_SECRET=your-api-secret
```

6. **Deploy**
```bash
eb deploy
```

7. **Open Application**
```bash
eb open
```

#### AWS Configuration Files

Create `.ebextensions/nodecommand.config`:
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
```

---

### Option 5: VPS (Ubuntu Server)

**Cost**: Starting at $5/month (DigitalOcean, Linode, Vultr)

#### Complete VPS Setup

1. **Create VPS Instance**
   - Choose Ubuntu 22.04 LTS
   - Minimum: 2GB RAM, 1 CPU, 50GB SSD

2. **Initial Server Setup**
```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Create new user
adduser deployer
usermod -aG sudo deployer

# Setup SSH for new user
su - deployer
mkdir ~/.ssh
chmod 700 ~/.ssh
```

3. **Install Node.js**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

4. **Install MongoDB**
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

5. **Install Nginx**
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

6. **Clone Repository**
```bash
cd /var/www
sudo git clone https://github.com/babatravels8210-alt/Live-chatroom.git
sudo chown -R deployer:deployer Live-chatroom
cd Live-chatroom
```

7. **Install Dependencies**
```bash
npm install
cd client && npm install && cd ..
```

8. **Create Environment File**
```bash
nano .env
# Add all environment variables
```

9. **Build Frontend**
```bash
npm run build:client
```

10. **Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2

# Start application
pm2 start server.js --name live-chatroom

# Setup auto-restart on boot
pm2 startup systemd
pm2 save
```

11. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/live-chatroom
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:12000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:12000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/live-chatroom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

12. **Setup SSL with Let's Encrypt**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

13. **Setup Firewall**
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

### Option 6: Docker Deployment

#### Docker Compose Setup

The repository already includes `docker-compose.yml`. To deploy:

1. **Install Docker & Docker Compose**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Create Environment File**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Build and Start**
```bash
docker-compose up -d --build
```

4. **View Logs**
```bash
docker-compose logs -f
```

5. **Stop Services**
```bash
docker-compose down
```

---

## Monitoring & Maintenance

### Application Monitoring

1. **PM2 Monitoring**
```bash
# View status
pm2 status

# View logs
pm2 logs live-chatroom

# Monitor resources
pm2 monit
```

2. **Setup PM2 Web Dashboard**
```bash
pm2 install pm2-server-monit
```

### Database Backup

1. **MongoDB Backup Script**

Create `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="$DB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

2. **Setup Cron Job**
```bash
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Log Management

1. **Setup Log Rotation**
```bash
sudo nano /etc/logrotate.d/live-chatroom
```

Add:
```
/var/www/Live-chatroom/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deployer deployer
    sharedscripts
}
```

### Performance Monitoring

1. **Install New Relic** (Optional)
```bash
npm install newrelic --save
```

2. **Configure New Relic**
Create `newrelic.js` in root:
```javascript
exports.config = {
  app_name: ['Live Chatroom'],
  license_key: 'your-license-key',
  logging: {
    level: 'info'
  }
}
```

---

## Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
# Find process using port
sudo lsof -i :12000

# Kill process
sudo kill -9 <PID>
```

2. **MongoDB Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

3. **Nginx 502 Bad Gateway**
```bash
# Check application status
pm2 status

# Restart application
pm2 restart live-chatroom

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

4. **SSL Certificate Issues**
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Performance Issues

1. **High Memory Usage**
```bash
# Check memory
free -h

# Restart application
pm2 restart live-chatroom

# Increase Node.js memory limit
pm2 start server.js --name live-chatroom --node-args="--max-old-space-size=2048"
```

2. **Slow Database Queries**
```bash
# Enable MongoDB profiling
mongo
use livechatroom
db.setProfilingLevel(2)

# View slow queries
db.system.profile.find().sort({ts:-1}).limit(5)
```

---

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use strong, random secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Enable authentication
   - Whitelist IP addresses
   - Regular backups

3. **Server Security**
   - Keep system updated
   - Use firewall (UFW)
   - Disable root login
   - Use SSH keys only
   - Install fail2ban

4. **Application Security**
   - Use HTTPS only
   - Implement rate limiting
   - Validate all inputs
   - Use helmet.js
   - Regular security audits

---

## Scaling Strategies

### Horizontal Scaling

1. **Load Balancer Setup**
   - Use Nginx or HAProxy
   - Multiple application instances
   - Session persistence with Redis

2. **Database Replication**
   - MongoDB replica sets
   - Read replicas for scaling
   - Automatic failover

### Vertical Scaling

1. **Upgrade Server Resources**
   - More CPU cores
   - Additional RAM
   - Faster storage (SSD)

2. **Optimize Application**
   - Enable caching
   - Optimize database queries
   - Use CDN for static assets

---

## Cost Estimation

### Monthly Costs (Approximate)

| Service | Free Tier | Starter | Professional |
|---------|-----------|---------|--------------|
| **Hosting** | | | |
| Heroku | 550 hrs | $7/month | $25/month |
| Render | 750 hrs | $7/month | $25/month |
| DigitalOcean | - | $5/month | $20/month |
| AWS | 12 months | $10/month | $50/month |
| **Database** | | | |
| MongoDB Atlas | 512MB | $9/month | $57/month |
| **Services** | | | |
| Agora | 10k min | $0.99/1k min | Custom |
| Cloudinary | 25GB | $99/month | $249/month |
| **Total** | **FREE** | **$25-35** | **$100-200** |

---

## Support & Resources

- **Documentation**: Check README.md and other docs
- **GitHub Issues**: https://github.com/babatravels8210-alt/Live-chatroom/issues
- **Community**: Join our Discord/Slack
- **Email**: support@example.com

---

**Happy Deploying! 🚀**
# Render.com Deployment Guide for Live Chatroom

## Form Fields to Fill

### Basic Information
- **Name**: `live-chatroom-app` (or any unique name)
- **Project**: `Live Chatroom Project` (optional)
- **Language**: `Node.js`
- **Branch**: `main`
- **Root Directory**: (leave empty)

### Build & Start Commands
- **Build Command**: `npm install && npm run build:client`
- **Start Command**: `npm start`

## Required Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENVIRONMENT=PRODUCTION
```

## Prerequisites Setup

### 1. MongoDB Database
- Create MongoDB Atlas account
- Create new cluster
- Get connection string
- Add to MONGODB_URI environment variable

### 2. Cloudinary Setup
- Create Cloudinary account
- Get cloud name, API key, and API secret
- Add to environment variables

### 3. Agora Setup (for video calling)
- Create Agora account
- Create new project
- Get App ID and Certificate
- Add to environment variables

### 4. Cashfree Setup (for payments)
- Create Cashfree account
- Get App ID and Secret Key
- Set environment to PRODUCTION

## Deployment Steps

1. **Connect Repository**
   - Select "Web Service"
   - Connect your GitHub account
   - Select `babatravels8210-alt/Live-chatroom` repository

2. **Fill Form Fields**
   - Use the values mentioned above
   - Select appropriate instance type (Free tier for testing)

3. **Add Environment Variables**
   - Go to Environment tab
   - Add all required variables listed above

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete
   - Check logs for any errors

## Post-Deployment

1. **Update Client URL**
   - Update REACT_APP_API_URL in client environment
   - Redeploy if necessary

2. **Test Features**
   - User registration/login
   - Chat functionality
   - Video calling
   - File uploads
   - Payment integration

## Troubleshooting

- Check build logs for dependency issues
- Verify all environment variables are set
- Ensure MongoDB connection is working
- Check Render service logs for runtime errors

## Instance Type Recommendation

- **Free Tier**: For testing and development
- **Starter ($7/month)**: For small production apps
- **Standard ($25/month)**: For higher traffic applications
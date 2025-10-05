# P Chat Pro - Deployment Guide

## Overview
This guide will help you deploy P Chat Pro to Render.com for production use.

## Prerequisites
- GitHub account with the repository
- Render.com account (free tier available)
- MongoDB Atlas account (free tier available) OR use Render's PostgreSQL
- (Optional) Redis Cloud account for caching

## Step 1: Prepare Environment Variables

Before deploying, you need to set up the following environment variables in Render:

### Required Variables:
```
NODE_ENV=production
PORT=12000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ALLOWED_ORIGINS=https://your-app-name.onrender.com
```

### Database Configuration:
```
MONGODB_URI=your-mongodb-connection-string
DB_URI=your-mongodb-connection-string
```

### Optional Variables (can be configured later):
```
REDIS_URL=your-redis-connection-string
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
RZP_KEY_ID=your-razorpay-key
RZP_KEY_SECRET=your-razorpay-secret
```

## Step 2: Set Up MongoDB (Free Option)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" and choose "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `myFirstDatabase` with `pchatpro`

Your connection string should look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pchatpro?retryWrites=true&w=majority
```

## Step 3: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select the `babatravels8210-alt/Live-chatroom` repository
   - Branch: `main`

3. **Configure the Service:**
   - **Name:** `p-chat-pro` (or your preferred name)
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Runtime:** `Node`
   - **Build Command:** `npm install && cd client && npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or paid for better performance)

4. **Add Environment Variables:**
   - Click "Advanced" → "Add Environment Variable"
   - Add all the variables from Step 1
   - Make sure to add your MongoDB connection string

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for the deployment to complete (5-10 minutes)
   - Your app will be available at: `https://p-chat-pro.onrender.com`

### Option B: Using render.yaml (Automated)

The repository already includes a `render.yaml` file. To use it:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Configure environment variables as prompted
6. Click "Apply" to deploy

## Step 4: Post-Deployment Configuration

### 1. Update ALLOWED_ORIGINS
After deployment, update the `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS=https://your-app-name.onrender.com
```

### 2. Create Admin User
To access the admin panel, you need to create an admin user in MongoDB:

**Option A: Using MongoDB Compass or Atlas UI:**
1. Connect to your MongoDB database
2. Go to the `users` collection
3. Create a new document:
```json
{
  "username": "admin",
  "email": "admin@pchatpro.com",
  "password": "$2a$12$hashed_password_here",
  "isAdmin": true,
  "isVerified": true,
  "coins": 10000,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Option B: Using the API (after deployment):**
1. Register a normal user through the app
2. Manually update the user in MongoDB to set `isAdmin: true`

### 3. Test the Deployment
1. Visit your app URL: `https://your-app-name.onrender.com`
2. Test the main features:
   - Voice chat rooms
   - Games section
   - Family system
   - Admin panel at `/admin`

## Step 5: Custom Domain (Optional)

To use your own domain:

1. In Render Dashboard, go to your service
2. Click "Settings" → "Custom Domain"
3. Add your domain
4. Update your DNS records as instructed
5. Wait for SSL certificate to be issued (automatic)

## Troubleshooting

### App Not Loading
- Check Render logs for errors
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct

### Database Connection Errors
- Verify MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0)
- Check database user permissions
- Verify connection string format

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Admin Panel Not Working
- Verify admin user exists in database with `isAdmin: true`
- Check JWT_SECRET is set correctly
- Verify MongoDB connection is working

## Performance Optimization

### For Production Use:
1. **Upgrade Render Plan:** Free tier sleeps after inactivity
2. **Add Redis:** For better performance and caching
3. **Configure CDN:** For static assets
4. **Enable Monitoring:** Set up error tracking (Sentry, etc.)
5. **Database Indexing:** Optimize MongoDB queries

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set up proper CORS origins
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set up rate limiting (already configured)
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

## Support

For issues or questions:
- Check Render documentation: https://render.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com
- GitHub Issues: Create an issue in the repository

## Cost Estimate

**Free Tier (Render + MongoDB Atlas):**
- Render Web Service: Free (with limitations)
- MongoDB Atlas: Free (M0 cluster, 512MB)
- Total: $0/month

**Recommended Production Setup:**
- Render Starter: $7/month
- MongoDB Atlas M10: $57/month
- Redis Cloud: $5/month
- Total: ~$69/month

## Next Steps

After successful deployment:
1. Configure payment gateway (Razorpay)
2. Set up Agora for voice chat
3. Configure Cloudinary for media uploads
4. Set up email service for notifications
5. Add analytics and monitoring
# P Chat Pro - Admin Panel Access Guide

## Overview
The Admin Panel provides complete control over the P Chat Pro application, including user management, statistics, and app configuration.

## Accessing the Admin Panel

### URL
```
https://your-app-url.com/admin
```

For local development:
```
http://localhost:12000/admin
```

## Creating an Admin Account

### Method 1: Direct Database Creation (Recommended for First Admin)

1. **Connect to MongoDB:**
   - Use MongoDB Compass, Atlas UI, or MongoDB Shell
   - Connect using your MongoDB connection string

2. **Navigate to the `users` collection**

3. **Create Admin User Document:**
   ```json
   {
     "username": "admin",
     "email": "admin@pchatpro.com",
     "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpQjP.yga",
     "isAdmin": true,
     "isVerified": true,
     "isOnline": false,
     "coins": 10000,
     "avatar": "",
     "bio": "System Administrator",
     "phoneNumber": "",
     "followers": [],
     "following": [],
     "blockedUsers": [],
     "isBanned": false,
     "preferences": {
       "notifications": true,
       "privateProfile": false,
       "allowDirectMessages": true
     },
     "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
     "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
   }
   ```

   **Note:** The password above is hashed version of `admin123`. You should change this after first login.

4. **Save the document**

### Method 2: Promote Existing User

1. **Register a normal user** through the app
2. **Find the user in MongoDB** `users` collection
3. **Update the user document:**
   ```javascript
   db.users.updateOne(
     { email: "user@example.com" },
     { $set: { isAdmin: true } }
   )
   ```

### Method 3: Using MongoDB Shell

```javascript
// Connect to your database
use pchatpro

// Create admin user
db.users.insertOne({
  username: "admin",
  email: "admin@pchatpro.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpQjP.yga",
  isAdmin: true,
  isVerified: true,
  isOnline: false,
  coins: 10000,
  avatar: "",
  bio: "System Administrator",
  phoneNumber: "",
  followers: [],
  following: [],
  blockedUsers: [],
  isBanned: false,
  preferences: {
    notifications: true,
    privateProfile: false,
    allowDirectMessages: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Default Admin Credentials

**Email:** `admin@pchatpro.com`  
**Password:** `admin123`

**⚠️ IMPORTANT:** Change these credentials immediately after first login!

## Admin Panel Features

### 1. Dashboard
- **Total Users:** View total registered users
- **Online Users:** See currently active users
- **Banned Users:** Monitor banned accounts
- **Active Rooms:** Track live chat rooms
- **Total Messages:** Message statistics
- **Total Transactions:** Payment transactions
- **Total Revenue:** Revenue tracking
- **Total Coins Sold:** Virtual currency statistics

### 2. User Management
- **View All Users:** Browse complete user list
- **Search Users:** Find users by username or email
- **Filter Users:** Filter by status (online, banned, verified)
- **Ban/Unban Users:** Manage user access
- **Delete Users:** Remove user accounts
- **Update Coins:** Modify user coin balance
- **View User Details:** See complete user information

### 3. Room Management
- **View Active Rooms:** Monitor all live rooms
- **Close Rooms:** Shut down problematic rooms
- **View Room Statistics:** Track room activity

### 4. Transaction Management
- **View Transactions:** See all payment transactions
- **Transaction Analytics:** Analyze revenue data
- **Filter by Period:** View daily, weekly, monthly stats

## Admin Panel Operations

### Banning a User
1. Go to Admin Panel → Users tab
2. Search for the user
3. Click "Ban" button
4. User will be immediately logged out and cannot access the app

### Unbanning a User
1. Filter users by "Banned" status
2. Find the banned user
3. Click "Unban" button
4. User can now access the app again

### Updating User Coins
1. Go to Users tab
2. Find the user
3. Modify the coins value in the input field
4. Value is automatically saved

### Deleting a User
1. Go to Users tab
2. Find the user
3. Click "Delete" button
4. Confirm the deletion
5. User and all associated data will be removed

## Security Best Practices

### 1. Strong Admin Password
- Use a password with at least 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Never share admin credentials

### 2. Regular Monitoring
- Check user activity regularly
- Monitor for suspicious behavior
- Review transaction logs

### 3. Access Control
- Limit admin access to trusted personnel only
- Use different admin accounts for different administrators
- Log all admin actions

### 4. Password Management
- Change admin password regularly (every 90 days)
- Never use the default password in production
- Store passwords securely (use password manager)

## Changing Admin Password

### Method 1: Through Database
1. Generate a new bcrypt hash for your password
2. Update the user document in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@pchatpro.com" },
     { $set: { password: "new_bcrypt_hash_here" } }
   )
   ```

### Method 2: Using bcrypt Online Tool
1. Go to a bcrypt generator (e.g., bcrypt-generator.com)
2. Enter your new password
3. Copy the generated hash
4. Update in MongoDB as shown above

### Method 3: Using Node.js Script
```javascript
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  console.log('Hashed password:', hash);
}

hashPassword('your_new_password');
```

## Creating Additional Admin Users

To create more admin accounts:

1. **Register a new user** through the normal registration process
2. **Promote to admin** using MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "newadmin@example.com" },
     { $set: { isAdmin: true, isVerified: true } }
   )
   ```

## Troubleshooting

### Cannot Login to Admin Panel
- Verify admin user exists in database
- Check `isAdmin` field is set to `true`
- Verify email and password are correct
- Check JWT_SECRET is configured correctly

### Admin Panel Not Loading
- Check browser console for errors
- Verify API endpoint is accessible
- Check network tab for failed requests
- Ensure MongoDB connection is working

### Features Not Working
- Verify MongoDB connection
- Check server logs for errors
- Ensure all required environment variables are set
- Verify user has admin privileges

### "Access Denied" Error
- Verify user has `isAdmin: true` in database
- Check JWT token is valid
- Ensure user is not banned
- Try logging out and logging in again

## Admin Panel API Endpoints

For developers, here are the admin API endpoints:

```
GET  /api/admin/dashboard          - Get dashboard statistics
GET  /api/admin/users              - Get all users (with pagination)
GET  /api/admin/users/:id          - Get specific user details
PUT  /api/admin/users/:id/ban      - Ban/unban a user
PUT  /api/admin/users/:id/coins    - Update user coins
DELETE /api/admin/users/:id        - Delete a user
GET  /api/admin/rooms              - Get all rooms
GET  /api/admin/transactions       - Get all transactions
GET  /api/admin/analytics/transactions - Get transaction analytics
```

All endpoints require:
- Authorization header: `Bearer <jwt_token>`
- User must have `isAdmin: true`

## Support

For admin panel issues:
1. Check server logs for errors
2. Verify database connection
3. Review this guide for common solutions
4. Contact technical support if issues persist

## Security Notice

⚠️ **IMPORTANT SECURITY REMINDERS:**
- Never share admin credentials
- Always use HTTPS in production
- Change default passwords immediately
- Monitor admin activity logs
- Regularly review user accounts
- Keep the application updated
- Use strong, unique passwords
- Enable two-factor authentication (if available)
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user
router.post('/signup', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    // Check if database is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // Demo mode - simulate successful registration
      const mockUserId = 'demo_' + Date.now();
      const token = generateToken(mockUserId);
      
      return res.status(201).json({
        message: 'User registered successfully (Demo Mode)',
        token,
        user: {
          id: mockUserId,
          username,
          email,
          avatar: null,
          isVerified: true,
          createdAt: new Date()
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      isVerified: true // For demo purposes, skip email verification
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Check if database is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // Demo mode - simulate successful login
      const mockUserId = 'demo_' + Date.now();
      const token = generateToken(mockUserId);
      
      return res.json({
        message: 'Login successful (Demo Mode)',
        token,
        user: {
          id: mockUserId,
          username: email.split('@')[0],
          email,
          avatar: null,
          isVerified: true,
          isOnline: true,
          lastSeen: new Date(),
          createdAt: new Date()
        }
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        message: 'Account is banned',
        reason: user.banReason,
        banExpires: user.banExpires
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last seen and online status
    user.lastSeen = new Date();
    user.isOnline = true;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Update user online status
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Verify OTP (placeholder for SMS/Email verification)
router.post('/verify-otp', [
  body('phone').optional().isMobilePhone(),
  body('email').optional().isEmail(),
  body('otp').isLength({ min: 4, max: 6 }).withMessage('OTP must be 4-6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { phone, email, otp } = req.body;

    // For demo purposes, accept any 4-digit OTP
    if (otp === '1234' || otp === '0000') {
      // Find or create user
      let user;
      if (email) {
        user = await User.findOne({ email });
        if (!user) {
          user = new User({
            email,
            username: email.split('@')[0] + Math.random().toString(36).substr(2, 4),
            isVerified: true
          });
          await user.save();
        }
      } else if (phone) {
        user = await User.findOne({ phoneNumber: phone });
        if (!user) {
          user = new User({
            phoneNumber: phone,
            username: 'user' + Math.random().toString(36).substr(2, 8),
            email: `${phone}@temp.com`,
            isVerified: true
          });
          await user.save();
        }
      }

      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: 'OTP verified successfully',
        token,
        user: user.getPublicProfile()
      });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'OTP verification failed' });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success for security reasons
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });

    if (user) {
      // Generate reset token (in production, send email)
      const resetToken = Math.random().toString(36).substr(2, 15);
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Password reset request failed' });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
});

module.exports = router;
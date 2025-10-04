const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        message: 'Account is banned', 
        reason: user.banReason,
        banExpires: user.banExpires 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Authorization error' });
  }
};

// Check if user is room host or moderator
const requireRoomPermission = (permission = 'moderator') => {
  return async (req, res, next) => {
    try {
      const Room = require('../models/Room');
      const roomId = req.params.roomId || req.body.roomId;
      
      if (!roomId) {
        return res.status(400).json({ message: 'Room ID required' });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      const isHost = room.isHost(req.user._id);
      const isModerator = room.isModerator(req.user._id);
      
      if (permission === 'host' && !isHost) {
        return res.status(403).json({ message: 'Host permission required' });
      }
      
      if (permission === 'moderator' && !isHost && !isModerator) {
        return res.status(403).json({ message: 'Moderator permission required' });
      }

      req.room = room;
      next();
    } catch (error) {
      console.error('Room permission middleware error:', error);
      res.status(500).json({ message: 'Permission check error' });
    }
  };
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && !user.isBanned) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRoomPermission,
  optionalAuth
};
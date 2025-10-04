const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const Message = require('../models/Message');
const { requireRoomPermission } = require('../middleware/auth');

const router = express.Router();

// Get all active rooms
router.get('/list', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const rooms = await Room.find(query)
      .populate('host', 'username avatar')
      .populate('currentParticipants.user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Room.countDocuments(query);

    res.json({
      rooms: rooms.map(room => ({
        ...room,
        participantCount: room.currentParticipants.length,
        // Hide password field
        password: undefined
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
});

// Get room details
router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('host', 'username avatar')
      .populate('currentParticipants.user', 'username avatar');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room is private and user has access
    if (room.isPrivate && !room.currentParticipants.some(p => p.user._id.toString() === req.user._id.toString()) && !room.isHost(req.user._id)) {
      return res.status(403).json({ message: 'Access denied to private room' });
    }

    res.json({
      room: {
        ...room.toObject(),
        password: undefined // Never send password
      }
    });

  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Failed to fetch room details' });
  }
});

// Create new room
router.post('/create', [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Room name must be between 1 and 100 characters'),
  body('type')
    .isIn(['voice', 'video', 'text'])
    .withMessage('Invalid room type'),
  body('category')
    .optional()
    .isIn(['music', 'gaming', 'education', 'entertainment', 'business', 'casual', 'other'])
    .withMessage('Invalid category'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Max participants must be between 2 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      name,
      description,
      type,
      isPrivate,
      password,
      maxParticipants,
      category,
      tags,
      scheduledFor,
      duration
    } = req.body;

    const room = new Room({
      name,
      description,
      host: req.user._id,
      type,
      isPrivate: isPrivate || false,
      password: isPrivate ? password : '',
      maxParticipants: maxParticipants || 50,
      category: category || 'casual',
      tags: tags || [],
      scheduledFor,
      duration
    });

    // Add host as first participant
    room.addParticipant(req.user._id, 'host');

    await room.save();
    await room.populate('host', 'username avatar');

    res.status(201).json({
      message: 'Room created successfully',
      room: {
        ...room.toObject(),
        password: undefined
      }
    });

  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Failed to create room' });
  }
});

// Join room
router.post('/join/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { password } = req.body;

    const room = await Room.findById(roomId)
      .populate('host', 'username avatar')
      .populate('currentParticipants.user', 'username avatar');

    if (!room || !room.isActive) {
      return res.status(404).json({ message: 'Room not found or inactive' });
    }

    // Check if room is private and password is required
    if (room.isPrivate && room.password && room.password !== password) {
      return res.status(401).json({ message: 'Invalid room password' });
    }

    // Check if user is already in room
    const isAlreadyParticipant = room.currentParticipants.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    if (isAlreadyParticipant) {
      return res.json({
        message: 'Already in room',
        room
      });
    }

    // Try to add participant
    const added = room.addParticipant(req.user._id);
    if (!added) {
      return res.status(400).json({ message: 'Room is full' });
    }

    await room.save();
    await room.populate('currentParticipants.user', 'username avatar');

    // Create system message
    const systemMessage = new Message({
      sender: req.user._id,
      room: roomId,
      content: `${req.user.username} joined the room`,
      type: 'system'
    });
    await systemMessage.save();

    res.json({
      message: 'Joined room successfully',
      room
    });

  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Failed to join room' });
  }
});

// Leave room
router.post('/leave', [
  body('roomId').isMongoId().withMessage('Invalid room ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Remove user from room
    room.removeParticipant(req.user._id);

    // If host leaves and there are other participants, transfer host to first participant
    if (room.isHost(req.user._id) && room.currentParticipants.length > 0) {
      const newHost = room.currentParticipants[0];
      room.host = newHost.user;
      newHost.role = 'host';
    }

    // If no participants left, deactivate room
    if (room.currentParticipants.length === 0) {
      room.isActive = false;
      room.endedAt = new Date();
    }

    await room.save();

    res.json({ message: 'Left room successfully' });

  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ message: 'Failed to leave room' });
  }
});

// Send message to room
router.post('/sendMessage', [
  body('roomId').isMongoId().withMessage('Invalid room ID'),
  body('content').isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
  body('type').optional().isIn(['text', 'image', 'voice', 'video', 'file']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { roomId, content, type = 'text', replyTo } = req.body;

    const room = await Room.findById(roomId);
    if (!room || !room.isActive) {
      return res.status(404).json({ message: 'Room not found or inactive' });
    }

    // Check if user is in room
    const isParticipant = room.currentParticipants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'You must be in the room to send messages' });
    }

    // Create message
    const message = new Message({
      sender: req.user._id,
      room: roomId,
      content,
      type,
      replyTo
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    // Update room message count
    room.stats.totalMessages += 1;
    await room.save();

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get room messages
router.get('/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user has access to room
    const isParticipant = room.currentParticipants.some(
      p => p.user.toString() === req.user._id.toString()
    );
    const isHost = room.isHost(req.user._id);

    if (!isParticipant && !isHost && room.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ 
      room: roomId, 
      isDeleted: false 
    })
      .populate('sender', 'username avatar')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Update room settings (host only)
router.put('/:roomId/settings', requireRoomPermission('host'), [
  body('name').optional().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('maxParticipants').optional().isInt({ min: 2, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const allowedUpdates = ['name', 'description', 'maxParticipants', 'category', 'tags', 'settings'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      updates,
      { new: true, runValidators: true }
    ).populate('host', 'username avatar');

    res.json({
      message: 'Room settings updated successfully',
      room: {
        ...room.toObject(),
        password: undefined
      }
    });

  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Failed to update room settings' });
  }
});

// Delete room (host only)
router.delete('/:roomId', requireRoomPermission('host'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    
    room.isActive = false;
    room.endedAt = new Date();
    await room.save();

    res.json({ message: 'Room deleted successfully' });

  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Failed to delete room' });
  }
});

module.exports = router;
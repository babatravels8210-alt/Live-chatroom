const express = require('express');
const router = express.Router();
const VoiceRoom = require('../models/VoiceRoom');
const auth = require('../middleware/auth');

// Get all voice rooms
router.get('/rooms', auth.authenticateToken, async (req, res) => {
  try {
    const rooms = await VoiceRoom.find({ isActive: true })
      .populate('host', 'name avatar')
      .populate('participants.user', 'name avatar')
      .sort({ participantCount: -1 })
      .limit(50);
    
    res.json({
      success: true,
      rooms: rooms.map(room => ({
        id: room._id,
        name: room.name,
        theme: room.theme,
        participantCount: room.participants.length,
        host: room.host.name,
        thumbnail: room.thumbnail,
        isLive: room.isLive,
        createdAt: room.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Error fetching rooms' });
  }
});

// Create new voice room
router.post('/rooms', auth.authenticateToken, async (req, res) => {
  try {
    const { name, theme, privacy } = req.body;
    
    const newRoom = new VoiceRoom({
      name,
      theme,
      privacy,
      host: req.user.id,
      participants: [{
        user: req.user.id,
        role: 'host',
        isSpeaking: false,
        isMuted: false
      }],
      isActive: true,
      isLive: true,
      thumbnail: `/thumbnails/${theme.toLowerCase().replace(' ', '-')}.jpg`,
      createdAt: new Date()
    });
    
    await newRoom.save();
    
    res.json({
      success: true,
      room: {
        id: newRoom._id,
        name: newRoom.name,
        theme: newRoom.theme,
        participantCount: 1,
        host: req.user.name,
        thumbnail: newRoom.thumbnail,
        isLive: true
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Error creating room' });
  }
});

// Get specific room details
router.get('/rooms/:roomId', auth.authenticateToken, async (req, res) => {
  try {
    const room = await VoiceRoom.findById(req.params.roomId)
      .populate('host', 'name avatar')
      .populate('participants.user', 'name avatar level coins');
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.json({
      success: true,
      room: {
        id: room._id,
        name: room.name,
        theme: room.theme,
        privacy: room.privacy,
        host: room.host,
        participants: room.participants,
        isLive: room.isLive,
        createdAt: room.createdAt,
        settings: room.settings
      }
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ success: false, message: 'Error fetching room' });
  }
});

// Join room
router.post('/rooms/:roomId/join', auth.authenticateToken, async (req, res) => {
  try {
    const room = await VoiceRoom.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    if (room.privacy === 'private') {
      // Check if user has invitation
      // For now, allow anyone to join
    }
    
    // Check if user is already in room
    const existingParticipant = room.participants.find(
      p => p.user.toString() === req.user.id
    );
    
    if (existingParticipant) {
      return res.json({
        success: true,
        message: 'Already in room',
        room: {
          id: room._id,
          name: room.name,
          participants: room.participants
        }
      });
    }
    
    // Add user to room
    room.participants.push({
      user: req.user.id,
      role: 'audience',
      isSpeaking: false,
      isMuted: true
    });
    
    await room.save();
    
    res.json({
      success: true,
      message: 'Joined room successfully',
      room: {
        id: room._id,
        name: room.name,
        participants: room.participants
      }
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ success: false, message: 'Error joining room' });
  }
});

// Leave room
router.post('/rooms/:roomId/leave', auth.authenticateToken, async (req, res) => {
  try {
    const room = await VoiceRoom.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    room.participants = room.participants.filter(
      p => p.user.toString() !== req.user.id
    );
    
    await room.save();
    
    res.json({ success: true, message: 'Left room successfully' });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ success: false, message: 'Error leaving room' });
  }
});

// Update participant status
router.put('/rooms/:roomId/participants/:userId', auth.authenticateToken, async (req, res) => {
  try {
    const { isSpeaking, isMuted, role } = req.body;
    const room = await VoiceRoom.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    const participant = room.participants.find(
      p => p.user.toString() === req.params.userId
    );
    
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }
    
    if (isSpeaking !== undefined) participant.isSpeaking = isSpeaking;
    if (isMuted !== undefined) participant.isMuted = isMuted;
    if (role !== undefined) participant.role = role;
    
    await room.save();
    
    res.json({ success: true, message: 'Participant updated successfully' });
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ success: false, message: 'Error updating participant' });
  }
});

module.exports = router;
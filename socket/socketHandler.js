const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');

// Store active connections
const activeUsers = new Map();
const roomUsers = new Map();

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || user.isBanned) {
      return next(new Error('Authentication error'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const socketHandler = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected: ${socket.id}`);

    // Store active user
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      joinedAt: new Date()
    });

    // Update user online status
    User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    }).exec();

    // Emit user online status to friends
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      username: socket.user.username
    });

    // Join user to their personal room for private messages
    socket.join(`user_${socket.userId}`);

    // Handle joining a room
    socket.on('join_room', async (data) => {
      try {
        const { roomId, password } = data;

        const room = await Room.findById(roomId)
          .populate('host', 'username avatar')
          .populate('currentParticipants.user', 'username avatar');

        if (!room || !room.isActive) {
          socket.emit('error', { message: 'Room not found or inactive' });
          return;
        }

        // Check password for private rooms
        if (room.isPrivate && room.password && room.password !== password) {
          socket.emit('error', { message: 'Invalid room password' });
          return;
        }

        // Check if user is already in room
        const isAlreadyParticipant = room.currentParticipants.some(
          p => p.user._id.toString() === socket.userId
        );

        if (!isAlreadyParticipant) {
          // Add user to room
          const added = room.addParticipant(socket.userId);
          if (!added) {
            socket.emit('error', { message: 'Room is full' });
            return;
          }
          await room.save();
        }

        // Join socket room
        socket.join(roomId);
        
        // Track user in room
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId).add(socket.userId);

        // Notify room about new participant
        socket.to(roomId).emit('user_joined_room', {
          user: {
            _id: socket.userId,
            username: socket.user.username,
            avatar: socket.user.avatar
          },
          roomId
        });

        // Send room data to user
        await room.populate('currentParticipants.user', 'username avatar');
        socket.emit('room_joined', {
          room: room.toObject(),
          message: 'Successfully joined room'
        });

        // Send recent messages
        const recentMessages = await Message.find({
          room: roomId,
          isDeleted: false
        })
          .populate('sender', 'username avatar')
          .sort({ createdAt: -1 })
          .limit(50);

        socket.emit('room_messages', {
          messages: recentMessages.reverse()
        });

      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a room
    socket.on('leave_room', async (data) => {
      try {
        const { roomId } = data;

        const room = await Room.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Remove user from room
        room.removeParticipant(socket.userId);

        // If host leaves and there are other participants, transfer host
        if (room.isHost(socket.userId) && room.currentParticipants.length > 0) {
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

        // Leave socket room
        socket.leave(roomId);
        
        // Remove from room tracking
        if (roomUsers.has(roomId)) {
          roomUsers.get(roomId).delete(socket.userId);
          if (roomUsers.get(roomId).size === 0) {
            roomUsers.delete(roomId);
          }
        }

        // Notify room about participant leaving
        socket.to(roomId).emit('user_left_room', {
          userId: socket.userId,
          username: socket.user.username,
          roomId
        });

        socket.emit('room_left', {
          roomId,
          message: 'Successfully left room'
        });

      } catch (error) {
        console.error('Leave room error:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // Handle room messages
    socket.on('room_message', async (data) => {
      try {
        const { roomId, content, type = 'text', replyTo } = data;

        // Validate message
        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content cannot be empty' });
          return;
        }

        if (content.length > 1000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        // Check if user is in room
        const room = await Room.findById(roomId);
        if (!room || !room.isActive) {
          socket.emit('error', { message: 'Room not found or inactive' });
          return;
        }

        const isParticipant = room.currentParticipants.some(
          p => p.user.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'You are not in this room' });
          return;
        }

        // Create message
        const message = new Message({
          sender: socket.userId,
          room: roomId,
          content: content.trim(),
          type,
          replyTo
        });

        await message.save();
        await message.populate('sender', 'username avatar');
        
        if (replyTo) {
          await message.populate('replyTo', 'content sender');
        }

        // Update room stats
        room.stats.totalMessages += 1;
        await room.save();

        // Broadcast message to room
        io.to(roomId).emit('new_room_message', {
          message: message.toObject()
        });

      } catch (error) {
        console.error('Room message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle private messages
    socket.on('private_message', async (data) => {
      try {
        const { recipientId, content, type = 'text' } = data;

        // Validate message
        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content cannot be empty' });
          return;
        }

        if (content.length > 1000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
          socket.emit('error', { message: 'Recipient not found' });
          return;
        }

        // Check if users have blocked each other
        if (socket.user.blockedUsers.includes(recipientId) || 
            recipient.blockedUsers.includes(socket.userId)) {
          socket.emit('error', { message: 'Cannot send message to this user' });
          return;
        }

        // Create message
        const message = new Message({
          sender: socket.userId,
          recipient: recipientId,
          content: content.trim(),
          type
        });

        await message.save();
        await message.populate('sender', 'username avatar');
        await message.populate('recipient', 'username avatar');

        // Send to recipient if online
        socket.to(`user_${recipientId}`).emit('new_private_message', {
          message: message.toObject()
        });

        // Confirm to sender
        socket.emit('message_sent', {
          message: message.toObject()
        });

      } catch (error) {
        console.error('Private message error:', error);
        socket.emit('error', { message: 'Failed to send private message' });
      }
    });

    // Handle WebRTC signaling for voice/video calls
    socket.on('webrtc_offer', (data) => {
      const { roomId, offer, targetUserId } = data;
      
      if (targetUserId) {
        // Direct call to specific user
        socket.to(`user_${targetUserId}`).emit('webrtc_offer', {
          offer,
          fromUserId: socket.userId,
          fromUsername: socket.user.username
        });
      } else if (roomId) {
        // Broadcast to room
        socket.to(roomId).emit('webrtc_offer', {
          offer,
          fromUserId: socket.userId,
          fromUsername: socket.user.username
        });
      }
    });

    socket.on('webrtc_answer', (data) => {
      const { answer, targetUserId } = data;
      
      socket.to(`user_${targetUserId}`).emit('webrtc_answer', {
        answer,
        fromUserId: socket.userId
      });
    });

    socket.on('webrtc_ice_candidate', (data) => {
      const { candidate, targetUserId, roomId } = data;
      
      if (targetUserId) {
        socket.to(`user_${targetUserId}`).emit('webrtc_ice_candidate', {
          candidate,
          fromUserId: socket.userId
        });
      } else if (roomId) {
        socket.to(roomId).emit('webrtc_ice_candidate', {
          candidate,
          fromUserId: socket.userId
        });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { roomId, recipientId } = data;
      
      if (roomId) {
        socket.to(roomId).emit('user_typing', {
          userId: socket.userId,
          username: socket.user.username,
          roomId
        });
      } else if (recipientId) {
        socket.to(`user_${recipientId}`).emit('user_typing', {
          userId: socket.userId,
          username: socket.user.username
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { roomId, recipientId } = data;
      
      if (roomId) {
        socket.to(roomId).emit('user_stopped_typing', {
          userId: socket.userId,
          roomId
        });
      } else if (recipientId) {
        socket.to(`user_${recipientId}`).emit('user_stopped_typing', {
          userId: socket.userId
        });
      }
    });

    // Handle gift animations
    socket.on('send_gift_animation', (data) => {
      const { roomId, recipientId, giftType, animation } = data;
      
      const giftData = {
        fromUserId: socket.userId,
        fromUsername: socket.user.username,
        giftType,
        animation
      };

      if (roomId) {
        socket.to(roomId).emit('gift_animation', {
          ...giftData,
          roomId
        });
      } else if (recipientId) {
        socket.to(`user_${recipientId}`).emit('gift_animation', giftData);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected: ${socket.id}`);

      // Remove from active users
      activeUsers.delete(socket.userId);

      // Remove from all rooms
      for (const [roomId, userSet] of roomUsers.entries()) {
        if (userSet.has(socket.userId)) {
          userSet.delete(socket.userId);
          
          // Notify room about user leaving
          socket.to(roomId).emit('user_left_room', {
            userId: socket.userId,
            username: socket.user.username,
            roomId
          });

          // Update room participant list
          try {
            const room = await Room.findById(roomId);
            if (room) {
              room.removeParticipant(socket.userId);
              
              // If no participants left, deactivate room
              if (room.currentParticipants.length === 0) {
                room.isActive = false;
                room.endedAt = new Date();
              }
              
              await room.save();
            }
          } catch (error) {
            console.error('Error updating room on disconnect:', error);
          }
        }
      }

      // Update user offline status
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        });

        // Notify friends about offline status
        socket.broadcast.emit('user_offline', {
          userId: socket.userId,
          username: socket.user.username
        });
      } catch (error) {
        console.error('Error updating user status on disconnect:', error);
      }
    });

    // Send initial data
    socket.emit('connected', {
      message: 'Connected successfully',
      user: socket.user.getPublicProfile()
    });
  });

  // Periodic cleanup of inactive rooms
  setInterval(async () => {
    try {
      const inactiveRooms = await Room.find({
        isActive: true,
        currentParticipants: { $size: 0 },
        updatedAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } // 30 minutes ago
      });

      for (const room of inactiveRooms) {
        room.isActive = false;
        room.endedAt = new Date();
        await room.save();
      }

      if (inactiveRooms.length > 0) {
        console.log(`Cleaned up ${inactiveRooms.length} inactive rooms`);
      }
    } catch (error) {
      console.error('Room cleanup error:', error);
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
};

module.exports = socketHandler;
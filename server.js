const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// In-memory storage
const users = new Map();
const rooms = new Map();
const messages = new Map();

// Helper function to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Sample rooms data matching Achat Global
const sampleRooms = [
  {
    id: '1',
    name: 'Global Chat',
    imageUrl: 'assets/resource/home_h/friend_match_bg.webp',
    userCount: 1245,
    isLocked: false,
    isLive: true,
    participants: [],
    category: 'General',
    creatorId: 'admin'
  },
  {
    id: '2',
    name: 'Music Lovers',
    imageUrl: 'assets/resource/live_h/bg_top_cover_film.png',
    userCount: 856,
    isLocked: true,
    isLive: true,
    participants: [],
    category: 'Music',
    creatorId: 'admin'
  },
  {
    id: '3',
    name: 'Talent Show',
    imageUrl: 'assets/resource/live_h/bg_cover_talent.png',
    userCount: 2103,
    isLocked: false,
    isLive: true,
    participants: [],
    category: 'Entertainment',
    creatorId: 'admin'
  },
  {
    id: '4',
    name: 'PK Battles',
    imageUrl: 'assets/resource/live_h/bg_cover_matchmaker.png',
    userCount: 3421,
    isLocked: false,
    isLive: true,
    participants: [],
    category: 'Games',
    creatorId: 'admin'
  }
];

// Initialize rooms
sampleRooms.forEach(room => {
  rooms.set(room.id, room);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User authentication
  socket.on('login', (userData) => {
    const userId = generateId();
    const user = {
      id: userId,
      socketId: socket.id,
      ...userData,
      online: true,
      lastSeen: new Date()
    };
    
    users.set(userId, user);
    socket.userId = userId;
    
    // Join user to global room
    socket.join('global');
    
    // Emit success to user
    socket.emit('loginSuccess', { userId, ...userData });
    
    // Broadcast user join to global room
    socket.to('global').emit('userJoined', user);
    
    // Send existing rooms to user
    socket.emit('roomsList', Array.from(rooms.values()));
  });

  // Create room
  socket.on('createRoom', (roomData) => {
    const roomId = generateId();
    const room = {
      id: roomId,
      creator: socket.userId,
      participants: [socket.userId],
      ...roomData,
      createdAt: new Date()
    };
    
    rooms.set(roomId, room);
    
    // Join creator to room
    socket.join(roomId);
    
    // Notify all users about new room
    io.emit('roomCreated', room);
  });

  // Join room
  socket.on('joinRoom', (roomId) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      
      // Add user to room
      if (!room.participants.includes(socket.userId)) {
        room.participants.push(socket.userId);
        room.userCount = room.participants.length;
        rooms.set(roomId, room);
      }
      
      // Join socket room
      socket.join(roomId);
      
      // Notify room users
      socket.to(roomId).emit('userJoinedRoom', {
        userId: socket.userId,
        roomId: roomId
      });
      
      // Send room info to user
      socket.emit('roomJoined', room);
      
      // Update room list for all users
      io.emit('roomsList', Array.from(rooms.values()));
    }
  });

  // Leave room
  socket.on('leaveRoom', (roomId) => {
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      
      // Remove user from room
      room.participants = room.participants.filter(id => id !== socket.userId);
      room.userCount = room.participants.length;
      rooms.set(roomId, room);
      
      // Leave socket room
      socket.leave(roomId);
      
      // Notify room users
      socket.to(roomId).emit('userLeftRoom', {
        userId: socket.userId,
        roomId: roomId
      });
      
      // Update room list for all users
      io.emit('roomsList', Array.from(rooms.values()));
    }
  });

  // Send message
  socket.on('sendMessage', (data) => {
    const { roomId, message } = data;
    const user = users.get(socket.userId);
    
    if (user && rooms.has(roomId)) {
      const messageData = {
        id: generateId(),
        userId: socket.userId,
        username: user.username,
        content: message,
        timestamp: new Date()
      };
      
      // Store message
      if (!messages.has(roomId)) {
        messages.set(roomId, []);
      }
      messages.get(roomId).push(messageData);
      
      // Broadcast message to room
      io.to(roomId).emit('messageReceived', messageData);
    }
  });

  // Voice chat events
  socket.on('startVoiceChat', (roomId) => {
    socket.to(roomId).emit('voiceChatStarted', {
      userId: socket.userId,
      roomId: roomId
    });
  });

  socket.on('stopVoiceChat', (roomId) => {
    socket.to(roomId).emit('voiceChatStopped', {
      userId: socket.userId,
      roomId: roomId
    });
  });

  // PK Battle events
  socket.on('startPK', (data) => {
    const { roomId, opponentId } = data;
    socket.to(roomId).emit('PKStarted', {
      challengerId: socket.userId,
      opponentId,
      roomId
    });
  });

  socket.on('votePK', (data) => {
    const { roomId, voteFor } = data;
    socket.to(roomId).emit('PKVoteReceived', {
      userId: socket.userId,
      voteFor,
      roomId
    });
  });

  socket.on('endPK', (roomId) => {
    socket.to(roomId).emit('PKEnded', {
      roomId
    });
  });

  // Talent Show events
  socket.on('startTalentShow', (roomId) => {
    socket.to(roomId).emit('talentShowStarted', {
      userId: socket.userId,
      roomId: roomId
    });
  });

  socket.on('stopTalentShow', (roomId) => {
    socket.to(roomId).emit('talentShowStopped', {
      userId: socket.userId,
      roomId: roomId
    });
  });

  // Friend system events
  socket.on('addFriend', (friendId) => {
    const user = users.get(socket.userId);
    if (user) {
      if (!user.friends) user.friends = [];
      if (!user.friends.includes(friendId)) {
        user.friends.push(friendId);
        users.set(socket.userId, user);
        
        // Notify user
        socket.emit('friendAdded', friendId);
        
        // Notify friend if online
        const friend = users.get(friendId);
        if (friend && friend.online) {
          io.to(friend.socketId).emit('friendRequest', socket.userId);
        }
      }
    }
  });

  socket.on('removeFriend', (friendId) => {
    const user = users.get(socket.userId);
    if (user && user.friends) {
      user.friends = user.friends.filter(id => id !== friendId);
      users.set(socket.userId, user);
      
      // Notify user
      socket.emit('friendRemoved', friendId);
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Update user status
    if (socket.userId && users.has(socket.userId)) {
      const user = users.get(socket.userId);
      user.online = false;
      user.lastSeen = new Date();
      users.set(socket.userId, user);
      
      // Notify others
      socket.to('global').emit('userLeft', user);
    }
  });
});

// REST API endpoints
app.get('/api/rooms', (req, res) => {
  res.json(Array.from(rooms.values()));
});

app.get('/api/users', (req, res) => {
  res.json(Array.from(users.values()));
});

app.get('/api/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const roomMessages = messages.get(roomId) || [];
  res.json(roomMessages);
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
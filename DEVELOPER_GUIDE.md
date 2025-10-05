# 👨‍💻 Developer Guide - Live Chatroom

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup Development Environment](#setup-development-environment)
4. [Project Structure](#project-structure)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Flutter Development](#flutter-development)
8. [Database Schema](#database-schema)
9. [API Integration](#api-integration)
10. [WebSocket Implementation](#websocket-implementation)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Contributing](#contributing)

---

## Project Overview

Live Chatroom is a full-stack voice chat application built with:
- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: React + TypeScript
- **Mobile**: Flutter
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO + Agora SDK
- **Authentication**: JWT

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
├─────────────────┬─────────────────┬────────────────────┤
│   Web Client    │  Mobile (iOS)   │  Mobile (Android)  │
│   (React)       │   (Flutter)     │    (Flutter)       │
└────────┬────────┴────────┬────────┴────────┬───────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │
                    │ (Reverse    │
                    │  Proxy)     │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ Express │      │Socket.IO│      │  Agora  │
    │   API   │      │ Server  │      │   SDK   │
    └────┬────┘      └────┬────┘      └─────────┘
         │                │
         └────────┬───────┘
                  │
         ┌────────▼────────┐
         │    MongoDB      │
         │   (Database)    │
         └─────────────────┘
```

### Technology Stack

**Backend:**
- Node.js 18+
- Express.js 4.x
- Socket.IO 4.x
- Mongoose 7.x
- JWT for authentication
- Agora SDK for voice chat

**Frontend:**
- React 18+
- TypeScript
- Socket.IO Client
- Axios for HTTP requests
- React Router for navigation

**Mobile:**
- Flutter 3.16+
- Dart 3.x
- Socket.IO Client
- HTTP package
- Provider for state management

**Database:**
- MongoDB 6.0+
- Mongoose ODM

**DevOps:**
- Docker
- Kubernetes
- GitHub Actions
- Nginx

---

## Setup Development Environment

### Prerequisites

1. **Node.js & npm**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Verify installation
   node --version
   npm --version
   ```

2. **MongoDB**
   ```bash
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Flutter** (for mobile development)
   ```bash
   # Download Flutter SDK
   git clone https://github.com/flutter/flutter.git -b stable
   
   # Add to PATH
   export PATH="$PATH:`pwd`/flutter/bin"
   
   # Verify installation
   flutter doctor
   ```

4. **Git**
   ```bash
   sudo apt-get install git
   ```

### Clone Repository

```bash
git clone https://github.com/babatravels8210-alt/Live-chatroom.git
cd Live-chatroom
```

### Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd client
npm install
cd ..
```

**Flutter:**
```bash
flutter pub get
```

### Environment Configuration

Create `.env` file in root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
NODE_ENV=development
PORT=12000
CLIENT_URL=http://localhost:3000

DB_URI=mongodb://localhost:27017/livechatroom

JWT_SECRET=your-development-secret-key
JWT_EXPIRE=7d

AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Start Development Servers

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
cd client
npm start
```

**Flutter:**
```bash
flutter run
```

---

## Project Structure

```
Live-chatroom/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Main app component
│   └── package.json
│
├── lib/                   # Flutter app
│   ├── models/           # Data models
│   ├── screens/          # App screens
│   ├── services/         # API services
│   ├── widgets/          # Reusable widgets
│   └── main.dart         # App entry point
│
├── models/               # MongoDB models
│   ├── User.js
│   ├── Room.js
│   ├── Message.js
│   └── VoiceRoom.js
│
├── routes/               # API routes
│   ├── auth.js
│   ├── users.js
│   ├── rooms.js
│   └── voiceRooms.js
│
├── middleware/           # Express middleware
│   └── auth.js
│
├── socket/              # Socket.IO handlers
│   └── socketHandler.js
│
├── config/              # Configuration files
│   └── database.js
│
├── tests/               # Test files
│   ├── backend/
│   └── flutter/
│
├── scripts/             # Utility scripts
│   ├── build-apk.sh
│   └── backup.sh
│
├── .github/             # GitHub Actions
│   └── workflows/
│
├── server.js            # Main server file
├── package.json         # Node dependencies
├── pubspec.yaml         # Flutter dependencies
└── README.md
```

---

## Backend Development

### Creating API Endpoints

**Example: Create a new route**

1. **Create route file** (`routes/example.js`):
```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Public route
router.get('/public', async (req, res) => {
  try {
    res.json({
      success: true,
      data: { message: 'Public data' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Protected route
router.get('/protected', auth, async (req, res) => {
  try {
    // req.user contains authenticated user
    res.json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

2. **Register route in server.js**:
```javascript
const exampleRoutes = require('./routes/example');
app.use('/api/example', exampleRoutes);
```

### Creating Database Models

**Example: Create a model** (`models/Example.js`):
```javascript
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes
exampleSchema.index({ name: 1 });
exampleSchema.index({ user: 1 });

// Add methods
exampleSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Example', exampleSchema);
```

### Middleware Development

**Example: Custom middleware** (`middleware/example.js`):
```javascript
const exampleMiddleware = async (req, res, next) => {
  try {
    // Middleware logic
    console.log('Request received:', req.method, req.path);
    
    // Add custom data to request
    req.customData = 'some data';
    
    // Continue to next middleware
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = exampleMiddleware;
```

---

## Frontend Development

### Creating React Components

**Example: Functional component**
```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Room {
  _id: string;
  name: string;
  description: string;
  participantCount: number;
}

const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms');
      setRooms(response.data.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="room-list">
      {rooms.map(room => (
        <div key={room._id} className="room-card">
          <h3>{room.name}</h3>
          <p>{room.description}</p>
          <span>{room.participantCount} participants</span>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
```

### API Service Layer

**Example: API service** (`services/api.ts`):
```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:12000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const roomService = {
  getRooms: () => api.get('/rooms'),
  getRoom: (id: string) => api.get(`/rooms/${id}`),
  createRoom: (data: any) => api.post('/rooms', data),
  updateRoom: (id: string, data: any) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id: string) => api.delete(`/rooms/${id}`)
};

export default api;
```

---

## Flutter Development

### Creating Flutter Screens

**Example: Room list screen**
```dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class RoomListScreen extends StatefulWidget {
  @override
  _RoomListScreenState createState() => _RoomListScreenState();
}

class _RoomListScreenState extends State<RoomListScreen> {
  List<dynamic> rooms = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    fetchRooms();
  }

  Future<void> fetchRooms() async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:12000/api/rooms'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          rooms = data['data']['rooms'];
          loading = false;
        });
      }
    } catch (e) {
      print('Error fetching rooms: $e');
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Center(child: CircularProgressIndicator());
    }

    return ListView.builder(
      itemCount: rooms.length,
      itemBuilder: (context, index) {
        final room = rooms[index];
        return ListTile(
          title: Text(room['name']),
          subtitle: Text(room['description']),
          trailing: Text('${room['participantCount']} users'),
          onTap: () {
            // Navigate to room
          },
        );
      },
    );
  }
}
```

### State Management with Provider

**Example: User provider**
```dart
import 'package:flutter/foundation.dart';

class UserProvider with ChangeNotifier {
  Map<String, dynamic>? _user;
  String? _token;

  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  bool get isAuthenticated => _token != null;

  void setUser(Map<String, dynamic> user, String token) {
    _user = user;
    _token = token;
    notifyListeners();
  }

  void logout() {
    _user = null;
    _token = null;
    notifyListeners();
  }
}
```

---

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  displayName: String,
  bio: String,
  avatar: String (URL),
  coins: Number (default: 0),
  level: Number (default: 1),
  friends: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Room Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  category: String (enum),
  host: ObjectId (ref: User, required),
  participants: [ObjectId] (ref: User),
  maxParticipants: Number (default: 50),
  isPrivate: Boolean (default: false),
  password: String (hashed, optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  room: ObjectId (ref: Room, required),
  sender: ObjectId (ref: User, required),
  content: String (required),
  type: String (enum: text, image, gift, system),
  metadata: Object,
  createdAt: Date
}
```

---

## API Integration

### Authentication Flow

```javascript
// 1. Register
POST /api/auth/register
Body: { username, email, password }
Response: { user, token }

// 2. Login
POST /api/auth/login
Body: { email, password }
Response: { user, token }

// 3. Use token in subsequent requests
Headers: { Authorization: 'Bearer <token>' }
```

### Error Handling

```javascript
try {
  const response = await api.get('/rooms');
  // Handle success
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data.error);
  } else if (error.request) {
    // Request made but no response
    console.error('Network error');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

---

## WebSocket Implementation

### Server-side (Socket.IO)

```javascript
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', async ({ roomId }) => {
    socket.join(roomId);
    io.to(roomId).emit('user-joined', {
      userId: socket.userId,
      roomId
    });
  });

  // Send message
  socket.on('send-message', async ({ roomId, content }) => {
    const message = await Message.create({
      room: roomId,
      sender: socket.userId,
      content
    });
    
    io.to(roomId).emit('new-message', message);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

### Client-side (React)

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:12000', {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Join room
socket.emit('join-room', { roomId: '123' });

// Listen for messages
socket.on('new-message', (message) => {
  console.log('New message:', message);
});

// Send message
const sendMessage = (content: string) => {
  socket.emit('send-message', {
    roomId: '123',
    content
  });
};
```

---

## Testing

### Backend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- tests/backend/unit/user.test.js
```

### Flutter Tests

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Run specific test
flutter test test/widget_test.dart
```

---

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

---

## Contributing

### Workflow

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Create Pull Request**

### Code Style

**JavaScript/TypeScript:**
- Use ESLint configuration
- 2 spaces indentation
- Semicolons required
- Single quotes for strings

**Dart:**
- Follow Flutter style guide
- Use `flutter format`
- 2 spaces indentation

### Commit Messages

Follow conventional commits:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## Resources

- **Node.js**: https://nodejs.org/
- **Express**: https://expressjs.com/
- **React**: https://react.dev/
- **Flutter**: https://flutter.dev/
- **MongoDB**: https://www.mongodb.com/
- **Socket.IO**: https://socket.io/
- **Agora**: https://www.agora.io/

---

**Happy Coding! 👨‍💻**
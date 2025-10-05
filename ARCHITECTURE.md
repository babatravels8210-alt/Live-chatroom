# 🏗️ Architecture Documentation - Live Chatroom

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Scalability Design](#scalability-design)
7. [Technology Decisions](#technology-decisions)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├──────────────────┬──────────────────┬──────────────────────────┤
│   Web Browser    │   iOS Device     │   Android Device         │
│   (React SPA)    │   (Flutter)      │   (Flutter)              │
└────────┬─────────┴────────┬─────────┴────────┬─────────────────┘
         │                  │                  │
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Load Balancer │
                    │    (Nginx)     │
                    └───────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
    │ App      │      │ App      │      │ App      │
    │ Server 1 │      │ Server 2 │      │ Server 3 │
    └────┬─────┘      └────┬─────┘      └────┬─────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
    │ MongoDB  │      │  Redis   │      │  Agora   │
    │ Primary  │      │  Cache   │      │   SDK    │
    └────┬─────┘      └──────────┘      └──────────┘
         │
    ┌────▼─────┐
    │ MongoDB  │
    │Secondary │
    └──────────┘
```

### System Components

1. **Client Layer**
   - Web Application (React)
   - Mobile Applications (Flutter)
   - Responsive UI/UX

2. **API Gateway**
   - Nginx reverse proxy
   - Load balancing
   - SSL termination
   - Rate limiting

3. **Application Layer**
   - Node.js + Express servers
   - Socket.IO for real-time communication
   - RESTful API endpoints
   - WebSocket handlers

4. **Data Layer**
   - MongoDB for persistent storage
   - Redis for caching and sessions
   - Cloudinary for media storage

5. **External Services**
   - Agora SDK for voice chat
   - Email service (SMTP)
   - Payment gateway (Razorpay)

---

## Architecture Patterns

### 1. Microservices-Ready Monolith

Current implementation uses a modular monolith that can be split into microservices:

```
┌─────────────────────────────────────────┐
│         Monolithic Application          │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │   Auth   │  │  Users   │            │
│  │ Service  │  │ Service  │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │  Rooms   │  │ Messages │            │
│  │ Service  │  │ Service  │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │  Voice   │  │ Payment  │            │
│  │ Service  │  │ Service  │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

**Benefits:**
- Easier to develop and deploy initially
- Shared database transactions
- Lower operational complexity
- Can be split later when needed

### 2. Layered Architecture

```
┌─────────────────────────────────────────┐
│        Presentation Layer               │
│  (Controllers, Routes, Middleware)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Business Logic Layer            │
│     (Services, Business Rules)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Data Access Layer               │
│    (Models, Repositories, DAOs)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│           Database Layer                │
│         (MongoDB, Redis)                │
└─────────────────────────────────────────┘
```

### 3. Event-Driven Architecture

Real-time features use event-driven patterns:

```
┌──────────┐     Events      ┌──────────┐
│  Client  │ ──────────────> │  Server  │
│          │                 │          │
│          │ <────────────── │          │
└──────────┘     Events      └────┬─────┘
                                  │
                            ┌─────▼─────┐
                            │   Event   │
                            │  Handler  │
                            └─────┬─────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐
              │  Update   │ │ Notify  │ │   Log     │
              │ Database  │ │ Clients │ │  Event    │
              └───────────┘ └─────────┘ └───────────┘
```

---

## Component Architecture

### Backend Components

#### 1. Express Application

```javascript
// server.js
const express = require('express');
const app = express();

// Middleware stack
app.use(helmet());           // Security headers
app.use(cors());             // CORS handling
app.use(compression());      // Response compression
app.use(express.json());     // JSON parsing
app.use(morgan('combined')); // Logging
app.use(rateLimit());        // Rate limiting

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/voice-rooms', voiceRoomRoutes);

// Error handling
app.use(errorHandler);
```

#### 2. Socket.IO Server

```javascript
// socket/socketHandler.js
const socketHandler = (io) => {
  // Middleware
  io.use(socketAuth);
  
  // Connection handling
  io.on('connection', (socket) => {
    // Room events
    socket.on('join-room', handleJoinRoom);
    socket.on('leave-room', handleLeaveRoom);
    
    // Message events
    socket.on('send-message', handleSendMessage);
    
    // Voice events
    socket.on('request-speaker', handleSpeakerRequest);
    socket.on('toggle-mute', handleToggleMute);
    
    // Disconnect
    socket.on('disconnect', handleDisconnect);
  });
};
```

#### 3. Database Models

```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // ... other fields
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// Methods
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Hooks
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
```

### Frontend Components

#### 1. React Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── room/
│   │   ├── RoomCard.tsx
│   │   ├── RoomList.tsx
│   │   └── RoomDetails.tsx
│   └── voice/
│       ├── VoiceControls.tsx
│       ├── ParticipantList.tsx
│       └── SpeakerRequest.tsx
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Room.tsx
│   └── Profile.tsx
├── services/
│   ├── api.ts
│   ├── socket.ts
│   └── agora.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useSocket.ts
│   └── useVoiceChat.ts
└── context/
    ├── AuthContext.tsx
    └── SocketContext.tsx
```

#### 2. State Management

```typescript
// context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Implementation...

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Mobile Components (Flutter)

#### 1. Flutter App Structure

```
lib/
├── models/
│   ├── user.dart
│   ├── room.dart
│   └── message.dart
├── screens/
│   ├── home_screen.dart
│   ├── room_screen.dart
│   └── profile_screen.dart
├── widgets/
│   ├── room_card.dart
│   ├── voice_controls.dart
│   └── participant_list.dart
├── services/
│   ├── api_service.dart
│   ├── socket_service.dart
│   └── voice_service.dart
├── providers/
│   ├── auth_provider.dart
│   └── room_provider.dart
└── main.dart
```

#### 2. Provider Pattern

```dart
// providers/auth_provider.dart
class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;

  User? get user => _user;
  bool get isAuthenticated => _token != null;

  Future<void> login(String email, String password) async {
    // Login logic
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

## Data Flow

### 1. Authentication Flow

```
┌────────┐                ┌────────┐                ┌──────────┐
│ Client │                │ Server │                │ Database │
└───┬────┘                └───┬────┘                └────┬─────┘
    │                         │                          │
    │ POST /api/auth/login    │                          │
    │ {email, password}       │                          │
    ├────────────────────────>│                          │
    │                         │                          │
    │                         │ Find user by email       │
    │                         ├─────────────────────────>│
    │                         │                          │
    │                         │ User data                │
    │                         │<─────────────────────────┤
    │                         │                          │
    │                         │ Verify password          │
    │                         │                          │
    │                         │ Generate JWT token       │
    │                         │                          │
    │ {user, token}           │                          │
    │<────────────────────────┤                          │
    │                         │                          │
    │ Store token in          │                          │
    │ localStorage/storage    │                          │
    │                         │                          │
```

### 2. Real-time Message Flow

```
┌─────────┐              ┌────────┐              ┌─────────┐
│ Client A│              │ Server │              │ Client B│
└────┬────┘              └───┬────┘              └────┬────┘
     │                       │                        │
     │ send-message          │                        │
     │ {roomId, content}     │                        │
     ├──────────────────────>│                        │
     │                       │                        │
     │                       │ Save to database       │
     │                       │                        │
     │                       │ Broadcast to room      │
     │                       │ new-message            │
     │                       ├───────────────────────>│
     │ new-message           │                        │
     │<──────────────────────┤                        │
     │                       │                        │
```

### 3. Voice Chat Flow

```
┌────────┐         ┌────────┐         ┌───────┐         ┌────────┐
│ Client │         │ Server │         │ Agora │         │ Client │
│   A    │         │        │         │  SDK  │         │   B    │
└───┬────┘         └───┬────┘         └───┬───┘         └───┬────┘
    │                  │                  │                  │
    │ Join room        │                  │                  │
    ├─────────────────>│                  │                  │
    │                  │                  │                  │
    │                  │ Generate token   │                  │
    │                  ├─────────────────>│                  │
    │                  │                  │                  │
    │                  │ Token            │                  │
    │                  │<─────────────────┤                  │
    │                  │                  │                  │
    │ Token + channel  │                  │                  │
    │<─────────────────┤                  │                  │
    │                  │                  │                  │
    │ Connect to Agora │                  │                  │
    ├──────────────────┼─────────────────>│                  │
    │                  │                  │                  │
    │                  │                  │ Audio stream     │
    │                  │                  ├─────────────────>│
    │                  │                  │                  │
```

---

## Security Architecture

### 1. Authentication & Authorization

```
┌─────────────────────────────────────────┐
│         Security Layers                 │
├─────────────────────────────────────────┤
│  1. HTTPS/TLS Encryption                │
│  2. JWT Token Authentication            │
│  3. Role-Based Access Control (RBAC)    │
│  4. Rate Limiting                       │
│  5. Input Validation                    │
│  6. SQL Injection Prevention            │
│  7. XSS Protection                      │
│  8. CSRF Protection                     │
└─────────────────────────────────────────┘
```

### 2. JWT Token Structure

```javascript
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    userId: "user_id",
    username: "johndoe",
    role: "user",
    iat: 1640000000,
    exp: 1640604800
  },
  signature: "..."
}
```

### 3. Security Middleware Stack

```javascript
// Security middleware
app.use(helmet());                    // Security headers
app.use(cors(corsOptions));           // CORS configuration
app.use(rateLimit(rateLimitOptions)); // Rate limiting
app.use(mongoSanitize());             // NoSQL injection prevention
app.use(xss());                       // XSS protection
```

---

## Scalability Design

### 1. Horizontal Scaling

```
┌─────────────────────────────────────────┐
│          Load Balancer                  │
│         (Round Robin)                   │
└──────┬──────────┬──────────┬───────────┘
       │          │          │
   ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
   │Server │  │Server │  │Server │
   │   1   │  │   2   │  │   3   │
   └───┬───┘  └───┬───┘  └───┬───┘
       │          │          │
       └──────────┼──────────┘
                  │
           ┌──────▼──────┐
           │   Database  │
           │   Cluster   │
           └─────────────┘
```

### 2. Caching Strategy

```
┌────────┐
│ Client │
└───┬────┘
    │
    │ Request
    ▼
┌────────────┐
│   Nginx    │ ◄── Static file cache
└─────┬──────┘
      │
      │ API Request
      ▼
┌────────────┐
│   Redis    │ ◄── Session cache
│   Cache    │     API response cache
└─────┬──────┘
      │
      │ Cache miss
      ▼
┌────────────┐
│ Application│
│   Server   │
└─────┬──────┘
      │
      │ Query
      ▼
┌────────────┐
│  MongoDB   │
└────────────┘
```

### 3. Database Optimization

**Indexes:**
```javascript
// User collection
db.users.createIndex({ username: 1 });
db.users.createIndex({ email: 1 });

// Room collection
db.rooms.createIndex({ category: 1, createdAt: -1 });
db.rooms.createIndex({ host: 1 });

// Message collection
db.messages.createIndex({ room: 1, createdAt: -1 });
```

**Sharding Strategy:**
```
┌─────────────────────────────────────────┐
│         MongoDB Cluster                 │
├─────────────────────────────────────────┤
│  Shard 1: Users A-M                     │
│  Shard 2: Users N-Z                     │
│  Shard 3: Rooms & Messages              │
└─────────────────────────────────────────┘
```

---

## Technology Decisions

### Why Node.js?
- **Non-blocking I/O**: Perfect for real-time applications
- **JavaScript everywhere**: Same language for frontend and backend
- **Large ecosystem**: npm packages for everything
- **WebSocket support**: Native support for Socket.IO

### Why MongoDB?
- **Flexible schema**: Easy to iterate and change data models
- **Horizontal scaling**: Built-in sharding support
- **JSON-like documents**: Natural fit for JavaScript
- **Rich queries**: Powerful query language

### Why React?
- **Component-based**: Reusable UI components
- **Virtual DOM**: Efficient rendering
- **Large community**: Extensive ecosystem
- **TypeScript support**: Type safety

### Why Flutter?
- **Cross-platform**: Single codebase for iOS and Android
- **Performance**: Compiled to native code
- **Hot reload**: Fast development
- **Beautiful UI**: Material Design and Cupertino widgets

### Why Socket.IO?
- **Real-time**: Bi-directional communication
- **Fallback support**: Works even without WebSocket
- **Room support**: Built-in room management
- **Reconnection**: Automatic reconnection handling

### Why Agora SDK?
- **High quality**: Superior audio quality
- **Low latency**: Real-time voice chat
- **Scalability**: Handles thousands of concurrent users
- **Global infrastructure**: CDN worldwide

---

## Future Enhancements

### 1. Microservices Migration
- Split monolith into independent services
- Service mesh for inter-service communication
- API gateway for routing

### 2. Advanced Features
- Video chat support
- Screen sharing
- Recording and playback
- AI-powered moderation

### 3. Performance Optimization
- CDN for static assets
- Database query optimization
- Caching improvements
- Code splitting

### 4. Monitoring & Observability
- Distributed tracing
- Metrics collection
- Log aggregation
- Alert system

---

**Last Updated:** 2024-01-01
**Version:** 1.0.0
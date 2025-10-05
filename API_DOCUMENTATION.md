# 📚 API Documentation - Live Chatroom

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Users API](#users-api)
4. [Rooms API](#rooms-api)
5. [Voice Rooms API](#voice-rooms-api)
6. [Messages API](#messages-api)
7. [WebSocket Events](#websocket-events)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)

---

## Overview

### Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:12000/api
```

### API Version
Current Version: `v1`

### Response Format
All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Authentication

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Validation Rules:**
- `username`: Required, 3-30 characters, alphanumeric
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `displayName`: Optional, max 50 characters

---

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "displayName": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

---

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "bio": "User bio",
      "avatar": "avatar_url",
      "coins": 1000,
      "level": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /api/auth/update-profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "displayName": "John Updated",
  "bio": "New bio",
  "avatar": "new_avatar_url"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "displayName": "John Updated",
      "bio": "New bio",
      "avatar": "new_avatar_url"
    }
  }
}
```

---

### Change Password

Change user password.

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Users API

### Get User Profile

Get public profile of any user.

**Endpoint:** `GET /api/users/:userId`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "displayName": "John Doe",
      "bio": "User bio",
      "avatar": "avatar_url",
      "level": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Search Users

Search for users by username or display name.

**Endpoint:** `GET /api/users/search`

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Results per page (default: 20)
- `page` (optional): Page number (default: 1)

**Example:** `GET /api/users/search?q=john&limit=10&page=1`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "username": "johndoe",
        "displayName": "John Doe",
        "avatar": "avatar_url"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5,
      "limit": 10
    }
  }
}
```

---

## Rooms API

### Create Room

Create a new chat room.

**Endpoint:** `POST /api/rooms`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "My Room",
  "description": "Room description",
  "category": "general",
  "isPrivate": false,
  "maxParticipants": 50,
  "password": "optional_password"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "room": {
      "_id": "room_id",
      "name": "My Room",
      "description": "Room description",
      "category": "general",
      "host": "user_id",
      "isPrivate": false,
      "maxParticipants": 50,
      "participants": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Categories:**
- `general`
- `music`
- `gaming`
- `education`
- `entertainment`
- `sports`
- `technology`

---

### Get All Rooms

Get list of all public rooms.

**Endpoint:** `GET /api/rooms`

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search by name
- `limit` (optional): Results per page (default: 20)
- `page` (optional): Page number (default: 1)
- `sort` (optional): Sort by (participants, createdAt)

**Example:** `GET /api/rooms?category=music&limit=10&sort=participants`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "_id": "room_id",
        "name": "Music Room",
        "description": "Music lovers",
        "category": "music",
        "host": {
          "_id": "user_id",
          "username": "johndoe",
          "displayName": "John Doe"
        },
        "participantCount": 25,
        "maxParticipants": 50,
        "isPrivate": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pages": 10,
      "limit": 10
    }
  }
}
```

---

### Get Room Details

Get detailed information about a specific room.

**Endpoint:** `GET /api/rooms/:roomId`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "room": {
      "_id": "room_id",
      "name": "My Room",
      "description": "Room description",
      "category": "general",
      "host": {
        "_id": "user_id",
        "username": "johndoe",
        "displayName": "John Doe",
        "avatar": "avatar_url"
      },
      "participants": [
        {
          "_id": "user_id",
          "username": "user1",
          "displayName": "User One",
          "role": "speaker"
        }
      ],
      "participantCount": 25,
      "maxParticipants": 50,
      "isPrivate": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Update Room

Update room information (host only).

**Endpoint:** `PUT /api/rooms/:roomId`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Updated Room Name",
  "description": "Updated description",
  "maxParticipants": 100
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "room": {
      "_id": "room_id",
      "name": "Updated Room Name",
      "description": "Updated description",
      "maxParticipants": 100
    }
  }
}
```

---

### Delete Room

Delete a room (host only).

**Endpoint:** `DELETE /api/rooms/:roomId`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Room deleted successfully"
}
```

---

### Join Room

Join a chat room.

**Endpoint:** `POST /api/rooms/:roomId/join`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body (for private rooms):**
```json
{
  "password": "room_password"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "room": {
      "_id": "room_id",
      "name": "My Room",
      "participants": ["user_id"]
    },
    "agoraToken": "agora_rtc_token"
  }
}
```

---

### Leave Room

Leave a chat room.

**Endpoint:** `POST /api/rooms/:roomId/leave`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Left room successfully"
}
```

---

## Voice Rooms API

### Create Voice Room

Create a new voice chat room with Agora integration.

**Endpoint:** `POST /api/voice-rooms`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Voice Chat Room",
  "description": "Voice chat description",
  "category": "music",
  "maxSpeakers": 10,
  "isPrivate": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "room": {
      "_id": "room_id",
      "name": "Voice Chat Room",
      "agoraChannelName": "channel_name",
      "host": "user_id",
      "speakers": [],
      "audience": [],
      "maxSpeakers": 10
    },
    "agoraToken": "agora_rtc_token"
  }
}
```

---

### Get Agora Token

Get Agora RTC token for voice chat.

**Endpoint:** `GET /api/voice-rooms/:roomId/token`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `role` (optional): `host`, `speaker`, or `audience` (default: audience)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "agora_rtc_token",
    "channelName": "channel_name",
    "uid": 12345,
    "expiresAt": "2024-01-01T01:00:00.000Z"
  }
}
```

---

### Request Speaker Role

Request to become a speaker in voice room.

**Endpoint:** `POST /api/voice-rooms/:roomId/request-speaker`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Speaker request sent"
}
```

---

### Approve Speaker

Approve speaker request (host only).

**Endpoint:** `POST /api/voice-rooms/:roomId/approve-speaker`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "userId": "user_id"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "agoraToken": "new_speaker_token"
  }
}
```

---

## Messages API

### Send Message

Send a message in a room.

**Endpoint:** `POST /api/rooms/:roomId/messages`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "content": "Hello everyone!",
  "type": "text"
}
```

**Message Types:**
- `text`: Regular text message
- `image`: Image message
- `gift`: Gift message
- `system`: System message

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "message_id",
      "room": "room_id",
      "sender": {
        "_id": "user_id",
        "username": "johndoe",
        "displayName": "John Doe"
      },
      "content": "Hello everyone!",
      "type": "text",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Get Messages

Get messages from a room.

**Endpoint:** `GET /api/rooms/:roomId/messages`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Messages per page (default: 50)
- `before` (optional): Get messages before this message ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "sender": {
          "_id": "user_id",
          "username": "johndoe",
          "displayName": "John Doe"
        },
        "content": "Hello!",
        "type": "text",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "hasMore": true
  }
}
```

---

## WebSocket Events

### Connection

Connect to WebSocket server.

**URL:** `ws://localhost:12000` or `wss://your-domain.com`

**Authentication:**
```javascript
socket.emit('authenticate', { token: 'jwt_token' });
```

---

### Room Events

#### Join Room
```javascript
// Client sends
socket.emit('join-room', { roomId: 'room_id' });

// Server responds
socket.on('room-joined', (data) => {
  // data: { roomId, participants }
});
```

#### Leave Room
```javascript
// Client sends
socket.emit('leave-room', { roomId: 'room_id' });

// Server responds
socket.on('room-left', (data) => {
  // data: { roomId }
});
```

#### New Message
```javascript
// Client sends
socket.emit('send-message', {
  roomId: 'room_id',
  content: 'Hello!',
  type: 'text'
});

// All clients in room receive
socket.on('new-message', (message) => {
  // message: { _id, sender, content, type, createdAt }
});
```

#### User Joined
```javascript
socket.on('user-joined', (data) => {
  // data: { roomId, user }
});
```

#### User Left
```javascript
socket.on('user-left', (data) => {
  // data: { roomId, userId }
});
```

---

### Voice Events

#### Speaker Request
```javascript
// Client sends
socket.emit('request-speaker', { roomId: 'room_id' });

// Host receives
socket.on('speaker-request', (data) => {
  // data: { roomId, user }
});
```

#### Speaker Approved
```javascript
// All clients receive
socket.on('speaker-approved', (data) => {
  // data: { roomId, userId, agoraToken }
});
```

#### Mute/Unmute
```javascript
// Client sends
socket.emit('toggle-mute', { roomId: 'room_id', muted: true });

// All clients receive
socket.on('user-muted', (data) => {
  // data: { roomId, userId, muted }
});
```

---

## Error Handling

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ERROR` | Resource already exists |
| `RATE_LIMIT_ERROR` | Too many requests |
| `SERVER_ERROR` | Internal server error |

### Error Response Example

```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "AUTHENTICATION_ERROR",
  "details": {
    "field": "email",
    "message": "Email not found"
  }
}
```

---

## Rate Limiting

### Limits

- **Authentication endpoints**: 5 requests per 15 minutes
- **API endpoints**: 100 requests per 15 minutes
- **WebSocket messages**: 50 messages per minute

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Rate Limit Error

```json
{
  "success": false,
  "error": "Too many requests, please try again later",
  "code": "RATE_LIMIT_ERROR",
  "retryAfter": 900
}
```

---

## Pagination

All list endpoints support pagination with these query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response includes pagination info:**
```json
{
  "pagination": {
    "total": 250,
    "page": 1,
    "pages": 13,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Postman Collection

Import this collection to test the API:

[Download Postman Collection](./postman_collection.json)

---

## Support

For API support, please contact:
- Email: api-support@example.com
- GitHub Issues: https://github.com/babatravels8210-alt/Live-chatroom/issues

---

**Last Updated:** 2024-01-01
**API Version:** 1.0.0
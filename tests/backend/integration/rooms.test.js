const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const User = require('../../../models/User');
const Room = require('../../../models/Room');

describe('Rooms API Tests', () => {
  let server;
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_DB_URI || 'mongodb://localhost:27017/livechatroom-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Start server
    server = app.listen(0);
  });

  afterAll(async () => {
    // Clean up and close connections
    await User.deleteMany({});
    await Room.deleteMany({});
    await mongoose.connection.close();
    await server.close();
  });

  beforeEach(async () => {
    // Clear data before each test
    await User.deleteMany({});
    await Room.deleteMany({});

    // Create and authenticate a test user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = response.body.data.token;
    userId = response.body.data.user._id;
  });

  describe('POST /api/rooms', () => {
    test('should create a new room', async () => {
      const roomData = {
        name: 'Test Room',
        description: 'Test room description',
        category: 'general',
        isPrivate: false,
      };

      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(roomData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.room).toBeDefined();
      expect(response.body.data.room.name).toBe(roomData.name);
      expect(response.body.data.room.host).toBe(userId);
    });

    test('should fail without authentication', async () => {
      const roomData = {
        name: 'Test Room',
        description: 'Test room description',
      };

      const response = await request(app)
        .post('/api/rooms')
        .send(roomData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/rooms', () => {
    beforeEach(async () => {
      // Create test rooms
      await Room.create([
        {
          name: 'Room 1',
          description: 'Description 1',
          host: userId,
          category: 'general',
        },
        {
          name: 'Room 2',
          description: 'Description 2',
          host: userId,
          category: 'music',
        },
        {
          name: 'Private Room',
          description: 'Private description',
          host: userId,
          category: 'general',
          isPrivate: true,
        },
      ]);
    });

    test('should get all public rooms', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rooms).toBeDefined();
      expect(response.body.data.rooms.length).toBe(2); // Only public rooms
    });

    test('should filter rooms by category', async () => {
      const response = await request(app)
        .get('/api/rooms?category=music')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rooms.length).toBe(1);
      expect(response.body.data.rooms[0].category).toBe('music');
    });

    test('should search rooms by name', async () => {
      const response = await request(app)
        .get('/api/rooms?search=Room 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rooms.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/rooms/:id', () => {
    let roomId;

    beforeEach(async () => {
      const room = await Room.create({
        name: 'Test Room',
        description: 'Test description',
        host: userId,
        category: 'general',
      });
      roomId = room._id;
    });

    test('should get room by id', async () => {
      const response = await request(app)
        .get(`/api/rooms/${roomId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.room).toBeDefined();
      expect(response.body.data.room._id).toBe(roomId.toString());
    });

    test('should fail with invalid room id', async () => {
      const response = await request(app)
        .get('/api/rooms/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail with non-existent room id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/rooms/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/rooms/:id', () => {
    let roomId;

    beforeEach(async () => {
      const room = await Room.create({
        name: 'Test Room',
        description: 'Test description',
        host: userId,
        category: 'general',
      });
      roomId = room._id;
    });

    test('should update room as host', async () => {
      const updateData = {
        name: 'Updated Room',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.room.name).toBe(updateData.name);
      expect(response.body.data.room.description).toBe(updateData.description);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/rooms/${roomId}`)
        .send({ name: 'Updated Room' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail when not host', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'otheruser',
          email: 'other@example.com',
          password: 'password123',
        });

      const otherToken = otherUserResponse.body.data.token;

      const response = await request(app)
        .put(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Updated Room' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/rooms/:id', () => {
    let roomId;

    beforeEach(async () => {
      const room = await Room.create({
        name: 'Test Room',
        description: 'Test description',
        host: userId,
        category: 'general',
      });
      roomId = room._id;
    });

    test('should delete room as host', async () => {
      const response = await request(app)
        .delete(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify room is deleted
      const deletedRoom = await Room.findById(roomId);
      expect(deletedRoom).toBeNull();
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/rooms/${roomId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail when not host', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'otheruser',
          email: 'other@example.com',
          password: 'password123',
        });

      const otherToken = otherUserResponse.body.data.token;

      const response = await request(app)
        .delete(`/api/rooms/${roomId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/rooms/:id/join', () => {
    let roomId;

    beforeEach(async () => {
      const room = await Room.create({
        name: 'Test Room',
        description: 'Test description',
        host: userId,
        category: 'general',
      });
      roomId = room._id;
    });

    test('should join room', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.room.participants).toContain(userId);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/join`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/rooms/:id/leave', () => {
    let roomId;

    beforeEach(async () => {
      const room = await Room.create({
        name: 'Test Room',
        description: 'Test description',
        host: userId,
        category: 'general',
        participants: [userId],
      });
      roomId = room._id;
    });

    test('should leave room', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/leave`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.room.participants).not.toContain(userId);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/rooms/${roomId}/leave`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
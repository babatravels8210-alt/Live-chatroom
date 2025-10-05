const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const User = require('../../../models/User');

describe('Authentication API Tests', () => {
  let server;

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
    await mongoose.connection.close();
    await server.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    test('should fail with invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should fail with short password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    test('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail without credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeEach(async () => {
      // Register and login to get token
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      authToken = response.body.data.token;
    });

    test('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    test('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/update-profile', () => {
    let authToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      authToken = response.body.data.token;
    });

    test('should update user profile', async () => {
      const response = await request(app)
        .put('/api/auth/update-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          displayName: 'Updated Name',
          bio: 'Updated bio',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.displayName).toBe('Updated Name');
      expect(response.body.data.user.bio).toBe('Updated bio');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/update-profile')
        .send({
          displayName: 'Updated Name',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    let authToken;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      authToken = response.body.data.token;
    });

    test('should change password with valid current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Try logging in with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newpassword123',
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    test('should fail with incorrect current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
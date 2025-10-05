const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../server');
const User = require('../../../models/User');

describe('User Model Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_DB_URI || 'mongodb://localhost:27017/livechatroom-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    test('should create a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.displayName).toBe(userData.displayName);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    test('should fail to create user without required fields', async () => {
      const user = new User({
        username: 'testuser',
      });

      let error;
      try {
        await user.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('should fail to create user with duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123',
      };

      await User.create(userData);

      const duplicateUser = new User({
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123',
      });

      let error;
      try {
        await duplicateUser.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // Duplicate key error
    });
  });

  describe('User Authentication', () => {
    test('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20);
    });

    test('should validate correct password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      const isValid = await user.comparePassword('password123');
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      const isValid = await user.comparePassword('wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  describe('User Profile', () => {
    test('should update user profile', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      user.displayName = 'Updated Name';
      user.bio = 'Test bio';
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.displayName).toBe('Updated Name');
      expect(updatedUser.bio).toBe('Test bio');
    });

    test('should track last login', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const beforeLogin = new Date();
      user.lastLogin = new Date();
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.lastLogin).toBeDefined();
      expect(updatedUser.lastLogin.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    });
  });

  describe('User Deletion', () => {
    test('should delete user', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      await User.findByIdAndDelete(user._id);
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });
  });
});
const mongoose = require('mongoose');
const redis = require('redis');

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/achat-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Continuing without database connection for demo purposes');
    // Don't exit in development/demo mode
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Redis connection
let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection error:', error.message);
    // Continue without Redis if connection fails
    return null;
  }
};

// Initialize Redis connection
connectRedis();

module.exports = { connectDB, redisClient };
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Environment check for production
const isProduction = process.env.NODE_ENV === 'production';

// Validate required environment variables in production
if (isProduction) {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('💡 Please set these in your Render dashboard → Environment');
    process.exit(1);
  }
}

// Request logging middleware for debugging
app.use((req, res, next) => {
  if (!isProduction) {
    console.log(`📡 ${req.method} ${req.url}`);
  }
  next();
});

// Middleware
// CORS configuration - Allow frontend to connect
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:9002', // Local development
      'http://localhost:3000', // Alternative local port
      'http://localhost:3001', // Admin panel local
      'https://cacsfinaccservices.com', // Production frontend
      'https://www.cacsfinaccservices.com', // Production frontend with www
      process.env.FRONTEND_URL, // Environment variable for frontend URL
    ].filter(Boolean); // Remove undefined values

    // Log CORS requests for debugging
    if (isProduction) {
      console.log(`🌐 CORS check - Origin: ${origin}, Allowed: ${allowedOrigins.join(', ')}`);
    }

    // Allow if origin is in allowed list, or if not in production (dev mode)
    if (allowedOrigins.includes(origin) || !isProduction) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      console.warn(`💡 Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection with retry logic for production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cacs';

if (!process.env.MONGODB_URI && isProduction) {
  console.error('❌ MONGODB_URI environment variable is required in production!');
  process.exit(1);
}

if (!process.env.MONGODB_URI && !isProduction) {
  console.warn('⚠️  Warning: MONGODB_URI environment variable not set. Using default local MongoDB.');
}

// MongoDB connection options for production
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (isProduction) {
      console.error('💡 Check your MONGODB_URI in Render dashboard → Environment');
      console.error('💡 Verify MongoDB Atlas network access allows Render IPs');
    } else {
      console.error('💡 Make sure MongoDB is running locally or set MONGODB_URI');
    }
    // In production, exit; in development, allow retry
    if (isProduction) {
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  if (isProduction) {
    setTimeout(() => connectDB(), 5000);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Initialize database connection
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/forms', require('./routes/forms'));

// Health check endpoint with database status
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    status: dbStatus === 1 ? 'OK' : 'WARNING',
    message: 'Server is running',
    database: dbStates[dbStatus] || 'unknown',
    environment: isProduction ? 'production' : 'development',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CACS Backend API is running',
    version: '1.0.0'
  });
});

// Catch-all route for undefined routes (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}. Please check the URL and method.`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Start server immediately (Render needs it for health checks)
// MongoDB connection happens asynchronously
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  if (isProduction) {
    console.log(`🔗 Backend URL: https://cacsfinac-backend.onrender.com`);
  }
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});


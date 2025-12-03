const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
// CORS configuration - Allow frontend to connect
const corsOptions = {
  origin: [
    'http://localhost:9002', // Local development
    'http://localhost:3000', // Alternative local port
    'https://cacsfinaccservices.com', // Production frontend
    'https://www.cacsfinaccservices.com', // Production frontend with www
    process.env.FRONTEND_URL, // Environment variable for frontend URL
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cacs';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  Warning: MONGODB_URI environment variable not set. Using default local MongoDB.');
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Make sure MONGODB_URI environment variable is set correctly');
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/forms', require('./routes/forms'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'CACS Backend API' });
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


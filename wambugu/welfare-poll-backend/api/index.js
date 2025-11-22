// Vercel Serverless Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Initialize express app
const app = express();

// Basic middleware - keep it simple for serverless
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welfare Poll API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      votes: '/api/votes',
      poll: '/api/poll',
      admin: '/api/admin'
    }
  });
});

// Import routes
const authRoutes = require('../src/routes/auth');
const voteRoutes = require('../src/routes/votes');
const pollRoutes = require('../src/routes/poll');
const adminRoutes = require('../src/routes/admin');
const passwordResetRoutes = require('../src/routes/passwordReset');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/password-reset', passwordResetRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Export for Vercel
module.exports = app;

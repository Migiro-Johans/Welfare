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

// Lazy-load routes to avoid initialization issues
app.use('/api/auth', (req, res, next) => {
  const authRoutes = require('../src/routes/auth');
  authRoutes(req, res, next);
});

app.use('/api/votes', (req, res, next) => {
  const voteRoutes = require('../src/routes/votes');
  voteRoutes(req, res, next);
});

app.use('/api/poll', (req, res, next) => {
  const pollRoutes = require('../src/routes/poll');
  pollRoutes(req, res, next);
});

app.use('/api/admin', (req, res, next) => {
  const adminRoutes = require('../src/routes/admin');
  adminRoutes(req, res, next);
});

app.use('/api/password-reset', (req, res, next) => {
  const passwordResetRoutes = require('../src/routes/passwordReset');
  passwordResetRoutes(req, res, next);
});

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

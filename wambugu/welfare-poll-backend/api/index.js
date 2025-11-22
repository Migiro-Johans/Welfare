require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { testConnection } = require('../src/config/database');
const { verifyEmailConfig } = require('../src/config/email');
const { errorHandler, notFound } = require('../src/middleware/errorHandler');
const { generalLimiter } = require('../src/middleware/rateLimiter');

// Simple console logger for serverless
const logger = {
  info: (msg, ...args) => console.log('[INFO]', msg, ...args),
  error: (msg, ...args) => console.error('[ERROR]', msg, ...args),
  warn: (msg, ...args) => console.warn('[WARN]', msg, ...args)
};

// Import routes
const authRoutes = require('../src/routes/auth');
const voteRoutes = require('../src/routes/votes');
const pollRoutes = require('../src/routes/poll');
const adminRoutes = require('../src/routes/admin');
const passwordResetRoutes = require('../src/routes/passwordReset');

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));
app.use(generalLimiter);

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/password-reset', passwordResetRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize database connection on cold start
let isInitialized = false;

const initializeApp = async () => {
  if (isInitialized) return;

  try {
    // Test database connection
    await testConnection();

    // Verify email configuration (non-blocking)
    verifyEmailConfig().catch(err =>
      logger.warn('Email verification failed:', err.message)
    );

    isInitialized = true;
    logger.info('Serverless function initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize serverless function:', error);
    // Don't throw - allow the function to try serving requests
  }
};

// Initialize on import
initializeApp();

// Export for Vercel serverless
module.exports = app;

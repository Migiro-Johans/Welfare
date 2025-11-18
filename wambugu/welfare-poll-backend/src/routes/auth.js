const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRequest, registrationSchema, loginSchema } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, validateRequest(registrationSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);

// Protected routes
router.use(authenticate);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/logout', authController.logout);

module.exports = router;

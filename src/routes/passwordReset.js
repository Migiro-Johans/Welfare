const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

// Public routes (no authentication required)
router.post('/request', passwordResetController.requestPasswordReset);
router.post('/reset', passwordResetController.resetPasswordWithToken);

module.exports = router;

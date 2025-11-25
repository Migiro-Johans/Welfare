const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const passwordResetController = require('../controllers/passwordResetController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validateRequest, pollSettingsSchema } = require('../middleware/validation');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Vote management
router.get('/votes', adminController.getAllVotes);
router.get('/analytics', adminController.getAnalytics);
router.delete('/votes/reset', adminController.resetVotes);

// Poll management
router.patch('/poll-status', adminController.updatePollStatus);
router.put('/poll-settings', validateRequest(pollSettingsSchema), adminController.updatePollSettings);

// Export
router.get('/export/votes', adminController.exportVotes);

// Members
router.get('/members', adminController.getAllMembers);

// Notifications
router.post('/notifications', adminController.sendNotifications);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Password reset (admin only)
router.post('/reset-password', passwordResetController.adminResetPassword);
router.post('/generate-temp-password', passwordResetController.adminGenerateTemporaryPassword);

module.exports = router;

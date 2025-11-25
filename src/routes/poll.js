const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');

// Public routes
router.get('/settings', pollController.getPollSettings);
router.get('/status', pollController.getPollStatus);
router.get('/statistics', pollController.getPollStatistics);

module.exports = router;

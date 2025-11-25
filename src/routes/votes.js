const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { authenticate } = require('../middleware/auth');
const { validateRequest, voteSchema } = require('../middleware/validation');
const { voteLimiter } = require('../middleware/rateLimiter');

// Public route
router.get('/results', voteController.results);

// Protected routes
router.use(authenticate);
router.post('/', voteLimiter, validateRequest(voteSchema), voteController.vote);
router.get('/my-vote', voteController.myVote);

module.exports = router;

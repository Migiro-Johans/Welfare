const socketIO = require('socket.io');
const { getResults } = require('../services/voteService');
const logger = require('../utils/logger');

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Send current results on connection
    getResults()
      .then(results => {
        socket.emit('voteResults', results);
      })
      .catch(error => {
        logger.error('Error sending initial results:', error);
      });

    // Handle request for results
    socket.on('requestResults', async () => {
      try {
        const results = await getResults();
        socket.emit('voteResults', results);
      } catch (error) {
        logger.error('Error fetching results:', error);
        socket.emit('error', { message: 'Failed to fetch results' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = { initializeSocket };

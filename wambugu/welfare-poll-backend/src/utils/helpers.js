const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress;
};

const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return parseFloat(((part / total) * 100).toFixed(2));
};

const formatDate = (date) => {
  return new Date(date).toISOString();
};

module.exports = {
  getClientIp,
  getUserAgent,
  calculatePercentage,
  formatDate
};

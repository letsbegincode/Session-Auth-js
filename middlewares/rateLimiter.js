const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 10000, // adj time
  max: 5, 
  message: 'Too many login attempts, please try again later',
});

module.exports = loginLimiter;

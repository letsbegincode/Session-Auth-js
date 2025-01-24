const rateLimit = require('express-rate-limit');
const LOGIN_LIMIT = parseInt(process.env.LOGIN_LIMIT, 10);
const API_REQ_LIMIT_TIME = parseInt(process.env.API_REQ_LIMIT_TIME, 10);

// Define the rate limiter
const loginLimiter = rateLimit({
  windowMs: API_REQ_LIMIT_TIME, 
  max: LOGIN_LIMIT, 
  message: {
    status: 429,
    message: 'Too many login attempts from this IP. Please try again after 1 minute.',
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

module.exports = loginLimiter;

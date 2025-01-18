const express = require('express');
const { login, logout, register } = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const loginLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', register);                // Registration API
router.post('/login', loginLimiter, login);        // Login API
router.post('/logout', requireAuth, logout);       // Logout API

// Dummy API that requires admin role
router.get('/data', requireAuth, requireRole('admin'), (req, res) => {
  res.send('This is sensitive admin data, accessible only to admins.');
});

module.exports = router;

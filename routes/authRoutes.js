// Routes: Authentication and Data Access
// This file defines routes for user authentication and role-based data access.

const express = require('express');
const {
  signup,
  login,
  logout,
  renew,
  reset,
  profile
} = require('../controllers/authController'); // Authentication controllers

const {
  protect,
  restrictTo,
  isAuthenticated,
} = require('../middlewares/authMiddleware'); // Authentication middlewares

const loginLimiter = require('../middlewares/rateLimiter'); // Rate limiter middleware

const {
  checkSessionExpiration,
  renewSession,
} = require('../middlewares/sessionMiddleware'); // Session management middlewares

const {
  getAdminData,
  getPublicData,
} = require('../controllers/dataController'); // Data controllers


const router = express.Router();

/**
 * Authentication Routes:
 * - User registration, login, logout, session renewal, and password reset.
 */
router.post('/signup', signup); // User signup
router.post('/login', loginLimiter, login); // User login with rate limiter
router.post('/logout', logout); // User logout
router.post('/renew', isAuthenticated, renewSession); // Renew session for authenticated users
router.post('/reset', isAuthenticated, reset); // Reset password (authenticated users)

// /**
//  * Data Access Routes:
//  * - Protected and public data access based on user roles.
//  */
router.get('/data', protect, restrictTo('admin'), getAdminData); // Admin-only data
router.get('/public', getPublicData); // Publicly accessible data

router.get('/profile', profile);

// Export the router for use in the main app
module.exports = router;


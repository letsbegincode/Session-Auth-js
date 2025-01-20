const express = require('express');
const { signup, login, logout } = require('../controllers/authController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { getAdminData, getPublicData } = require('../controllers/dataController');

const router = express.Router();

// Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Data routes
router.get('/data', protect, restrictTo('admin'), getAdminData);
router.get('/public', getPublicData); 
module.exports = router;


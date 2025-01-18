const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Session routes
router.post('/login', sessionController.login);
router.get('/logout', sessionController.logout);
router.get('/check', sessionController.checkSession);

module.exports = router;

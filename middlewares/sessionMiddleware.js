// const User = require('../models/User');
const COOKIE_TIME = parseInt(process.env.MAX_AGE, 10);

exports.checkSessionExpiration = (req, res, next) => {
  try {
    if (!req.session || !req.session.cookie || !req.session.cookie.expires) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    const now = Date.now();
    const remainingTime = req.session.cookie.expires - now;

    if (remainingTime > 0 && remainingTime <= 2 * 60 * 1000) {
      return res.status(200).json({ message: 'Your session is about to expire. Would you like to renew it?' });
    }
    next();

  } catch (error) {
    console.error('Error checking session expiration:', error);
    res.status(500).json({ message: 'An error occurred while checking session expiration.', error: error.message });
  }
};


exports.renewSession = async (req, res) => {
  try {
    // Step 1: Ensure the user is logged in (session data should exist)
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ message: 'You must be logged in to renew your session.' });
    }

    // Step 2: Store the user data temporarily before regenerating the session
    const userData = req.session.user;

    // Step 3: Regenerate the session ID to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        console.error('Error regenerating session ID:', err);
        return res.status(500).json({ message: 'Error regenerating session ID.' });
      }

      // Step 4: Ensure user data is retained in the new session
      req.session.user = userData; // Reassign user data to the new session

      // Step 5: Send a success response with the new session ID
      res.status(200).json({
        message: 'Session successfully renewed.',
        sessionId: req.session.id, // Return the new session ID to the client
      });
    });
  } catch (error) {
    console.error('Error during session renewal:', error);
    res.status(500).json({ message: 'An error occurred while renewing your session.', error: error.message });
  }
};


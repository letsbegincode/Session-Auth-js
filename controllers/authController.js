const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Session = mongoose.connection.collection('sessions');
const PROFILE_LOCK_TIME = parseInt(process.env.PROFILE_LOCK_TIME, 10);

// Register a user and create a session
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate and assign the role
    const validRoles = ['user', 'admin'];
    const assignedRole = role && validRoles.includes(role) ? role : 'user';

    // Check if the user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists. Please use a different email or username.',
      });
    }

    // Create the user
    const user = await User.create({ username, email, password, role: assignedRole });

    // Set session data in req.session
    req.session.user = {
      id: user._id.toString(),
      role: user.role, 
    };

    // Send success response
    res.status(201).json({
      message: 'User registered successfully and session started',
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login a user with session-based authentication
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if user account is locked
    if (user.isLocked()) {
      return res.status(403).json({ message: 'Account is locked. Try again later.' });
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + PROFILE_LOCK_TIME);
      }

      await user.save();
      return res.status(401).json({
        message: user.isLocked()
          ? 'Too many failed login attempts. Account is locked for 1 minute.'
          : 'Invalid username or password.',
      });
    }

    // Reset login attempts and lock time on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Enforce a single-session policy by querying the session store
    const activeSession = await Session.findOne({ 'session.user.id': user._id.toString() });

    let flag = null; // Initialize flag
    if (activeSession) {
      // Delete the existing session if found
      await Session.deleteOne({ _id: activeSession._id });
      flag = "session-updated"; // Set flag to indicate session was updated
      console.log(`Existing session for user ${user._id} deleted`);
    }

    // Set session data for the new session after successful login
    req.session.user = {
      id: user._id.toString(),
      role: user.role, 
    };

    // Attempt to save the session before sending the response
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving session', error: err.message });
      }

      // Send a success response only after session is saved
      res.status(200).json({
        message: `Login successful ${flag ? flag : ""}`, // Corrected string interpolation
        sessionId: req.session.id,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
};

// Logout a user
exports.logout = (req, res) => {
  try {
    // Check if the session exists
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No active session found' });
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Failed to log out. Please try again later.' });
      }

      // Ensure the session cookie is cleared
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure in production
        sameSite: 'lax',
      });

      // Send logout success response
      res.status(200).json({ message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    res.status(500).json({ message: 'An error occurred during logout', error: error.message });
  }
};

// Reset password function
exports.reset = async (req, res) => {
  try {
    const { username, newPassword, confirmPassword } = req.body;

    // Validate input fields
    if (!username || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Username and both password fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Ensure the user has an active session and valid user data
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Please log in to reset your password.' });
    }

    // Retrieve the user from the database using the session user ID
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found or session is invalid. Please log in again.' });
    }

    // Check if the username from the request matches the session user
    if (user.username !== username) {
      return res.status(401).json({ message: 'User session mismatch. Please log in again.' });
    }

    // Check if the user's profile is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(403).json({ message: 'Account is locked. Password reset is not allowed at this time.' });
    }

    // Ensure new password meets security criteria
    // if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    //   return res.status(400).json({
    //     message: 'Password must be at least 8 characters long and include at least one uppercase letter and one number.',
    //   });
    // }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.session.user.id, {
      password: hashedPassword,
      loginAttempts: 0,
      lockUntil: null
    });

    req.session.user = {
      id: user._id.toString(),
      role: user.role, 
    };


    // Send success response
    res.status(200).json({ message: 'Password has been reset successfully. Please log in again.' });
  } catch (error) {
    console.error('Error in reset password function:', error);
    res.status(500).json({ message: 'An error occurred while resetting the password.' });
  }
};

exports.profile = (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);  // Access user data from the session
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
}
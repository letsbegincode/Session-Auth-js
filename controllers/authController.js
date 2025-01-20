const User = require('../models/User');

// Register a user and create a session
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const validRoles = ['user', 'admin'];
    const assignedRole = role && validRoles.includes(role) ? role : 'user';
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists. Please use a different email or username.',
      });
    }

    const user = await User.create({ username, email, password, role: assignedRole });
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      message: 'User registered successfully and session started',
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Login a user with session-based authentication
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isLocked()) return res.status(403).json({ error: 'Account is locked' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30000; // Lock time
      }
      await user.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed login attempts
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Save user details in session
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



// Logout a user
exports.logout = (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No active session found' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to log out. Please try again later.' });
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.status(200).json({ message: 'Logout successful' });
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during logout', error: error.message });
  }
};

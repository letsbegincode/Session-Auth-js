require('dotenv').config();
const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db');
const sessionStore = require('./config/sessionStore');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { maxAge: 10000, httpOnly: true }, // 1 hour
}));

// Routes
app.use('/session', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Joi = require('joi');

const app = express();
const saltRounds = 10;

// Middleware
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection failed:", err));

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Validation Schema using Joi
const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send("User already signed up.");

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ email, password: hashedPassword });

        await newUser.save();
        res.status(201).send("User signed up successfully.");
    } catch (err) {
        res.status(500).send("Error signing up.");
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send("User not found.");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send("Invalid credentials.");

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie("token", token, { httpOnly: true, secure: true });
        res.status(200).send("Login successful.");
    } catch (err) {
        res.status(500).send("Error during login.");
    }
});

// API Route (Protected)
app.get('/api', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Access denied. Please login.");

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).send(`Welcome ${verified.email}, you are authorized to access this information.`);
    } catch (err) {
        res.status(403).send("Invalid or expired token.");
    }
});

// Logout Route
app.post('/logout', (req, res) => {
    res.clearCookie("token");
    res.status(200).send("Logged out successfully.");
});

// Profile Route (Optional Enhancement)
app.get('/profile', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Access denied. Please login.");

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).send(`User Profile: ${JSON.stringify(verified)}`);
    } catch (err) {
        res.status(403).send("Invalid or expired token.");
    }
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const { configDotenv } = require('dotenv');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');

configDotenv();
app.use(cookieParser());
app.use(express.json());

// Utility function for hashing passwords
async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (err) {
        console.error(err);
        throw new Error('Error hashing password');
    }
}

// User object
const user = { name: "Dev", password: null };

// Initialize hashed password
async function initializeUser() {
    try {
        user.password = await hashPassword("myPassword");
        console.log("User password hashed and initialized.");
    } catch (err) {
        console.error("Error initializing user:", err.message);
    }
}

// Routes
app.get("/", function (req, res) {
    res.status(202).send("Welcome to the app!");
});

app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        // Compare input credentials with stored user details
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (name === user.name && isPasswordValid) {
            res.status(200).send({ message: 'Login successful', token: 'exampleToken123' });
        } else {
            res.status(401).send({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'An error occurred during login' });
    }
});

app.get("/api", (req, res) => {
    console.log(req.cookies.name);
    res.status(200).send("Cookie received");
});

// Start the server only after initializing the user
initializeUser().then(() => {
    app.listen(8080, () => {
        console.log("Server is running on port 8080");
    });
});

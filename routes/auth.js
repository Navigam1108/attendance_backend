// quickmark-auth-backend/routes/auth.js
const express = require('express');
const router = express.Router(); // Create an Express router instance
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for JWT creation
const pool = require('../config/db');
 // Import the PostgreSQL connection pool

require('dotenv').config(); // Load environment variables from .env

/**
 * @route POST /api/auth/register
 * @desc Register a new user with email and password
 * @access Public (no authentication required)
 */
router.post('/register', async (req, res) => {
    // Extract email, password, name, and optional role from the request body
    const { email, password, name, role = 'student' } = req.body; // Default role to 'student'

    // --- Basic Input Validation ---
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        // --- Check for Existing User ---
        // Query the database to see if a user with this email already exists
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists' }); // 409 Conflict
        }

        // --- Hash Password ---
        // Generate a salt and hash the user's password securely
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

        // --- Insert New User into Database ---
        // Insert the new user's details (email, hashed password, name, role) into the 'users' table
        // RETURNING clause gets the inserted row's data back
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
            [email, hashedPassword, name || null, role] // Use null if name is not provided
        );
        const newUser = result.rows[0]; // Get the data of the newly created user

        // --- Generate JWT ---
        // Create a JSON Web Token (JWT) containing basic user info (id, email, role)
        const token = jwt.sign(
            { id: newUser.id, username: newUser.email, role: newUser.role },
            process.env.JWT_SECRET, // Your secret key for signing tokens (from .env)
            { expiresIn: '1h' } // Token will expire in 1 hour
        );

        // --- Send Response ---
        // Respond with a 201 Created status, a success message, the JWT, and basic user info
        res.status(201).json({
            message: 'User registered successfully',
            token, // Send the JWT to the client
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Error during user registration:', error.message);
        res.status(500).json({ message: 'Internal server error during registration' });
    }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get JWT
 * @access Public (no authentication required)
 */
router.post('/login', async (req, res) => {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // --- Basic Input Validation ---
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // --- Retrieve User from Database ---
        // Query the database to find the user by their email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        // If no user is found with that email
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // --- Compare Passwords ---
        // Use bcrypt to compare the provided password with the hashed password from the database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Passwords do not match
        }

        // --- Generate JWT ---
        // If credentials are valid, generate a new JWT for the authenticated user
        const token = jwt.sign(
            { id: user.id, username: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // --- Send Response ---
        // Respond with a success message, the JWT, and basic user information
        res.json({
            message: 'Logged in successfully',
            token, // Send the JWT to the client
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error during user login:', error.message);
        res.status(500).json({ message: 'Internal server error during login' });
    }
});

module.exports = router; // Export the router to be used in server.js
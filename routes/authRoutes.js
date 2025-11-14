// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController'); // Import both functions

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', registerUser);

// @desc    Authenticate a user (login)
// @route   POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;
const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');

// Define the route for user registration
// This corresponds to the URL: POST http://localhost:5000/api/auth/register
router.post('/register', registerUser);

module.exports = router;
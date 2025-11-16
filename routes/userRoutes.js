// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getMyProfile } = require('../controllers/userController');
const { protectFirebase } = require('../middleware/firebaseAuthMiddleware');

// This route will be used by the shared Header component
router.route('/me').get(protectFirebase, getMyProfile);

module.exports = router;
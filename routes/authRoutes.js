// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { syncUser } = require('../controllers/authController');

// 1. Import our new, more flexible middleware
const { verifyFirebaseToken } = require('../middleware/verifyFirebaseToken');

// 2. Update the /sync route to accept both GET and POST, and use the new middleware
router.route('/sync')
  .get(verifyFirebaseToken, syncUser)
  .post(verifyFirebaseToken, syncUser);

// Remove any other old routes if they are not needed.

module.exports = router;
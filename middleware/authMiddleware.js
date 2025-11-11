const admin = require('firebase-admin');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer <token>" -> "<token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token with Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Find the user in our MongoDB database using the firebaseUid from the token
      // We exclude the password if we ever add one to the model
      req.user = await User.findOne({ firebaseUid: decodedToken.uid });

      if (!req.user) {
        return res.status(401).json({ message: 'User not found in database.' });
      }

      // Move to the next function (the actual controller)
      next();
    } catch (error) {
      console.error('Authentication Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
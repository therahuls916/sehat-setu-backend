// middleware/firebaseAuthMiddleware.js
const admin = require('firebase-admin');
const User = require('../models/userModel');

const protectFirebase = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token with Firebase
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Find the user in your MongoDB database using the Firebase UID
      req.user = await User.findOne({ firebaseUid: decodedToken.uid }).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found in our database.' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protectFirebase };
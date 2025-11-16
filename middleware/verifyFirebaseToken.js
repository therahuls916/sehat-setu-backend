// backend/middleware/verifyFirebaseToken.js
const admin = require('firebase-admin');

const verifyFirebaseToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token with Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Attach the decoded token to the request object
      // The controller will now have access to the firebaseUid via req.user.uid
      req.user = decodedToken;

      next();
    } catch (error) {
      console.error('Error while verifying Firebase token:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { verifyFirebaseToken };
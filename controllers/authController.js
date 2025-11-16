// Updated: backend/controllers/authController.js
const User = require('../models/userModel');

/**
 * @desc    Finds an existing user by Firebase UID or creates a new one.
 *          Handles both GET and POST requests. Also saves FCM token for notifications.
 * @route   GET /api/auth/sync, POST /api/auth/sync
 * @access  Private (Firebase token verified)
 */
const syncUser = async (req, res, next) => {
  const { uid, email } = req.user;
  // Destructure the new fcmToken field from the request body
  const { name, role, specialization, fcmToken } = req.body || {};

  try {
    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      // --- SAFE ADDITION START ---
      // If the patient's app sends an FCM token during login, update it in the database.
      // This won't run for web users who don't send this field.
      if (fcmToken) {
        user.fcmToken = fcmToken;
        await user.save();
      }
      // --- SAFE ADDITION END ---
      
      return res.status(200).json(user.toObject());
    }

    // This logic is now primarily for registration or the very first login sync.
    if (!name || !role) {
      return res.status(400).json({ message: 'Name and role are required for new user synchronization.' });
    }
    
    const newUser = new User({
      firebaseUid: uid,
      email: email,
      name: name,
      role: role,
      ...(specialization && { specialization: specialization }),
      // Conditionally add the FCM token if it's provided during registration
      ...(fcmToken && { fcmToken: fcmToken }),
    });

    const savedUser = await newUser.save();

    res.status(201).json(savedUser.toObject());

  } catch (error) {
    next(error); 
  }
};


module.exports = {
  syncUser,
};
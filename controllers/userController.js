// Updated: backend/controllers/userController.js
const User = require('../models/userModel');

/**
 * @desc    Get the profile of the currently logged-in user (works for any role)
 * @route   GET /api/users/me
 * @access  Private
 */
const getMyProfile = async (req, res, next) => { // <-- Added 'next'
  try {
    const userProfile = req.user;

    if (!userProfile) {
        return res.status(404).json({ message: 'User profile not found.' });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    // Pass any unexpected errors to the global handler
    next(error);
  }
};

module.exports = {
  getMyProfile,
};
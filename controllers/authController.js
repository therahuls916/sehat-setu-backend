const User = require('../models/userModel');

/**
 * @desc    Register a new user in the database
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  // We will get user details from the request body
  const { firebaseUid, email, name, role } = req.body;

  // Basic validation
  if (!firebaseUid || !email || !name || !role) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if the user already exists in our database
    const userExists = await User.findOne({ firebaseUid });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user in the database
    const user = await User.create({
      firebaseUid,
      email,
      name,
      role,
    });

    if (user) {
      // If user created successfully, send back the user's data
      res.status(201).json({
        _id: user._id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = {
  registerUser,
};
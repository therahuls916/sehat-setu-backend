// Updated: backend/controllers/authController.js
const User = require('../models/userModel');

const syncUser = async (req, res, next) => {
  const { uid, email } = req.user;
  const { name, role, specialization, fcmToken } = req.body || {};

  try {
    let user = await User.findOne({ firebaseUid: uid });

    // 1. IF USER EXISTS (LOGIN)
    if (user) {
      if (fcmToken) {
        user.fcmToken = fcmToken;
        
        // Fix: Remove invalid location data if it exists on an existing user
        if (user.location && user.location.type === 'Point' && (!user.location.coordinates || user.location.coordinates.length === 0)) {
            user.location = undefined;
        }
        
        await user.save();
      }
      return res.status(200).json(user.toObject());
    }

    // 2. IF USER DOES NOT EXIST (REGISTRATION)
    if (!name || !role) {
      return res.status(400).json({ message: 'Name and role are required for new user synchronization.' });
    }
    
    const newUser = new User({
      firebaseUid: uid,
      email: email,
      name: name,
      role: role,
      // THE FIX: Explicitly set location to undefined to prevent "Point" default error
      location: undefined, 
      ...(specialization && { specialization: specialization }),
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
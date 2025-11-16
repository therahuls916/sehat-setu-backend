const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Essential field from Firebase Authentication
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // Role determines what the user can do in the system
    role: {
      type: String,
      required: true,
      enum: ['patient', 'doctor', 'pharmacy'], // Only allows these 3 values
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },

    // --- NEW FIELDS FOR PATIENT APP ---
    // For Doctor online/offline status
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    // For Firebase Cloud Messaging (Push Notifications)
    fcmToken: {
      type: String,
    },
    // For extended patient profile
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    
    // --- Role-specific fields ---
    specialization: {
      type: String, // Only for doctors
    },
    linkedPharmacies: [
      {
        type: mongoose.Schema.Types.ObjectId, // Only for doctors
        ref: 'Pharmacy',
      },
    ],
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
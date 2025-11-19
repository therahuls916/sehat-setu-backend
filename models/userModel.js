const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // --- CORE FIELDS (No Changes) ---
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
    role: {
      type: String,
      required: true,
      enum: ['patient', 'doctor', 'pharmacy'],
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
    fcmToken: { // For Push Notifications
      type: String,
    },

    // --- ENHANCED PATIENT-SPECIFIC FIELDS ---
    profilePictureUrl: {
      type: String, // Can be used by both patients and doctors
    },
    dateOfBirth: {
      type: Date, // A better field than 'age' for patients
    },
    gender: {
      type: String, // For patient profile
    },
    bloodGroup: {
      type: String, // For patient profile
    },
    medicalConditions: {
      type: [String], // For patient profile (e.g., ['Hypertension', 'Asthma'])
    },
    allergies: {
      type: [String], // For patient profile (e.g., ['Penicillin', 'Peanuts'])
    },
    currentMedications: {
      type: [String], // For patient profile
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
    },
    
    // --- ENHANCED DOCTOR-SPECIFIC FIELDS ---
    specialization: {
      type: String, // Only for doctors
    },
    about: {
      type: String, // For doctor's detailed profile
    },
    services: {
      type: [String], // For doctor's profile (e.g., ['ECG', 'Angiography'])
    },
    consultationFee: {
      firstVisit: { type: Number },
      followUp: { type: Number },
    },
    timings: [{
      day: { type: String }, // e.g., "Mon - Sat"
      time: { type: String }, // e.g., "10:00 AM - 06:00 PM"
    }],
    location: { // For geospatial queries to find nearby doctors
      type: {
        type: String,
        enum: ['Point'],
       // default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: { // For Doctor online/offline status
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    linkedPharmacies: [{ // Existing field for doctors
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
    }],
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for location-based queries if it doesn't exist
userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

module.exports = User;
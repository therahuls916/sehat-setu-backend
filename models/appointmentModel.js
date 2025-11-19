const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This links to the User model
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This also links to the User model
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    // --- NEW FIELD ---
    appointmentTime: { // To store the specific time slot, e.g., "10:30 AM"
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      // --- ENHANCED ENUM ---
      enum: ['pending', 'accepted', 'rejected', 'completed', 'canceled'], // Added 'canceled'
      default: 'pending',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
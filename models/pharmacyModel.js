const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    // The user who owns/manages this pharmacy profile
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a pharmacy name'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    // For geo-location queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere', // Important for geospatial queries
      },
    },
    workingHours: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

module.exports = Pharmacy;
const express = require('express');
const router = express.Router();
const {
  addOrUpdateStock,
  createPharmacyProfile,
  getIncomingPrescriptions, // <-- Import new function
} = require('../controllers/pharmacyController');
const { protect } = require('../middleware/authMiddleware');

// Profile and Stock routes
router.route('/profile').post(protect, createPharmacyProfile);
router.route('/stock').post(protect, addOrUpdateStock);

// Prescription route
router.route('/prescriptions').get(protect, getIncomingPrescriptions);

module.exports = router;
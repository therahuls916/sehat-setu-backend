const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getMyPrescriptions, // <-- Import new function
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

// Appointment routes
router
  .route('/appointments')
  .post(protect, bookAppointment)
  .get(protect, getMyAppointments);

// Prescription route
router.route('/prescriptions').get(protect, getMyPrescriptions);

module.exports = router;
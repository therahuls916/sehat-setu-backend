const express = require('express');
const router = express.Router();
const {
  getDoctorAppointments,
  updateAppointmentStatus,
  createPrescription, // <-- Import new function
} = require('../controllers/doctorController');
const { protect } = require('../middleware/firebaseAuthMiddleware');

// --- Appointment Routes ---
router.route('/appointments').get(protect, getDoctorAppointments);
router.route('/appointments/:id').put(protect, updateAppointmentStatus);

// --- Prescription Route ---
router.route('/prescriptions').post(protect, createPrescription);

module.exports = router;
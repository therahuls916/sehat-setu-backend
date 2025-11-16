// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();

const {
  getAcceptedPatients,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  createPrescription,
  getDashboardStats,
  updateDoctorStatus, // <-- 1. Import the new function
} = require('../controllers/doctorController');

const { protectFirebase } = require('../middleware/firebaseAuthMiddleware');

// --- Profile Route ---
router
  .route('/profile')
  .get(protectFirebase, getDoctorProfile)
  .put(protectFirebase, updateDoctorProfile);

// --- New Route for Doctor Status (for Patient App) ---
router.route('/status').put(protectFirebase, updateDoctorStatus); // <-- 2. Add the new route

// --- Route to get patients with accepted appointments ---
router.route('/patients').get(protectFirebase, getAcceptedPatients);

// --- Appointment Routes ---
router.route('/appointments').get(protectFirebase, getDoctorAppointments);
router.route('/appointments/:id').put(protectFirebase, updateAppointmentStatus);

// --- Prescription Route ---
router.route('/prescriptions').post(protectFirebase, createPrescription);

// --- Stats Route ---
router.route('/stats').get(protectFirebase, getDashboardStats);

module.exports = router;
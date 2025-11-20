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
  updateDoctorStatus,
  getPatientHistory,
  getPharmacyStockForDoctor, // <--- THIS WAS MISSING
} = require('../controllers/doctorController');

const { protectFirebase } = require('../middleware/firebaseAuthMiddleware');

// --- Profile Route ---
router
  .route('/profile')
  .get(protectFirebase, getDoctorProfile)
  .put(protectFirebase, updateDoctorProfile);

// --- New Route for Doctor Status (for Patient App) ---
router.route('/status').put(protectFirebase, updateDoctorStatus);

// --- Route to get patients with accepted appointments ---
router.route('/patients').get(protectFirebase, getAcceptedPatients);

// --- Appointment Routes ---
router.route('/appointments').get(protectFirebase, getDoctorAppointments);
router.route('/appointments/:id').put(protectFirebase, updateAppointmentStatus);

// --- Prescription Route ---
router.route('/prescriptions').post(protectFirebase, createPrescription);

// --- Stats Route ---
router.route('/stats').get(protectFirebase, getDashboardStats);
router.route('/history').get(protectFirebase, getPatientHistory);

// --- Pharmacy Stock Route ---
router.route('/pharmacy/:id/stock').get(protectFirebase, getPharmacyStockForDoctor);

module.exports = router;
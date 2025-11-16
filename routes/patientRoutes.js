// Updated: backend/routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getMyPrescriptions,
  getDoctorsList,       // <-- 1. Import new controller
  updatePatientProfile, // <-- 1. Import new controller
  downloadPrescription, // <-- 1. Import new controller
} = require('../controllers/patientController');

const { protectFirebase } = require('../middleware/firebaseAuthMiddleware');

// --- Doctor List Route (for Patient Home Screen) ---
router.route('/doctors').get(protectFirebase, getDoctorsList); // <-- 2. Add new route

// --- Patient Profile Route ---
router.route('/profile').put(protectFirebase, updatePatientProfile); // <-- 2. Add new route

// --- Appointment Routes ---
router
  .route('/appointments')
  .post(protectFirebase, bookAppointment)
  .get(protectFirebase, getMyAppointments);

// --- Prescription Routes ---
router.route('/prescriptions').get(protectFirebase, getMyPrescriptions);
router.route('/prescriptions/:id/download').get(protectFirebase, downloadPrescription); // <-- 2. Add new route

module.exports = router;
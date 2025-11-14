// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();

const {
  getDoctorAppointments,
  updateAppointmentStatus,
  createPrescription,
} = require('../controllers/doctorController');

// --- THE FIX IS HERE ---
// Correctly import 'protectFirebase' instead of 'protect'
const { protectFirebase } = require('../middleware/firebaseAuthMiddleware');

// --- Appointment Routes ---
// Use the correctly imported 'protectFirebase' middleware
router.route('/appointments').get(protectFirebase, getDoctorAppointments);
router.route('/appointments/:id').put(protectFirebase, updateAppointmentStatus);

// --- Prescription Route ---
router.route('/prescriptions').post(protectFirebase, createPrescription);

module.exports = router;
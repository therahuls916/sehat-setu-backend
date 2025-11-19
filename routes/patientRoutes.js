// backend/routes/patientRoutes.js
const express = require('express');
const router = express.Router();

const {
  // Existing functions
  bookAppointment,
  getMyAppointments,
  getMyPrescriptions,
  updatePatientProfile,
  downloadPrescription,
  
  // --- NEWLY IMPORTED FUNCTIONS ---
  searchProviders,
  getProviderDetails,
  getMedicalDocuments,
  uploadMedicalDocument,
  deleteMedicalDocument,
} = require('../controllers/patientController');

const { protectFirebase } = require('../middleware/firebaseAuthMiddleware');


// --- NEW Provider & Search Routes ---
// Handles searching for doctors/clinics (replaces the old '/doctors' route)
router.route('/providers/search').get(protectFirebase, searchProviders);

// Handles getting the detailed public profile of a specific provider
router.route('/providers/:id').get(protectFirebase, getProviderDetails);


// --- NEW Medical Document Routes (Full CRUD) ---
router.route('/documents')
  .get(protectFirebase, getMedicalDocuments)      // GET all documents
  .post(protectFirebase, uploadMedicalDocument);   // POST (upload) a new document

router.route('/documents/:id')
  .delete(protectFirebase, deleteMedicalDocument); // DELETE a specific document


// --- EXISTING & UNCHANGED Routes ---

// Patient Profile Route
router.route('/profile').put(protectFirebase, updatePatientProfile);

// Appointment Routes
router.route('/appointments')
  .post(protectFirebase, bookAppointment)
  .get(protectFirebase, getMyAppointments);

// Prescription Routes
router.route('/prescriptions').get(protectFirebase, getMyPrescriptions);
router.route('/prescriptions/:id/download').get(protectFirebase, downloadPrescription);


module.exports = router;
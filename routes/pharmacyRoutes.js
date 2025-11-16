// routes/pharmacyRoutes.js
const express = require('express');
const router = express.Router();
const {
  updatePrescriptionStatus,
  getPharmacyProfile,
  updatePharmacyProfile,
  getProfileStatus,
  getStock,          // <-- Import new
  addStockItem,      // <-- Import new
  updateStockItem,   // <-- Import new
  deleteStockItem,   // <-- Import new
  getDashboardStats,
  getAllPharmacies,
  createPharmacyProfile,
  getIncomingPrescriptions,
} = require('../controllers/pharmacyController');
const { protectFirebase } = require('../middleware/firebaseAuthMiddleware');

// --- Stats Route ---
router.route('/stats').get(protectFirebase, getDashboardStats);

// --- Profile Routes ---
router.route('/profile/status').get(protectFirebase, getProfileStatus); 

// --- Profile Route ---
router.route('/profile')
  .get(protectFirebase, getPharmacyProfile)       // Get profile details
  .post(protectFirebase, createPharmacyProfile)   // Create a new profile
  .put(protectFirebase, updatePharmacyProfile);   // Update existing profile

// --- Stock Management Routes (Full CRUD) ---
router.route('/stock')
  .get(protectFirebase, getStock)       // GET all stock items
  .post(protectFirebase, addStockItem); // POST a new stock item

router.route('/stock/:id')
  .put(protectFirebase, updateStockItem)    // PUT (update) a specific stock item
  .delete(protectFirebase, deleteStockItem); // DELETE a specific stock item

// --- Prescription Route ---
router.route('/prescriptions').get(protectFirebase, getIncomingPrescriptions);

// --- Route to get a list of all pharmacies ---
router.route('/all').get(protectFirebase, getAllPharmacies);
router.route('/prescriptions/:id').put(protectFirebase, updatePrescriptionStatus);


module.exports = router;
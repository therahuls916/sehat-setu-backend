const Pharmacy = require('../models/pharmacyModel');
const Stock = require('../models/stockModel');
const Prescription = require('../models/prescriptionModel');

/**
 * @desc    Create a pharmacy profile
 * @route   POST /api/pharmacy/profile
 * @access  Private (Pharmacy owner only)
 */
const createPharmacyProfile = async (req, res) => {
  try {
    const profileExists = await Pharmacy.findOne({ ownerId: req.user._id });
    if (profileExists) {
      return res.status(400).json({ message: 'Pharmacy profile already exists for this user' });
    }
    const profile = new Pharmacy({ ...req.body, ownerId: req.user._id });
    const createdProfile = await profile.save();
    res.status(201).json(createdProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Add or update medicine stock for a pharmacy
 * @route   POST /api/pharmacy/stock
 * @access  Private (Pharmacy owner only)
 */
const addOrUpdateStock = async (req, res) => {
  const { medicineName, quantity, price, expiryDate } = req.body;
  try {
    const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy profile not found for this user. Please create one first.' });
    }
    let stockItem = await Stock.findOne({ pharmacyId: pharmacy._id, medicineName: medicineName });
    if (stockItem) {
      stockItem.quantity = quantity;
      stockItem.price = price;
      stockItem.expiryDate = expiryDate;
    } else {
      stockItem = new Stock({ pharmacyId: pharmacy._id, medicineName, quantity, price, expiryDate });
    }
    const updatedStockItem = await stockItem.save();
    res.status(200).json(updatedStockItem);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Get incoming prescriptions for a pharmacy
 * @route   GET /api/pharmacy/prescriptions
 * @access  Private (Pharmacy owner only)
 */
const getIncomingPrescriptions = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy profile not found for this user.' });
    }

    // Find prescriptions and populate with Patient and Doctor details
    const prescriptions = await Prescription.find({ pharmacyId: pharmacy._id })
      .populate('patientId', 'name email phone') // Populate patient details
      .populate('doctorId', 'name specialization'); // Populate doctor details

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = {
  createPharmacyProfile,
  addOrUpdateStock,
  getIncomingPrescriptions,
};
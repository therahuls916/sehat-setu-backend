// Updated: backend/controllers/pharmacyController.js
const Pharmacy = require('../models/pharmacyModel');
const Stock = require('../models/stockModel');
const Prescription = require('../models/prescriptionModel');

// --- NEW FUNCTION TO GET A PROFILE ---
const getPharmacyProfile = async (req, res, next) => {
    try {
        // We use .populate() to fetch the 'name' field from the referenced User document
        const profile = await Pharmacy.findOne({ ownerId: req.user._id })
            .populate('ownerId', 'name'); // This joins the user's name to the response

        if (!profile) {
            return res.status(404).json({ message: 'Pharmacy profile not found.' });
        }
        res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
};

const updatePrescriptionStatus = async (req, res, next) => {
    try {
        const { status, pharmacyNotes } = req.body;
        const prescriptionId = req.params.id;

        const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
        const prescription = await Prescription.findById(prescriptionId);

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found.' });
        }
        if (prescription.pharmacyId.toString() !== pharmacy._id.toString()) {
            return res.status(401).json({ message: 'Not authorized.' });
        }

        // --- LOGIC FOR STOCK DEDUCTION ---
        // Check if we are changing status TO 'dispensed' FROM something else
        if (status === 'dispensed' && prescription.status !== 'dispensed') {
            
            // Loop through each medicine in the prescription
            for (const med of prescription.medicines) {
                // Find the stock item (Case insensitive search)
                const stockItem = await Stock.findOne({ 
                    pharmacyId: pharmacy._id, 
                    medicineName: { $regex: new RegExp(`^${med.name}$`, 'i') } 
                });

                if (stockItem) {
                    // Deduct quantity, ensuring it doesn't go below 0
                    stockItem.quantity = Math.max(0, stockItem.quantity - (med.quantity || 1));
                    await stockItem.save();
                }
            }
        }
        // ---------------------------------

        prescription.status = status;
        if (pharmacyNotes) {
            prescription.pharmacyNotes = pharmacyNotes;
        }

        const updatedPrescription = await prescription.save();

        // ... (Keep your existing notification logic here) ...
        const { sendNotificationToUser } = require('../utils/notificationSender');
        if (status === 'ready_for_pickup') {
             await sendNotificationToUser(prescription.patientId, 'Medicines Ready 💊', `Your prescription from ${pharmacy.name} is ready for pickup.`);
        } else if (status === 'dispensed') {
            await sendNotificationToUser(prescription.patientId, 'Medicines Dispensed ✅', `Your medical prescription has been successfully dispensed.`);
        }

        res.status(200).json(updatedPrescription);

    } catch (error) {
        next(error);
    }
};

// --- NEW FUNCTION TO UPDATE A PROFILE ---
const updatePharmacyProfile = async (req, res, next) => {
    try {
        const profile = await Pharmacy.findOne({ ownerId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Pharmacy profile not found.' });
        }

        // Update fields from request body
        profile.address = req.body.address || profile.address;
        profile.phone = req.body.phone || profile.phone;

        // Update location coordinates if provided
        if (req.body.latitude && req.body.longitude) {
            profile.location = {
                type: 'Point',
                coordinates: [req.body.longitude, req.body.latitude]
            };
        }

        const updatedProfile = await profile.save();
        res.status(200).json(updatedProfile);
    } catch (error) {
        next(error);
    }
};

const getStock = async (req, res, next) => {
    try {
        const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy profile not found.' });
        }
        const stockItems = await Stock.find({ pharmacyId: pharmacy._id });
        res.status(200).json(stockItems);
    } catch (error) {
        next(error);
    }
};

const addStockItem = async (req, res, next) => {
    const { medicineName, quantity, price, expiryDate } = req.body;
    try {
        const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy profile not found.' });
        }
        const existingItem = await Stock.findOne({ pharmacyId: pharmacy._id, medicineName: medicineName });
        if (existingItem) {
            return res.status(400).json({ message: `Medicine '${medicineName}' already exists. Please update the existing entry.` });
        }
        const newStockItem = new Stock({
            pharmacyId: pharmacy._id,
            medicineName,
            quantity,
            price,
            expiryDate,
        });
        const savedItem = await newStockItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        next(error);
    }
};

const updateStockItem = async (req, res, next) => {
    try {
        const stockItem = await Stock.findById(req.params.id);
        if (!stockItem) {
            return res.status(404).json({ message: 'Stock item not found.' });
        }
        const { medicineName, quantity, price, expiryDate } = req.body;
        stockItem.medicineName = medicineName || stockItem.medicineName;
        stockItem.quantity = quantity !== undefined ? quantity : stockItem.quantity;
        stockItem.price = price !== undefined ? price : stockItem.price;
        stockItem.expiryDate = expiryDate || stockItem.expiryDate;
        const updatedItem = await stockItem.save();
        res.status(200).json(updatedItem);
    } catch (error) {
        next(error);
    }
};

const deleteStockItem = async (req, res, next) => {
    try {
        const stockItem = await Stock.findById(req.params.id);
        if (!stockItem) {
            return res.status(404).json({ message: 'Stock item not found.' });
        }
        await stockItem.deleteOne();
        res.status(200).json({ message: 'Stock item removed.' });
    } catch (error) {
        next(error);
    }
};

const getDashboardStats = async (req, res, next) => {
    try {
        const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
        if (!pharmacy) { return res.status(404).json({ message: 'Pharmacy profile not found.' }); }
        const pharmacyId = pharmacy._id;
        const totalMedicines = await Stock.countDocuments({ pharmacyId });
        const pendingPrescriptions = await Prescription.countDocuments({ pharmacyId, status: 'pending' });
        const outOfStock = await Stock.countDocuments({ pharmacyId, quantity: 0 });
        res.status(200).json({ totalMedicines, pendingPrescriptions, outOfStock });
    } catch (error) {
        next(error);
    }
};

const getAllPharmacies = async (req, res, next) => {
    try {
        const pharmacies = await Pharmacy.find({}).select('_id name');
        res.status(200).json(pharmacies);
    } catch (error) {
        next(error);
    }
};

const getProfileStatus = async (req, res, next) => {
    try {
        const profile = await Pharmacy.findOne({ ownerId: req.user._id }).select('_id');
        res.status(200).json({ hasProfile: !!profile });
    } catch (error) {
        next(error);
    }
};

const createPharmacyProfile = async (req, res, next) => {
    try {
        const profileExists = await Pharmacy.findOne({ ownerId: req.user._id });
        if (profileExists) {
            return res.status(400).json({ message: 'Pharmacy profile already exists.' });
        }

        const { name, address, phone, latitude, longitude } = req.body;
        const profileData = {
            name,
            address,
            phone,
            ownerId: req.user._id
        };

        if (latitude && longitude) {
            profileData.location = {
                type: 'Point',
                coordinates: [longitude, latitude]
            };
        }

        const profile = new Pharmacy(profileData);
        const createdProfile = await profile.save();
        res.status(201).json(createdProfile);
    } catch (error) {
        next(error);
    }
};

const getIncomingPrescriptions = async (req, res, next) => {
    try {
        const pharmacy = await Pharmacy.findOne({ ownerId: req.user._id });
        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy profile not found.' });
        }
        const prescriptions = await Prescription.find({ pharmacyId: pharmacy._id })
            .populate('patientId', 'name email phone')
            .populate('doctorId', 'name specialization');
        res.status(200).json(prescriptions);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updatePrescriptionStatus,
    getPharmacyProfile,
    updatePharmacyProfile,
    getProfileStatus,
    getStock,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    getDashboardStats,
    getAllPharmacies,
    createPharmacyProfile,
    getIncomingPrescriptions,
};
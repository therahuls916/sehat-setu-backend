// backend/controllers/patientController.js

// --- Existing Model Imports ---
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const Prescription = require('../models/prescriptionModel');
const Stock = require('../models/stockModel');
const PDFDocument = require('pdfkit');

// --- NEW MODEL IMPORTS ---
const Review = require('../models/reviewModel');
const MedicalDocument = require('../models/medicalDocumentModel');
const SupportTicket = require('../models/supportTicketModel');


// --- UPDATED EXISTING FUNCTIONS ---

/**
 * @desc    Book a new appointment with a doctor
 * @route   POST /api/patient/appointments
 * @access  Private
 */
const bookAppointment = async (req, res, next) => {
  // Destructure the new appointmentTime field from the body
  const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
  try {
    const patientId = req.user._id;

    // Add appointmentTime to the validation check
    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ message: 'Please provide all required fields: doctorId, appointmentDate, appointmentTime, and reason.' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime, // Save the new field
      reason,
    });

  // This ensures the Android app receives the 'name' and 'specialization' it expects.
    appointment = await appointment.populate('doctorId', 'name specialization profilePictureUrl');

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all appointments for the logged-in patient
 * @route   GET /api/patient/appointments
 * @access  Private
 */
const getMyAppointments = async (req, res, next) => {
  try {
    // Enhance populate to include more doctor details for the UI
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization profilePictureUrl')
      .sort({ appointmentDate: -1 }); // Sort by most recent first
      
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update the profile of the logged-in patient
 * @route   PUT /api/patient/profile
 * @access  Private
 */
const updatePatientProfile = async (req, res, next) => {
  try {
    const patient = await User.findById(req.user._id);

    if (patient) {
      // General Info
      patient.name = req.body.name || patient.name;
      patient.phone = req.body.phone || patient.phone;
      patient.address = req.body.address || patient.address;
      patient.profilePictureUrl = req.body.profilePictureUrl || patient.profilePictureUrl;
      
      // Personal & Health Details from the new UI
      patient.dateOfBirth = req.body.dateOfBirth || patient.dateOfBirth;
      patient.gender = req.body.gender || patient.gender;
      patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;
      
      // Use 'if' checks for arrays to allow them to be cleared if an empty array is passed
      if (req.body.medicalConditions) {
        patient.medicalConditions = req.body.medicalConditions;
      }
      if (req.body.allergies) {
        patient.allergies = req.body.allergies;
      }
      if (req.body.currentMedications) {
        patient.currentMedications = req.body.currentMedications;
      }
      if (req.body.emergencyContact) {
        patient.emergencyContact = req.body.emergencyContact;
      }

      const updatedPatient = await patient.save();
      res.status(200).json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    next(error);
  }
};


// --- COMPLETELY NEW FUNCTIONS TO SUPPORT NEW UI ---

/**
 * @desc    Search for providers (doctors, clinics)
 * @route   GET /api/patient/providers/search
 * @access  Private
 */
const searchProviders = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    // Basic search: find doctors whose name or specialization matches the query
    const searchCriteria = {
      role: 'doctor',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { specialization: { $regex: query, $options: 'i' } },
      ],
    };
    
    const doctors = await User.find(searchCriteria)
      .select('name specialization profilePictureUrl location rating reviewCount');

    res.status(200).json(doctors);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the detailed public profile of a single provider
 * @route   GET /api/patient/providers/:id
 * @access  Private
 */
const getProviderDetails = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.params.id).select(
      '-firebaseUid -fcmToken -linkedPharmacies' // Exclude private data
    );

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get medical documents for the logged-in patient
 * @route   GET /api/patient/documents
 * @access  Private
 */
const getMedicalDocuments = async (req, res, next) => {
    try {
        const documents = await MedicalDocument.find({ patientId: req.user._id })
            .sort({ uploadDate: -1 });
        res.status(200).json(documents);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Upload a new medical document
 * @route   POST /api/patient/documents
 * @access  Private
 */
const uploadMedicalDocument = async (req, res, next) => {
    try {
        const { documentName, documentType, documentUrl } = req.body;
        if (!documentName || !documentUrl) {
            return res.status(400).json({ message: 'documentName and documentUrl are required.' });
        }
        const newDoc = await MedicalDocument.create({
            patientId: req.user._id,
            documentName,
            documentType,
            documentUrl
        });
        res.status(201).json(newDoc);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a medical document
 * @route   DELETE /api/patient/documents/:id
 * @access  Private
 */
const deleteMedicalDocument = async (req, res, next) => {
    try {
        const document = await MedicalDocument.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }
        // Security check: ensure the document belongs to the logged-in patient
        if (document.patientId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this document.' });
        }
        await document.deleteOne();
        res.status(200).json({ message: 'Document removed successfully.' });
    } catch (error) {
        next(error);
    }
};

// --- UNCHANGED FUNCTIONS (No modifications needed) ---

const getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization')
      .populate('pharmacyId', 'name address phone location')
      .lean();

    for (const pres of prescriptions) {
      for (const med of pres.medicines) {
        const stockItem = await Stock.findOne({
          pharmacyId: pres.pharmacyId._id,
          medicineName: { $regex: new RegExp(`^${med.name}$`, 'i') } 
        });
        med.isAvailable = stockItem && stockItem.quantity > 0;
      }
    }
    res.status(200).json(prescriptions);
  } catch (error) {
    next(error);
  }
};

const downloadPrescription = async (req, res, next) => {
  try {
    const prescriptionId = req.params.id;
    const prescription = await Prescription.findById(prescriptionId)
      .populate('patientId', 'name dateOfBirth gender') // Use dateOfBirth instead of age
      .populate('doctorId', 'name specialization')
      .populate('pharmacyId', 'name address');

    if (!prescription || prescription.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Prescription not found or not authorized.' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);
    doc.pipe(res);
    
    doc.fontSize(20).font('Helvetica-Bold').text('Medical Prescription', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text('Patient Information');
    doc.font('Helvetica').text(`Name: ${prescription.patientId.name}`);
    // Calculate age from dateOfBirth for the PDF
    const age = prescription.patientId.dateOfBirth ? 
        new Date().getFullYear() - new Date(prescription.patientId.dateOfBirth).getFullYear() : 'N/A';
    doc.text(`Age: ${age}, Gender: ${prescription.patientId.gender || 'N/A'}`);
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text('Prescribed By');
    doc.font('Helvetica').text(`Dr. ${prescription.doctorId.name} (${prescription.doctorId.specialization})`);
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text('To Be Dispensed By');
    doc.font('Helvetica').text(`${prescription.pharmacyId.name}`);
    doc.text(`${prescription.pharmacyId.address}`);
    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').text('Medicines');
    doc.font('Helvetica');
    const tableTop = doc.y;
    const itemX = 50, dosageX = 250, durationX = 450;
    doc.font('Helvetica-Bold');
    doc.text('Medicine', itemX, tableTop);
    doc.text('Dosage', dosageX, tableTop);
    doc.text('Duration', durationX, tableTop);
    doc.moveTo(itemX - 10, doc.y).lineTo(550, doc.y).stroke();
    doc.font('Helvetica');
    doc.moveDown();
    prescription.medicines.forEach(med => {
        const y = doc.y;
        doc.text(med.name, itemX, y);
        doc.text(med.dosage, dosageX, y);
        doc.text(med.duration, durationX, y);
        doc.moveDown();
    });
    doc.end();
  } catch (error) {
    next(error);
  }
};


// --- EXPORT ALL FUNCTIONS ---
module.exports = {
  // Updated
  bookAppointment,
  getMyAppointments,
  updatePatientProfile,
  // New
  searchProviders,
  getProviderDetails,
  getMedicalDocuments,
  uploadMedicalDocument,
  deleteMedicalDocument,
  // Unchanged
  getMyPrescriptions,
  downloadPrescription,
};
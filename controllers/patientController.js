// Updated: backend/controllers/patientController.js
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const Prescription = require('../models/prescriptionModel');
const Stock = require('../models/stockModel'); // <-- 1. Import Stock model for availability checks
const PDFDocument = require('pdfkit'); // <-- 2. Import PDFKit for PDF generation

const bookAppointment = async (req, res, next) => {
  const { doctorId, appointmentDate, reason } = req.body;
  try {
    const patientId = req.user._id;

    if (!doctorId || !appointmentDate || !reason) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      reason,
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id });
    res.status(200).json(appointments);
  } catch (error)
 {
    next(error);
  }
};

// --- 3. ENHANCED FUNCTION ---
const getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization')
      .populate('pharmacyId', 'name address phone location')
      .lean(); // Use .lean() to get plain JS objects that we can modify

    // For each prescription, dynamically check the stock for each medicine
    for (const pres of prescriptions) {
      for (const med of pres.medicines) {
        const stockItem = await Stock.findOne({
          pharmacyId: pres.pharmacyId._id,
          // A simple name match. For a real-world app, you might match on a medicine ID.
          medicineName: { $regex: new RegExp(`^${med.name}$`, 'i') } 
        });
        // Add a new 'isAvailable' field for the patient app to use
        med.isAvailable = stockItem && stockItem.quantity > 0;
      }
    }

    res.status(200).json(prescriptions);
  } catch (error) {
    next(error);
  }
};

// --- 4. NEW FUNCTIONS FOR PATIENT APP ---

/**
 * @desc    Get a list of all doctors for the patient home screen
 * @route   GET /api/patient/doctors
 * @access  Private
 */
const getDoctorsList = async (req, res, next) => {
  try {
    // Find all users with the role 'doctor' and select only the public fields
    const doctors = await User.find({ role: 'doctor' }).select(
      'name specialization status'
    );
    res.status(200).json(doctors);
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
      patient.name = req.body.name || patient.name;
      patient.phone = req.body.phone || patient.phone;
      patient.address = req.body.address || patient.address;
      patient.age = req.body.age || patient.age;
      patient.gender = req.body.gender || patient.gender;
      patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;

      const updatedPatient = await patient.save();
      res.status(200).json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate and download a prescription as a PDF
 * @route   GET /api/patient/prescriptions/:id/download
 * @access  Private
 */
const downloadPrescription = async (req, res, next) => {
  try {
    const prescriptionId = req.params.id;
    const prescription = await Prescription.findById(prescriptionId)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization')
      .populate('pharmacyId', 'name address');

    // Security check: Ensure the prescription belongs to the logged-in user
    if (!prescription || prescription.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Prescription not found or not authorized.' });
    }

    // --- PDF GENERATION LOGIC ---
    const doc = new PDFDocument({ margin: 50 });

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);

    // Pipe the PDF document directly to the response stream
    doc.pipe(res);

    // --- Add content to the PDF ---
    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('Medical Prescription', { align: 'center' });
    doc.moveDown();

    // Patient Details
    doc.fontSize(12).font('Helvetica-Bold').text('Patient Information');
    doc.font('Helvetica').text(`Name: ${prescription.patientId.name}`);
    doc.text(`Age: ${prescription.patientId.age || 'N/A'}, Gender: ${prescription.patientId.gender || 'N/A'}`);
    doc.moveDown();
    
    // Doctor Details
    doc.fontSize(12).font('Helvetica-Bold').text('Prescribed By');
    doc.font('Helvetica').text(`Dr. ${prescription.doctorId.name} (${prescription.doctorId.specialization})`);
    doc.moveDown();

    // Pharmacy Details
    doc.fontSize(12).font('Helvetica-Bold').text('To Be Dispensed By');
    doc.font('Helvetica').text(`${prescription.pharmacyId.name}`);
    doc.text(`${prescription.pharmacyId.address}`);
    doc.moveDown(2);

    // Medicines Table
    doc.fontSize(14).font('Helvetica-Bold').text('Medicines');
    doc.font('Helvetica');
    const tableTop = doc.y;
    const itemX = 50;
    const dosageX = 250;
    const durationX = 450;

    // Table Header
    doc.font('Helvetica-Bold');
    doc.text('Medicine', itemX, tableTop);
    doc.text('Dosage', dosageX, tableTop);
    doc.text('Duration', durationX, tableTop);
    doc.moveTo(itemX - 10, doc.y).lineTo(550, doc.y).stroke();
    doc.font('Helvetica');
    doc.moveDown();

    // Table Rows
    prescription.medicines.forEach(med => {
        const y = doc.y;
        doc.text(med.name, itemX, y);
        doc.text(med.dosage, dosageX, y);
        doc.text(med.duration, durationX, y);
        doc.moveDown();
    });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    next(error);
  }
};


module.exports = {
  bookAppointment,
  getMyAppointments,
  getMyPrescriptions,
  getDoctorsList, // <-- Export new function
  updatePatientProfile, // <-- Export new function
  downloadPrescription, // <-- Export new function
};
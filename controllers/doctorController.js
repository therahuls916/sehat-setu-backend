const Appointment = require('../models/appointmentModel');
const Prescription = require('../models/prescriptionModel'); // <-- Import the new model

/**
 * @desc    Get all appointments for a doctor
 * @route   GET /api/doctor/appointments
 * @access  Private (Doctor only)
 */
const getDoctorAppointments = async (req, res) => {
  // ... (existing code, no changes)
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Update an appointment's status
 * @route   PUT /api/doctor/appointments/:id
 * @access  Private (Doctor only)
 */
const updateAppointmentStatus = async (req, res) => {
  // ... (existing code, no changes)
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this appointment' });
    }

    appointment.status = status || appointment.status;
    const updatedAppointment = await appointment.save();
    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Create a new prescription for an appointment
 * @route   POST /api/doctor/prescriptions
 * @access  Private (Doctor only)
 */
const createPrescription = async (req, res) => {
  const { appointmentId, patientId, pharmacyId, medicines, notes } = req.body;

  try {
    // 1. Basic Validation
    if (!appointmentId || !patientId || !pharmacyId || !medicines) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 2. Check if a prescription already exists for this appointment
    const prescriptionExists = await Prescription.findOne({ appointmentId });
    if (prescriptionExists) {
      return res.status(400).json({ message: 'A prescription already exists for this appointment.' });
    }
    
    // 3. (Security Check) Ensure the appointment belongs to the logged-in doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctorId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to create a prescription for this appointment.' });
    }

    // 4. Create the new prescription
    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      pharmacyId,
      medicines,
      notes,
      doctorId: req.user._id, // Assign the logged-in doctor's ID
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = {
  getDoctorAppointments,
  updateAppointmentStatus,
  createPrescription, // <-- Export the new function
};
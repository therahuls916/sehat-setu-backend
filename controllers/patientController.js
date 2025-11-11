const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const Prescription = require('../models/prescriptionModel');

/**
 * @desc    Create a new appointment
 * @route   POST /api/patient/appointments
 * @access  Private (Patient only)
 */
const bookAppointment = async (req, res) => {
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
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Get all appointments for a patient
 * @route   GET /api/patient/appointments
 * @access  Private (Patient only)
 */
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Get all prescriptions for a patient
 * @route   GET /api/patient/prescriptions
 * @access  Private (Patient only)
 */
const getMyPrescriptions = async (req, res) => {
  try {
    // Find all prescriptions and populate with related data
    const prescriptions = await Prescription.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization') // Get doctor's name and specialization
      .populate('pharmacyId', 'name address phone location'); // Get pharmacy's name, address, phone, and location

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getMyPrescriptions,
};
// Updated: backend/controllers/doctorController.js
const Appointment = require('../models/appointmentModel');
const Prescription = require('../models/prescriptionModel');
const User = require('../models/userModel');

const getAcceptedPatients = async (req, res, next) => {
  try {
    const acceptedAppointments = await Appointment.find({
      doctorId: req.user._id,
      status: 'accepted',
    }).populate('patientId', 'name');

    const patients = acceptedAppointments.map(appt => ({
      appointmentId: appt._id,
      patientId: appt.patientId._id,
      patientName: appt.patientId.name,
    }));

    res.status(200).json(patients);
  } catch (error) {
    next(error);
  }
};

const getDoctorProfile = async (req, res, next) => {
  try {
    const doctorProfile = req.user;
    if (!doctorProfile) {
        return res.status(404).json({ message: 'Doctor profile not found.' });
    }
    res.status(200).json(doctorProfile);
  } catch (error) {
    next(error);
  }
};

const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user._id);
    if (doctor) {
      doctor.name = req.body.name || doctor.name;
      doctor.specialization = req.body.specialization || doctor.specialization;
      if (req.body.linkedPharmacies) {
        doctor.linkedPharmacies = req.body.linkedPharmacies;
      }
      const updatedDoctor = await doctor.save();
      res.status(200).json(updatedDoctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    next(error);
  }
};

const getDoctorAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate('patientId', 'name');
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

const updateAppointmentStatus = async (req, res, next) => {
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
    next(error);
  }
};

const createPrescription = async (req, res, next) => {
  const { appointmentId, patientId, pharmacyId, medicines, notes } = req.body;
  try {
    if (!appointmentId || !patientId || !pharmacyId || !medicines) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    const prescriptionExists = await Prescription.findOne({ appointmentId });
    if (prescriptionExists) {
      return res.status(400).json({ message: 'A prescription already exists for this appointment.' });
    }
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.doctorId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to create a prescription for this appointment.' });
    }
    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      pharmacyId,
      medicines,
      notes,
      doctorId: req.user._id,
    });
    
    appointment.status = 'completed';
    await appointment.save();
    
    res.status(201).json(prescription);
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const pendingCount = await Appointment.countDocuments({ doctorId: doctorId, status: 'pending' });
    const acceptedCount = await Appointment.countDocuments({ doctorId: doctorId, status: 'accepted' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todaysCount = await Appointment.countDocuments({
      doctorId: doctorId,
      appointmentDate: { $gte: today, $lt: tomorrow },
    });
    res.json({
      todaysAppointments: todaysCount,
      pendingRequests: pendingCount,
      acceptedAppointments: acceptedCount,
    });
  } catch (error) {
    next(error);
  }
};

// --- NEW FUNCTION FOR PATIENT APP ---
/**
 * @desc    Update doctor's online/offline status
 * @route   PUT /api/doctor/status
 * @access  Private
 */
const updateDoctorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validate the incoming status
    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // Find the logged-in doctor and update their status
    const doctor = await User.findById(req.user._id);
    if (doctor) {
      doctor.status = status;
      await doctor.save();
      res.status(200).json({ message: `Your status has been updated to ${status}.` });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAcceptedPatients,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAppointmentStatus,
  createPrescription,
  getDashboardStats,
  updateDoctorStatus, // <-- Export the new function
};
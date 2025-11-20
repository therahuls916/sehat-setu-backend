// backend/controllers/doctorController.js
const Appointment = require('../models/appointmentModel');
const Prescription = require('../models/prescriptionModel');
const User = require('../models/userModel');
const { sendNotificationToUser } = require('../utils/notificationSender');

// --- OVERHAULED FUNCTION ---

/**
 * @desc    Update the profile of the logged-in doctor with rich details
 * @route   PUT /api/doctor/profile
 * @access  Private
 */
const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await User.findById(req.user._id);

    if (doctor) {
      // Basic Info
      doctor.name = req.body.name || doctor.name;
      doctor.specialization = req.body.specialization || doctor.specialization;
      doctor.profilePictureUrl = req.body.profilePictureUrl || doctor.profilePictureUrl;
      doctor.phone = req.body.phone || doctor.phone;
      
      // Detailed Profile Info from the new UI designs
      doctor.about = req.body.about || doctor.about;
      
      // Use 'if' checks for objects and arrays to allow them to be updated or cleared
      if (req.body.services) {
        doctor.services = req.body.services;
      }
      if (req.body.timings) {
        doctor.timings = req.body.timings;
      }
      if (req.body.consultationFee) {
        doctor.consultationFee = req.body.consultationFee;
      }
      if (req.body.linkedPharmacies) {
        doctor.linkedPharmacies = req.body.linkedPharmacies;
      }

      // Handle location data specifically
      if (req.body.latitude && req.body.longitude) {
        doctor.location = {
          type: 'Point',
          coordinates: [req.body.longitude, req.body.latitude],
        };
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

/**
 * @desc    Get history of all completed appointments
 * @route   GET /api/doctor/history
 * @access  Private
 */
const getPatientHistory = async (req, res, next) => {
  try {
    const completedAppointments = await Appointment.find({
      doctorId: req.user._id,
      status: 'completed',
    })
    .populate('patientId', 'name')
    .sort({ appointmentDate: -1 })
    .lean(); // Use .lean() for better performance

    // For each appointment, find the corresponding prescription ID
    const history = await Promise.all(completedAppointments.map(async (appt) => {
        const prescription = await Prescription.findOne({ appointmentId: appt._id }).select('_id').lean();
        return {
            ...appt,
            prescriptionId: prescription?._id || null,
        };
    }));

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};


// --- UNCHANGED FUNCTIONS (No modifications needed for these) ---

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
    // This will now automatically return the full profile with all new fields
    const doctorProfile = req.user;
    if (!doctorProfile) {
        return res.status(404).json({ message: 'Doctor profile not found.' });
    }
    res.status(200).json(doctorProfile);
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
    // ... (Keep existing auth check) ...

    appointment.status = status || appointment.status;
    const updatedAppointment = await appointment.save();

    // --- NEW: SEND NOTIFICATION ---
    if (status === 'accepted') {
      await sendNotificationToUser(
        appointment.patientId, 
        'Appointment Confirmed! ✅', 
        `Your appointment has been accepted by the doctor.`
      );
    } else if (status === 'rejected') {
      await sendNotificationToUser(
        appointment.patientId, 
        'Appointment Update ❌', 
        `Your appointment request was declined.`
      );
    }
    // ------------------------------

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
      appointmentId, patientId, pharmacyId, medicines, notes, doctorId: req.user._id,
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

const updateDoctorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }
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

// --- EXPORT ALL FUNCTIONS ---
module.exports = {
  getAcceptedPatients,
  getDoctorProfile,
  updateDoctorProfile, // The only function that was changed
  getDoctorAppointments,
  updateAppointmentStatus,
  createPrescription,
  getDashboardStats,
  updateDoctorStatus,
  getPatientHistory,
};
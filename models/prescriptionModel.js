const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g., "1 tablet 3 times a day"
  duration: { type: String, required: true }, // e.g., "7 days"
  quantity: { type: Number, required: true, default: 1 } // How many units to dispense

});

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Appointment',
      unique: true, // A single appointment can only have one prescription
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Pharmacy',
    },
    medicines: [medicineSchema], // An array of medicines
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'ready_for_pickup', 'dispensed'],
      default: 'pending',
    },
    pharmacyNotes: {
      type: String, // To store remarks from the pharmacy
    },


    patientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Pharmacy' },
    medicines: [medicineSchema],
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'ready_for_pickup', 'dispensed'],
      default: 'pending',
    },
    pharmacyNotes: { type: String },
  },
  { timestamps: true }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;
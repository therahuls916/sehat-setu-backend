const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    documentName: {
      type: String,
      required: [true, 'Please provide a name for the document'],
    },
    documentType: { // e.g., 'Lab Report', 'X-Ray', 'Prescription'
      type: String, 
    },
    documentUrl: {
      type: String,
      required: true, // This will be the URL from the file storage service (like Cloudinary or S3)
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalDocument = mongoose.model('MedicalDocument', medicalDocumentSchema);

module.exports = MedicalDocument;
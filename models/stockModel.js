const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  // Links this stock item to a specific pharmacy
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Pharmacy',
  },
  medicineName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
  },
  expiryDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
const mongoose = require('mongoose');

// A sub-schema for individual messages within a ticket
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ['Patient', 'Support'], // Defines who sent the message
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const supportTicketSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    subject: {
      type: String,
      required: true,
      default: 'General Inquiry',
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'In Progress', 'Closed'],
      default: 'Open',
    },
    messages: [messageSchema], // An array of chat messages
  },
  {
    timestamps: true, // Adds createdAt and updatedAt for the entire ticket
  }
);

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

module.exports = SupportTicket;
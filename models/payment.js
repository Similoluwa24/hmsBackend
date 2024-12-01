const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionReference: {
    type: String, // Flutterwave transaction reference
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'NGN', // Adjust based on your default currency
  },
  status: {
    type: String,
    enum: ['Pending', 'Successful', 'Failed'],
    default: 'Pending',
  },
  paymentDate: {
    type: Date,
    default: null, // Populated after a successful payment
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

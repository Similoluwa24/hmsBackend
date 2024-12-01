const mongoose = require('mongoose');
const User = require('../models/user')

const invoiceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  services: [
    {
      name: { type: String, required: true },
      description: { type: String },
      cost: { type: Number, required: true },
      date: { type: String, default: Date.now }
    }
  ],
  patientAddress:{ type: String, required: false },
  totalCost: { type: Number, required: true },
  issuedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['unpaid', 'paid','pending', 'cancelled'], default: 'unpaid' },

},
 { timestamps: true });


module.exports = mongoose.model('Invoice', invoiceSchema);

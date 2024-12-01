const mongoose = require('mongoose');
const User = require('./user');

const prescriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        name: { type: String, required: true },
        age: { type: Number, required: true },
    },
    dop: { // Date of Prescription
        type: String,
        required: true
    },
    ailment: {
        type: String,
        required: true
    },
    medication: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        required: true
    },
    doctor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    requiresInvoice: { // Flag to indicate if invoicing is required
        type: Boolean,
        default: false // Default to false, set to true when invoice is needed
    }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);

const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    patients: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: [true, 'Patient is required']
    },
    doctor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required: [true, 'Doctor is required']
    },
    drugs: [
        {
            name: { type: String, required: [true, 'Drug name is required'] },
            quantity: { type: Number, required: [true, 'Quantity is required'] },
            dosage: { type: String, required: [true, 'Dosage instructions are required'] }
        }
    ],
    dateDispensed: {
        type: Date,
        default: Date.now,
        required: true
    },
    linkedAppointment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Appointment', 
    },
    linkedDiagnosis: {
        type: mongoose.Schema.ObjectId,
        ref: 'Diagnosis', 
    },
    notes: {
        type: String, 
        minlength: [3, 'Notes should be at least 3 characters']
    }
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);

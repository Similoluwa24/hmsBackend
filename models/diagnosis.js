const mongoose = require('mongoose');
const User = require('../models/user')

const diagnosisSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    patient: {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        relationship: { type: String, required: true } // e.g., "daughter", "son"
    },
    diagnosis:{
        type:String,
        required:true
    },
    symptoms:{
        type:String,
        required:true
    },
    // medication:{
    //     type:String,
    //     required:true
    // },
    
    notes:{
        type:String,
        required:true
    },
    doctor:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    }
})

module.exports = mongoose.model('Diagnosis', diagnosisSchema)
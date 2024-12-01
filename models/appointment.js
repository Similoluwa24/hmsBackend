const mongoose = require('mongoose');
const {isEmail} = require('validator')
const User = require('./user');

const appointmentSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:[true, 'user is required']
    },
    first_name:{
        type: String,  
        required: [true, 'Please enter your first name'],
        minlength:[3, 'First Name should be atleast 3 characters']
    },
    last_name:{
        type: String,
        required: [true, 'Please enter your last name'],
        minlength:[3, 'Last Name should be atleast 3 characters']
    },
    email:{
        type: String,
        required: [true, 'Please enter your email'],
        validate: [isEmail, 'Please enter valid email']    
    },
    doctor:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:[true, 'user is required']
    },
    date:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    message:{
        type: String,
        required: [true, 'Please enter message'],
        minlength:[3, 'Messge should be atleast 12 characters']
    },
    status:{
        type: String,
        required: true,
        enum:['pending',"confirmed","cancelled"],
        default:"pending"
    }
})

module.exports = mongoose.model('Appointment', appointmentSchema)
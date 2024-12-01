const mongoose = require('mongoose');
const {isEmail} = require('validator')
const contactSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxLength: 25
    },
    email:{
        type:String,
        required:true,
        validate: [isEmail, "Please provide a valid email"]
    },
    subject:{
        type:String,
        required:true,
    },
    message:{
        type:String,
        required:true,
    }
    
})
module.exports = mongoose.model('Contact', contactSchema)
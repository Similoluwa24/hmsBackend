const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    hod:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model('Depatment', departmentSchema)
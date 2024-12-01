const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'name is required']
    },
    category:{
        type:String,
        required:[true,'category is required']
    },
    cName:{
        type:String,
        required:[true,'cName is required']
    },
    pDate:{
        type:String,
        required:[true,'pDate is required']
    },
    price:{
        type:Number,
        required:[true,'price is required']
    },
    eDate:{
        type:String,
        required:[true,'eDate is required']
    },
    stock:{
        type:Number,
        required:[true,'stock is required']
    }
})

module.exports = mongoose.model('Pharmacy', pharmacySchema)
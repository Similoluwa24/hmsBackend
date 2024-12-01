const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    pDate:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    details:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model('Inventory', inventorySchema)
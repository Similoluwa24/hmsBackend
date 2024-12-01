const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const Inventory = require('../models/inventory')
const ErrorHandler = require('../utils/errorHandler')


exports.addInventory = catchAsyncErrors(async (req,res) => {
    const data = await Inventory.create(req.body)
    res.status(201).json({
        status:'success',
        data
    })
})

exports.deleteInventory = catchAsyncErrors(async (req,res) => {
    const data = await Inventory.findById(req.params.id)
    if (!data) {
       return next(new ErrorHandler('Inventory not Found',404))
    }
    await data.deleteOne()
    res.status(200).json({
        status:'success',
        message:'deleted!'
    })
})

exports.getInventory = catchAsyncErrors(async (req,res) => {
    const data = await Inventory.find()
    res.status(200).json({
        status:'success',
        data
    })
})

exports.updateInventory = catchAsyncErrors(async (req,res) => {
    const data = await Inventory.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        status:'success',
        data
    })
})
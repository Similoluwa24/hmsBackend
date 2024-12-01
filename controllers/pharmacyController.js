const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const Pharmacy = require('../models/pharmacy')
const ErrorHandler = require('../utils/errorHandler')


exports.addMedications = catchAsyncErrors(async (req,res) => {
    const medication = await Pharmacy.create(req.body)
    res.status(201).json({
        status:"sucsess",
        medication
    })
})

exports.fetchMedications = catchAsyncErrors(async (req,res) => {
    const meds = await Pharmacy.find()
    res.status(200).json({
        status:'success',
        count:meds.length,
        meds
    })
})

exports.deleteMedications = catchAsyncErrors(async(req, res)=>{
    const deletemeds = await Pharmacy.findById(req.params.id)
    if (!deletemeds) {
        next(new ErrorHandler('not found'),404)
    }
    await deletemeds.deleteOne()
    res.status(200).json({
        status:'success',
        message:"deleted!"
    })
})

exports.updateMedications = catchAsyncErrors(async (req,res) => {
    const meds = await Pharmacy.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true,
        meds
    })
})
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/user');
const Diagnosis = require('../models/diagnosis');
const ErrorHandler = require('../utils/errorHandler');


exports.addDiagnosis = catchAsyncErrors(async (req,res,next) => {
    req.body.user = req.user.id
const {patient,userId,diagnosis,symptoms,notes} = req.body
    if(!patient|| !userId || !diagnosis || !symptoms || !notes){
        return next(new ErrorHandler('Patient,userId,diagnosis,symptoms,notes is Required'))
    }

    //check if user exist
    const userExists = await User.findById(userId)
    if (!userExists) {
        return next(new ErrorHandler('User ID doesnt exist',400))
    }

const diagnose = await Diagnosis.create({
    doctor:req.user.id,
    patient,
    diagnosis,
    symptoms,
    userId,
    notes
})

res.status(201).json({
    status:'success',
    diagnose
})
})

exports.deleteDiagnosis = catchAsyncErrors(async (req,res,next) => {
    const diagnosis = await Diagnosis.findById(req.params.id)

    if (!diagnosis) {
        return next(new ErrorHandler('Diagnosis Not Found',404))
    }
    await diagnosis.deleteOne()
    res.status(200).json({
        status:'success'
    })
})

exports.findDiagnosis = catchAsyncErrors(async (req,res,next) => {
    const diagnosis = await Diagnosis.find()
    res.status(200).json({
        diagnosis
    })
})


exports.findByDoctorId = catchAsyncErrors(async (req, res, next) => {
    const doctorId = req.user.id; // Use req.query for GET requests
    if (!doctorId) {
      return next(new ErrorHandler('Doctor ID is required and cannot be undefined', 400));
    }
  
    const diagnosis = await Diagnosis.findOne({ doctor: doctorId }).populate('doctor').populate('userId');
  
    if (!diagnosis) {
      return next(new ErrorHandler('Diagnosis not found', 404));
    }
  
    res.status(200).json({
      diagnosis: Array.isArray(diagnosis) ? diagnosis : [diagnosis],
    });
  });
  
  
exports.findByUserId = catchAsyncErrors(async (req,res,next) => {
    const userId = req.user.id
    if (!userId) {
      return  next(new ErrorHandler('User Id is invalid',400))
    }
    const diagnosis = await Diagnosis.findOne({userId:userId}).populate('doctor').populate('userId')

    res.status(200).json({
        diagnosis: Array.isArray(diagnosis) ? diagnosis : [diagnosis]
    })
})
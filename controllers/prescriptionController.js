const Prescription = require('../models/prescription');
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const User = require('../models/user')
const ErrorHandler = require('../utils/errorHandler')

exports.addPrescription = catchAsyncErrors(async (req,res,next) => {
      // Ensure the user is authenticated and their id is available
  req.body.user = req.user.id;

  const { patient, dop, ailment, medication, dosage, notes, userId } = req.body;

  // Validate if all required fields are present in the request body
  if (!patient || !dop || !ailment || !medication || !dosage || !notes || !userId) {
      return res.status(400).json({ message: 'Please provide all required fields: first_name, dop, ailment, medication, dosage, notes, user.' });
  }

  // Check if the user exists in the User collection
  const userExists = await User.findById(userId);
  if (!userExists) {
      return next(new ErrorHandler('user not found',404))
  }

  const prescription = await Prescription.create({
    doctor:req.user.id,
    patient,
    dop,
    ailment,
    medication,
    dosage,
    notes,
    userId,
    requiresInvoice: true
  })
  res.status(201).json({
    status:'success',
    prescription
  })
})
exports.deletePrescription = catchAsyncErrors(async (req,res,next) => {
  const prescription = await Prescription.findById(req.params.id)

  if (!prescription) {
    return next(new ErrorHandler('Prescription not found',404))
  }
  await Prescription.deleteOne()

  res.status(200).json({
    status:'success'
  })
})

exports.findPrescription = catchAsyncErrors(async(req,res,next)=>{
  const prescription = await Prescription.find()

  res.status(200).json({
    status:'success',
    prescription
  })
})

exports.findPrescriptionByDoctorId = catchAsyncErrors(async (req,res,next) => {
  if (!req.user || !req.user.id) {
   return next(new ErrorHandler('Doctor ID Not Found', 400))
  }
  const prescription = await Prescription.find({doctor:req.user.id})
                                          .populate('doctor')
                                          .populate('userId')
  res.status(200).json({
    status:'success',
    prescription
  })                                      
}) 

exports.findPrescriptionByPatientId = catchAsyncErrors(async (req,res,next) => {
  // if (!req.user || req.user.id) {
  //   return next(new ErrorHandler('User ID Not Found', 400))
  // }

  const prescription = await Prescription.find({userId:req.user.id})
                                          .populate('doctor')
                                          .populate('userId')

  //   if (!prescription || prescription.length === 0) {
  //     return res.status(404).json({ message: 'No prescription found for this user' });
  // }                                    
    res.status(200).json({
      status:'success',
      prescription
    })                                        
})

exports.editPrescription = catchAsyncErrors(async (req,res,next) => {
  const prescription = await Prescription.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true
  })
  res.status(200).json({
    status:'success',
    prescription
  })
})

exports.getPendingInvoices = catchAsyncErrors( async (req, res) => {
 
      const prescriptions = await Prescription.find({ requiresInvoice: true })
          .populate('userId') 
          .populate('doctor'); 

      res.status(200).json(prescriptions);
});

exports.findPrescriptionById = catchAsyncErrors(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id).populate('userId')

  if (!prescription) {
    res.status(400).json('Prescription not found')
  }

  res.status(200).json(prescription)
})
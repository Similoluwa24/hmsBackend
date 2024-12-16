const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const User = require('../models/user');
const Diagnosis = require('../models/diagnosis');
const ErrorHandler = require('../utils/errorHandler');


// exports.addDiagnosis = catchAsyncErrors(async (req,res,next) => {
//     req.body.user = req.user.id
// const {patient,userId,diagnosis,symptoms,notes} = req.body
//     if(!patient|| !userId || !diagnosis || !symptoms || !notes){
//         return next(new ErrorHandler('Patient,userId,diagnosis,symptoms,notes is Required'))
//     }

//     //check if user exist
//     const userExists = await User.findById(userId)
//     if (!userExists) {
//         return next(new ErrorHandler('User ID doesnt exist',400))
//     }

// const diagnose = await Diagnosis.create({
//     doctor:req.user.id,
//     patient,
//     diagnosis,
//     symptoms,
//     userId,
//     notes
// })

// res.status(201).json({
//     status:'success',
//     diagnose
// })
// })

exports.addDiagnosis = catchAsyncErrors(async (req, res, next) => {
    const { uniqueId, patient, diagnosis, symptoms, notes, appointmentId } = req.body;

    if (!uniqueId || !patient || !diagnosis || !symptoms || !notes) {
        return next(new ErrorHandler('Card number, patient info, diagnosis, symptoms, and notes are required'));
    }

    // Find user by card number
    const user = await User.findOne({ uniqueId });
    if (!user) {
        return next(new ErrorHandler('Card number does not match any registered user', 400));
    }

    // If appointmentId is provided, verify that it exists and belongs to the user
    let appointment = null;
    if (appointmentId) {
        appointment = await Appointment.findOne({ _id: appointmentId, patient: user._id });
        if (!appointment) {
            return next(new ErrorHandler('Invalid appointment ID or appointment does not belong to this user', 400));
        }
    }

    // Create diagnosis
    const newDiagnosis = await Diagnosis.create({
        userId: user._id,
        uniqueId,
        appointment: appointment ? appointment._id : null, // Link appointment if provided
        patient,
        diagnosis,
        symptoms,
        notes,
        doctor: req.user.id, // Assuming req.user.id contains the logged-in doctor's ID
    });

    res.status(201).json({
        status: 'success',
        data: newDiagnosis
    });
});

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
    const doctorId = req.user.id; 
    if (!doctorId) {
      return next(new ErrorHandler('Doctor ID is required and cannot be undefined', 400));
    }
  
    const diagnosis = await Diagnosis.find({ doctor: doctorId }).populate('doctor').populate('userId');
  
    if (!diagnosis) {
      return next(new ErrorHandler('Diagnosis not found', 404));
    }
  
    res.status(200).json({
      diagnosis: Array.isArray(diagnosis) ? diagnosis : [diagnosis],
    });
  });
  
  
// exports.findByUserId = catchAsyncErrors(async (req,res,next) => {
//     const userId = req.user.id
//     if (!userId) {
//       return  next(new ErrorHandler('User Id is invalid',400))
//     }
//     const diagnosis = await Diagnosis.findOne({userId:userId}).populate('doctor').populate('userId')

//     res.status(200).json({
//         diagnosis: Array.isArray(diagnosis) ? diagnosis : [diagnosis]
//     })
// })

exports.findByUserId = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;

    if (!userId) {
        return next(new ErrorHandler('User ID is invalid', 400));
    }

    const diagnosis = await Diagnosis.find({ userId })
        .populate('doctor', 'firstName lastName') // Populate doctor details
        .populate('appointment', 'date status') // Populate appointment details
        .populate('userId', 'firstName lastName cardNumber'); // Populate user details

        res.status(200).json({
                     diagnosis: Array.isArray(diagnosis) ? diagnosis : [diagnosis]
                })
});


exports.findDiagnosisById = catchAsyncErrors(async(req, res, next)=>{
    const id = req.params.id

    const diagnosis = await Diagnosis.findById(id)
    
    if (!diagnosis) {
        res.status(404).json('Diagnosis not Found')
    }
    res.status(200).json(diagnosis)
})
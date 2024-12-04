const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Vitals = require('../models/vitals');


exports.addVitals = catchAsyncErrors(async (req, res) => {
    const {user, bloodPressure, temperature, weight, height } = req.body;
  
    if (!bloodPressure || !temperature || !weight || !height) {
      return res.status(400).json({ message: 'Please provide all vital signs.' });
    }
  
    const vitals = await Vitals.create({
      user,
      bloodPressure,
      temperature,
      weight,
      height,
    });
  
    res.status(201).json({
      status: 'success',
      message: 'Vitals recorded successfully',
      vitals,
    });
  });

  exports.getById = catchAsyncErrors(async (req,res,next) => {
    const id = req.params.id

    const vitals = await Vitals.findById(id).populate('user')

    res.status(200).json(vitals)
  })

  exports.getLatest = catchAsyncErrors(async (req,res,next) => {
    const vitals = await Vitals.findOne({user:req.user.id}).sort({createdAt: -1}).populate('user')

    res.status(200).json(vitals)
  })

  exports.getByUserId = catchAsyncErrors(async (req, res, next) => {
  
    // Fetch all vitals for the user
    const vitals = await Vitals.find({ user: req.user.id }).populate('user')
  
    // Return a structured response
    res.status(200).json({
      status: "success",
      data: vitals,
    });
  });
  
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
  
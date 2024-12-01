const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Appointment = require("../models/appointment");
const ErrorHandler = require('../utils/errorHandler')
const User = require('../models/user')
const mongoose = require('mongoose');
const sendEmail = require("../utils/sendEmail");



exports.createAppointment = catchAsyncErrors(async (req,res) => {
  // Ensure the user is authenticated and their id is available
  req.body.user = req.user.id;

  const { first_name, last_name, email, doctor, date, time, message } = req.body;

  // Validate if all required fields are present in the request body
  if (!first_name || !last_name || !email || !doctor || !date || !time || !message) {
      return res.status(400).json({ message: 'Please provide all required fields: first_name, last_name, email, doctor, date, time, message.' });
  }

  // Check if the doctor exists in the User collection
  const doctorExists = await User.findById(doctor);
  if (!doctorExists) {
      return res.status(400).json({ message: 'Doctor not found' });
  }

  // Create a new appointment using the provided data
  const appointment = await Appointment.create({
      user: req.user.id, // User is automatically assigned from the authenticated user
      first_name,
      last_name,
      email,
      doctor,
      date,
      time,
      message
  });

  // Send response with the created appointment
  res.status(201).json({
      status: "success",
      appointment
  });

  try {
    const doctorName = `${doctorExists.first_name} ${doctorExists.last_name}`;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Appointment Confirmation</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear <strong>${first_name} ${last_name}</strong>,</p>
          <p>Your appointment has been successfully scheduled. Here are the details:</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Doctor:</strong> Dr. ${doctorName}</li>
            <li><strong>Date:</strong> ${new Date(date).toDateString()}</li>
            <li><strong>Time:</strong> ${time}</li>
          </ul>
          <p>If you have any questions or need to reschedule, please contact us at <a href="mailto:support@ojhospital.com" style="color: #007bff; text-decoration: none;">support@ojhospital.com</a>.</p>
          <p style="margin-top: 20px;">Best regards,</p>
          <p style="margin: 0;">The <strong>OJ Hospital</strong> Team</p>
        </div>
        <div style="background-color: #f8f9fa; color: #666; padding: 10px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">OJ Hospital | Your Health, Our Priority</p>
          <p style="margin: 0;">123 Health Street, City, Country</p>
          <p style="margin: 0;">Phone: +123-456-7890 | Email: <a href="mailto:support@ojhospital.com" style="color: #007bff; text-decoration: none;">support@ojhospital.com</a></p>
        </div>
      </div>
    `;

    await sendEmail({
      email: email, 
      subject: 'Appointment Confirmation - OJ Hospital',
      html: emailContent, 
    });
  } catch (error) {
    console.error('Failed to send appointment confirmation email:', error);
  }
});
exports.deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const deleteApp = await Appointment.findById(req.params.id)
    if (!deleteApp) {
        return next(new ErrorHandler('Appointment not Found', 401))
    }
     await deleteApp.deleteOne()
     res.status(200).json({
        status:"success",
        message:"Item deleted"
     })
    
})
exports.findAppointment = catchAsyncErrors(async(req,res)=>{
    const findApp = await Appointment.find()
                                    .populate('user', 'first_name last_name email')
                                    .populate('doctor', 'first_name last_name email');
    res.status(200).json({
        status:"success",
        findApp
    })
})
exports.findAppointmentByUserId = catchAsyncErrors(async (req, res) => {
    // Ensure req.user exists and has an ID
    if (!req.user || !req.user.id) {
      return res.status(400).json({
        status: 'Fail',
        message: 'User ID not found in request',
      });
    }
  
    // Find appointments based on the user's ID
    const findApp = await Appointment.find({ user: req.user.id })
                                    .populate('user')
                                    .populate('doctor');
  
    res.status(200).json({
      status: 'success',
      findApp
    });
});
  
exports.editAppointment = catchAsyncErrors(async (req,res) => {
    const editApp = await Appointment.findByIdAndUpdate(req.params.id,req.body,{
        runValidators:true,
        new:true,
        useFindAndModify:false
    })
    res.status(200).json({
        status:"success",
        editApp
    })
})

exports.getAppointmentsByDoctor = catchAsyncErrors(async (req, res) => {

     // Ensure req.user exists and has an ID
    if (!req.user || !req.user.id) {
      return res.status(400).json({
        status: 'Fail',
        message: 'User ID not found in request',
      });
    }
  

    const appointments = await Appointment.find({ doctor: req.user.id })
        .populate('user', 'first_name last_name email') 
        .populate('doctor', 'first_name last_name email'); 

    if (!appointments || appointments.length === 0) {
        return res.status(404).json({ message: 'No appointments found for this doctor' });
    }
    res.status(200).json({ appointments });
});

exports.getLatestAppointment = catchAsyncErrors(async (req,res,next) => {
    const appointment = await Appointment.findOne().sort({_id: -1}).populate('user','first_name last_name')

    res.status(200).json(appointment)
})


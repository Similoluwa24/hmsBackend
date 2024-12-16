const User = require('../models/user');
const Appointment = require('../models/appointment')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const dotenv = require('dotenv');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const  cloudinary  = require('../utils/cloudinary');

dotenv.config()

exports.signup = catchAsyncErrors(async (req, res, next) => {
  const {
    first_name, last_name, email, gender, dob, password, confirmPassword, role,
    phone, departments, address, school, NHIS, genotype, btype,
  } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate Role-Based Unique ID
  const rolePrefix = role === 'admin' ? 'ADM' : role === 'doctor' ? 'DOC' : 'PAT';
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const uniqueId = `OJH/${rolePrefix}/${randomDigits}`;

  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

  let photoUrl = null;
  if (req.file) {
    try {
      const photoResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      );
      photoUrl = photoResult.secure_url;
    } catch (error) {
      return res.status(500).json({ message: 'Image upload failed', error: error.message });
    }
  }

  // Save the unverified user to the database
  const newUser = await User.create({
    first_name,
    last_name,
    email,
    gender,
    dob,
    phone,
    departments,
    address,
    school,
    NHIS,
    genotype,
    btype,
    uniqueId,
    password: hashedPassword,
    photo: photoUrl,
    verificationToken,
    verificationExpire: Date.now() + 24 * 60 * 60 * 1000,
    verified: false, 
    role,
  });

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Welcome to OJ Hospital</h1>
    </div>
    <div style="padding: 20px;">
      <p>Dear <strong>${newUser.first_name} ${newUser.last_name}</strong>,</p>
      <p>Thank you for choosing OJ Hospital. We're excited to have you onboard!</p>
      <p>Your Card Number is: <strong>${uniqueId}</strong></p>
      <p>To complete your registration, please verify your account using the token below:</p>
      <div style="text-align: center; margin: 20px 0;">
        <div style="display: inline-block; padding: 10px 20px; font-size: 20px; font-weight: bold; color: #007bff; border: 2px dashed #007bff; border-radius: 5px;">
          ${verificationToken}
        </div>
      </div>
      <p><strong>Note:</strong> This token is valid for 24 hours only. Make sure to complete your verification promptly to enjoy uninterrupted access to our services.</p>
      <p>If you did not sign up for this account, please ignore this email or contact our support team.</p>
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

  try {
    await sendEmail({
      email: newUser.email,
      subject: 'Verify Your Account',
      html,
    });
    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});


exports.verifyToken = catchAsyncErrors(async (req, res, next) => {
  const { email, token } = req.body;

  const user = await User.findOne({ email, verificationToken: token });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification token' });
  }

  if (Date.now() > user.verificationExpire) {
    return res.status(400).json({ message: 'Verification token expired' });
  }

  user.verified = true;
  user.verificationToken = undefined; 
  user.verificationExpire = undefined;
  await user.save();

  // Generate and send a JWT for login
  sendToken(user, 200, res);
});

  

exports.login = catchAsyncErrors(async (req, res, next) => {
    const {email, password} = req.body;
    // check if the user or password is valid
    if (!email) {
        return next(new ErrorHandler('Please Enter Email And Password', 400))
    }
    // //finding user in database
    const user = await User.findOne({email})
    //Incorrect Email
    if (!user) {
        return next(new ErrorHandler('Please Enter Valid Email', 401))
    }
    const validatePassword = await bcrypt.compare(password, user.password)
    if (!validatePassword) {
        return next(new ErrorHandler('Please Enter Valid  Password', 401))
    }
   sendToken(user,200,res)
   console.log(req.user);
   
    
})



exports.logout = catchAsyncErrors(async (req, res, next) => {
  
    // Send success response
    res.status(200).json({
        status: "success",
        message: "Logged Out"
    });
});



exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    //first we confirm if the password user filled is in db
    const user = await User.findOne({email:req.body.email})
    //if the email isnt in the db
    if (!user) {
       return next(new ErrorHandler('User Not Found', 404))
    }
    //if user exist
    const resetToken = user.getResetToken()
    await user.save({validateBeforeSave:false})
    //create reset url
    const resetUrl = `${req.protocol}://ojhospital.vercel.app/auth/resetPwd/${resetToken}`

    //message to be sent to client with the token to reset password
    const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #ff6f61; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
    </div>
    <div style="padding: 20px;">
      <p>Dear User,</p>
      <p>You have requested to reset your password. Please click the link below to proceed:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" 
          style="display: inline-block; padding: 10px 20px; font-size: 16px; font-weight: bold; color: white; background-color: #ff6f61; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </div>
      <p>If the button above does not work, copy and paste the following link into your browser:</p>
      <div style="word-wrap: break-word; background-color: #f8f9fa; padding: 10px; border: 1px dashed #ddd; margin: 10px 0; color: #007bff;">
        <a href="${resetUrl}" style="color: #007bff; text-decoration: none;">${resetUrl}</a>
      </div>
      <p>If you did not request to reset your password, please ignore this email or contact support.</p>
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

    try {
        await sendEmail({
            email: user.email,
            subject:'OJ HOSPITAL PASSWORD RECOVERY MESSAGE',
            html
        })
        res.status(200).json({
            status:"success",
            message:`Email has been sent to ${user.email}`
        })
    } catch (error) {
        console.log(error); 
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave:false})
        return next(new ErrorHandler('Email could not be sent', 500));  // Handle error response
    }
})

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    console.log('Reset Token:', req.params.token);
    console.log('Hashed Reset Token:', resetPasswordToken);

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler('The reset Token is either Invalid or Expired', 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Passwords do not match', 401));
    }

    // Hash the new password before saving
    user.password = await bcrypt.hash(req.body.password, 12);

    // Clear the reset token and expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save the updated user with the new hashed password
    await user.save();

    // Send token to log in the user after resetting password
    sendToken(user, 200, res);
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const {oldpassword,newpassword} = req.body
    const user = await User.findById(req.user.id)

    const isMatched = await bcrypt.compare(oldpassword, user.password)

    if (!isMatched) {
        return next( new ErrorHandler('Your Old Password is Incorrect', 401))
    }
    user.password = await bcrypt.hash(newpassword,12)
    await user.save()
    sendToken(user, 200, res)
})



exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    // Copy all non-file fields from the request body
    const updates = { ...req.body };

    try {
       
        if (req.file) {
            // Upload the file to Cloudinary
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
            );
            // Update the photo field in the updates object
            updates.photo = result.secure_url; 
        }

        // Find and update the user in the database
        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            runValidators: true,
            new: true, 
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            status: 'success',
            user,
        });

    } catch (error) {
        console.error('Error Updating Profile:', error); // Debugging: Log any errors
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while updating the profile',
            error: error.message,
        });
    }
});





exports.checkMiddleware = catchAsyncErrors( async(req, res)=>{
    res.status(200).json({
        message: 'Middleware works',
        user: req.user
    });
})
exports.getAllUsers = catchAsyncErrors( async(req, res)=>{
       const users = await User.find()
       res.status(200).json({
        status:"success",
        count: users.length,
        users
       })
})

exports.getUserbyId = catchAsyncErrors( async(req, res)=>{
       const users = await User.find(req.params.id)

       if (!users) {
        return next(new ErrorHandler('User not found', 404))
       }
       res.status(200).json({
        status:"success",
        count: users.length,
        users
       })
})

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    console.log(user);
    
    res.status(200).json({
        status:"success",
        user
    })
})
//admin
exports.updateProfileAdmin = catchAsyncErrors(async (req, res, next) => {
   // Copy all non-file fields from the request body
   const updates = { ...req.body };
        
       if (req.file) {
           // Upload the file to Cloudinary
           const result = await cloudinary.uploader.upload(
               `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
           );
           // Update the photo field in the updates object
           updates.photo = result.secure_url; 
       }

       // Find and update the user in the database
       const user = await User.findByIdAndUpdate(req.params.id, updates, {
           runValidators: true,
           new: true, 
       });

       if (!user) {
           return res.status(404).json({ message: 'User not found' });
       }
       res.status(200).json({
           status: 'success',
           user,
       });
})

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    
    if (!user) {
        return next(new ErrorHandler('User not found', 404))
    }
    
    await user.deleteOne()

    res.status(200).json({
        status: 'success',
        message: 'deleted'
    })
})


exports.getLatest = catchAsyncErrors(async (req,res,next) => {
    const user = await User.findOne().sort({createdAt: -1})
    res.status(200).json(user)
})

exports.getPatientByCardNumber = catchAsyncErrors(async (req, res, next) => {
  const { uniqueId } = req.params;
const decodedUniqueId = decodeURIComponent(uniqueId);

console.log('Decoded uniqueId:', decodedUniqueId);

const patient = await User.findOne({ uniqueId: decodedUniqueId });

  if (!patient) {
      return next(new ErrorHandler('Patient not found.', 404));
  }

  // Check if there's an appointment for the patient (optional)
  const appointment = await Appointment.findOne({ user: patient._id })
      .sort({ date: -1 }) // Get the most recent appointment
      .exec();

  res.status(200).json({
      success: true,
      patient,
      appointment: appointment || null, // Null if no appointment exists
  });
});
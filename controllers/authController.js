const User = require('../models/user');
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
      phone, departments, address, school, NHIS, genotype, btype
    } = req.body;
  
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
  
    // Variable to store photo URL
    let photoUrl = null;
  
    if (req.file) {
      try {
        // If file exists, upload to Cloudinary
        const photoResult = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
        );
        photoUrl = photoResult.secure_url;
      } catch (uploadError) {
        console.error('Image upload error', uploadError);
        return res.status(500).json({ message: 'Image upload failed', error: uploadError.message });
      }
    } else {
      // Assign a default photo URL if needed (or leave it null)
      photoUrl = ""; // Replace with your default photo URL
    }
  
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  
    const newUser = await User.create({
      first_name, last_name, email, gender, password: hashedPassword, dob, role, phone,
      departments, address, school, NHIS, genotype, btype,
      photo: photoUrl,
      verificationToken,
      verificationExpire: Date.now() + 24 * 60 * 60 * 1000,
    });
  
    sendToken(newUser, 200, res);
  
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to OJ Hospital</h1>
      </div>
      <div style="padding: 20px;">
        <p>Dear <strong>${newUser.first_name} ${newUser.last_name}</strong>,</p>
        <p>Thank you for choosing OJ Hospital. We're excited to have you onboard!</p>
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
        subject: 'OJ Hospital Verification',
        html,
      });
    } catch (error) {
      console.log('Email failed to send:', error);
    }
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
    // Clear the token from cookies
    res.cookie("token", "", {
        expires: new Date(Date.now()), // Set an expired date
        httpOnly: true, // Ensure it's an HTTP-only cookie
        secure: process.env.NODE_ENV === 'production' // Set secure flag if in production
    });
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
    const resetUrl = `${req.protocol}://localhost:5173/auth/resetPwd/${resetToken}`

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


// exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
//         const updates = { ...req.body }; // Copy all non-file fields

//         // Check if a file (image) is included in the request
//         if (req.file) {
//             // Upload the file to Cloudinary
//             const result = await cloudinary.uploader.upload(
//                 `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
//             );

//             // Add the uploaded image URL to the updates
//             updates.photo = [{ img: result.secure_url }];
//         }

//         // Find and update the user
//         const user = await User.findByIdAndUpdate(req.user.id, updates, {
//             runValidators: true,
//             new: true, // Return the updated user document
//         });

//         res.status(200).json({
//             status: 'success',
//             user,
//         });
   
// });


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
       const users = await User.findById(req.params.id)

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
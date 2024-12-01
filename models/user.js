const mongoose = require('mongoose');
const { isEmail } = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, "Please provide first name"],
        minLength: 3
    },
    last_name: {
        type: String,
        required: [true, "Please provide last name"],
        minLength: 3
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        unique: true,
        validate: [isEmail, "Please provide a valid email"]
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"]
    },
    dob: {
        type: Date,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        select: false
    },
    role: {
        type: String,
        required: true,
        enum: ["doctor", "patient", "admin"],
        default: "patient"
    },
    phone:{
        type:String
    },
    departments:{
        type:String
    },
    address:{
        type:String
    },
    school:{
        type:String
    },
    photo: {
        type: String,
        default: null
    },
    NHIS:{
        type:String
    },
    genotype:String,
    btype:String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
    verificationToken: {
        type: String
    },
    verificationExpire: {
        type: Date
    }
});

// Generate JWT token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRETKEY, {
        expiresIn: process.env.LOGIN_EXPIRES
    });
};

// Generate reset password token
userSchema.methods.getResetToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the reset token
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set the reset token expiration time to 30 minutes
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; 

    return resetToken;
};

// Middleware to remove confirmPassword before saving the user
userSchema.pre('save', function(next) {
    this.confirmPassword = undefined;

    next();
});

module.exports = mongoose.model("User", userSchema);

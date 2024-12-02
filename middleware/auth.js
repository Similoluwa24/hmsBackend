const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const User = require("../models/user");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler('Please log in to access this resource', 401));
    }

    // Verify the token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    } catch (error) {
        return next(new ErrorHandler('Invalid or expired token', 403));
    }

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    req.user = user; // Attach the user to the request
    next();
});

exports.isAdmin = catchAsyncErrors(async (req, res, next) => {
    if (req.user.role !== "admin") {
        return next(new ErrorHandler("You are not authorized to access this resource", 403));
    }
    next();
});

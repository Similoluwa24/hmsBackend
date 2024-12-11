const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const User = require("../models/user");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer '

    if (!token) {
        return next(new ErrorHandler('Please log in to access this resource', 401));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler('Token has expired. Please log in again.', 403));
        }
        return next(new ErrorHandler('Invalid token', 403));
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    req.user = user;
    next();
});



exports.isAdmin = catchAsyncErrors(async (req, res, next) => {
    if (req.user.role !== "admin") {
        return next(new ErrorHandler("You are not authorized to access this resource", 403));
    }
    next();
});

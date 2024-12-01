const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const User = require("../models/user");



// exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
//     // Extract the Authorization header
//     const authHeader = req.headers.user;

//     // Check if the Authorization header is present
//     if (!authHeader || !authHeader.startsWith('Bearer')) {
//         return next(new ErrorHandler('Please Login to Access Resources', 401));
//     }

//     // Extract the token from the Authorization header ('Bearer <token>')
//     const token = authHeader.split(' ')[1]; // Get the token part after 'Bearer'

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);

//     // Find the user associated with the decoded token
//     req.user = await User.findById(decoded.id);

//     // Continue to the next middleware or route handler
//     next();
// });



exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler('Please Login to Access Resources', 401));
    }

    // Log to confirm token existence
    console.log('Token found:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    console.log('Decoded token:', decoded); // Log decoded token data

    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    // Log to confirm user retrieval
    
    req.user = user;
    next();
    console.log('Request User found:', req.user);
});



// exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
//     const { token } = req.cookies;

//     if (!token) {
//         return next(new ErrorHandler('Please Login to Access Resources', 401));
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
//     const user = await User.findById(decoded.id);

//     if (!user) {
//         return next(new ErrorHandler('User not found', 404));
//     }

//     req.user = user; // This should correctly set `req.user`
//     next();
// });


// exports.isAuthenticated = catchAsyncErrors(async (req, res,next) => {
//     const {token} = req.cookies

//     if(!token){
//         return next(new ErrorHandler('Please Login to Access Resources', 401))
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRETKEY)
//     const user = await User.findById(decoded.id)
//     req.user = user

//     next()
// })

exports.isAdmin = catchAsyncErrors(async (req, res, next) => {
    if (req.user.role !== "admin") {
        next(new ErrorHandler("You are not authorized to access this resource"), 400)
    }
    next()
})
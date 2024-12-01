const cloudinaryModule = require('cloudinary').v2
const dotenv = require('dotenv');

dotenv.config()

const cloudinary = cloudinaryModule

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

module.exports = cloudinary
// cloudinaryConfig.js
// const cloudinary = require('cloudinary').v2;
// const dotenv = require('dotenv');

// // Load environment variables from .env file
// dotenv.config();

// // Log environment variables to ensure they are loaded correctly
// console.log('Cloud Name:', process.env.CLOUD_NAME);
// console.log('API Key:', process.env.API_KEY);
// console.log('API Secret:', process.env.API_SECRET);

// // Configure Cloudinary
// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.API_KEY,
//     api_secret: process.env.API_SECRET
// });

// // Log the Cloudinary configuration to check if it's set up properly
// console.log('Cloudinary config:', cloudinary);

// module.exports = cloudinary;
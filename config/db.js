const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config()

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to database");
            
    } catch (error) {
        console.log("Couldn't connect to database");
        
    }
}

module.exports = connectDB
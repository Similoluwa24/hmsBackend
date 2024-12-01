const Contact = require('../models/contact')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const ErrorHandler = require('../utils/errorHandler')

exports.addMessage = catchAsyncErrors(async (req,res) => {
    const {name,email,subject,message} = req.body;

    const messages = await Contact.create({
        name,
        email,
        subject,
        message
    })
    res.status(201)
        .json({
            status:'success',
            messages
        })
})

exports.getAllMessages = catchAsyncErrors(async(req,res)=>{
    const message = await Contact.find()
    res.status(200)
        .json({
            status:"success",
            message
        })
})

exports.deleteMessages = catchAsyncErrors(async(req,res)=>{
    const message = await Contact.findById(req.params.id)
    if (!message) {
        next(new ErrorHandler('Message Not Found'))
    }
    await message.deleteOne()
    res.status(200).json({
        status:"success",
        message:"deleted successful"
    })
})
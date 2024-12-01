const Payment = require('../models/payment');
const Invoice = require('../models/invoice');
const User = require('../models/user');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const mongoose = require('mongoose');


const FLUTTERWAVE_SECRET_KEY =process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

// Initiate payment
exports.initiatePayment =  async (req, res) => {
  try {
    const { invoiceId } = req.body;

    // Retrieve the invoice
    const invoice = await Invoice.findById(invoiceId).populate('patientId');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    //check if payment has already been made
    const alreadyExists = await Payment.findOne({invoiceId:invoiceId})
    if (alreadyExists) {
      return res.status(400).json('This invoice has been paid')
    }
    const transactionReference = `tx-${invoice._id}-${Date.now()}`;

    // Save a pending payment record
    const payment = await Payment.create({
      invoiceId,
      userId: invoice.patientId._id,
      transactionReference,
      amount: invoice.totalCost,
      status: 'Pending',
    });

    // Create the payment payload
    const payload = {
      tx_ref: transactionReference,
      amount: invoice.totalCost,
      currency: 'NGN', // Adjust as necessary
      redirect_url: `${req.protocol}://localhost:5173/user/transactions/${payment._id}`,
    //   http://localhost:5173/thankyou
      customer: {
        email: invoice.patientId.email,
        phonenumber: invoice.patientId.phone,
        name: `${invoice.patientId.firstName} ${invoice.patientId.lastName}`,
      },
      payment_options: 'card,ussd',
    };

    // Send the request to Flutterwave
    const response = await fetch(`${FLUTTERWAVE_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to initiate payment');
    }

    res.status(200).json({
      message: 'Payment link generated successfully',
      paymentLink: data.data.link,
      payment,
    });
  } catch (error) {
    console.error('Error initiating payment:', error.message);
    res.status(500).json({
      message: 'Payment initiation failed',
      error: error.message,
    });
  }
};




exports.verifyPayment =catchAsyncErrors( async (req, res) => {
    const { transaction_id } = req.query;
  
      // Verify the payment
      const response = await fetch(`${FLUTTERWAVE_BASE_URL}/transactions/${transaction_id}/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify payment');
      }
  
      const paymentData = data.data;
  
      // Check if the payment was successful
      if (paymentData.status === 'successful') {
        // Update the payment record
        const payment = await Payment.findOneAndUpdate(
          { transactionReference: paymentData.tx_ref },
          { status: 'Successful', paymentDate: new Date() },
          { new: true }
        );
  
        if (!payment) {
          return res.status(404).json({ message: 'Payment record not found' });
        }
  
        // Update the invoice status
        await Invoice.findByIdAndUpdate(payment.invoiceId, { status: 'paid' });
  
        res.status(200).json({
          message: 'Payment verified successfully',
          payment,
        });
      } else {
        res.status(400).json({ message: 'Payment verification failed', status: paymentData.status });
      }

  });
  
exports.getAllPayments = catchAsyncErrors(async (req,res,next) => {
    const reciepts = await Payment.find().populate('invoiceId').populate('userId')
    res.status(200).json({
        reciepts
    })
})

exports.findbyUserId = catchAsyncErrors(async (req,res,next) => {
    const user = req.user.id
    if (!user) {
        return next(new ErrorHandler('User doesnt exist',400))
    }
    const reciepts = await Payment.find({userId:user}).populate('invoiceId').populate('userId')
    res.status(200).json(reciepts)
})

// exports.adminFind = catchAsyncErrors(async (req,res,next) => {
//     const reciepts = await Payment.findById(req.params.id).populate('invoiceId').populate('userId')
//     res.status(200).json(reciepts)
// })

exports.forAdmin = catchAsyncErrors(async (req, res, next) => {
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) {
    return res.status(400).json({ message: 'Invalid payment ID' });
  }

  const reciepts = await Payment.findById(req.params.id)
    .populate('invoiceId')
    .populate('userId');

  if (!reciepts) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  res.status(200).json(reciepts);
});


exports.getLatestPayment = catchAsyncErrors(async (req, res, next) => {
  const payment = await Payment.findOne()
    .sort({ createdAt: -1, _id: -1 }) // Sort by `createdAt` first, fallback to `_id`
    .populate('userId', 'first_name last_name'); // Populate user details

  if (!payment) {
    return res.status(404).json({ message: 'No payments found' }); // Handle empty database
  }

  res.status(200).json(payment); // Send the latest payment
});


// Get total amount of payments
exports.getTotalPayments = catchAsyncErrors( async (req, res) => {
 
    const total = await Payment.aggregate([
      {
        $group: {
          _id: null, // Group all documents together
          totalAmount: { $sum: "$amount" }, // Replace "amount" with your field name
        },
      },
    ]);

    res.status(200).json({
      message: 'Total payment calculated successfully',
      totalAmount: total[0]?.totalAmount || 0, // Handle case where no payments exist
    });
 
});


  
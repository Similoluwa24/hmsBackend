const Invoice = require('../models/invoice');
const User = require('../models/user')
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const Prescription = require('../models/prescription');

// Create a new invoice
exports.createInvoice = catchAsyncErrors( async (req, res) => {
  
    const { presId, services,patientAddress } = req.body;
    // const patientExist = await User.findById(patientId)
    // if (!patientExist) {
    // //    return next(new ErrorHandler('Patient not Found',404))
    //     res.status(404).json('Patient not Found')
    // }
    const prescription = await Prescription.findById(presId);

    if (!prescription || !prescription.requiresInvoice) {
        return res.status(400).json({ error: 'No pending invoice for this prescription' });
    }
    const totalCost = services.reduce((sum, service) => sum + service.cost, 0);

    const newInvoice = await Invoice.create({
      patientId: prescription.userId,
      services,
      patientAddress:prescription.userId.address,
      totalCost
    });
     // Reset the flag
     prescription.requiresInvoice = false;
     await prescription.save();
    res.status(201).json(newInvoice);
 });





// Get all invoices
exports.getAllInvoices = catchAsyncErrors( async (req, res) => {
 
    const invoices = await Invoice.find().populate('patientId');
    res.status(200).json(invoices);
 
});

// Get a single invoice
exports.getInvoiceById = catchAsyncErrors( async (req, res) => {
    const invoice = await Invoice.findById(req.params.id).populate('patientId');
    if (!invoice) {
      return next(new ErrorHandler('Invoice not found',404 ));
    }
    res.status(200).json(
        {invoice: Array.isArray(invoice) ? invoice : [invoice]}
    );
});

// Update an invoice
exports.updateInvoice =catchAsyncErrors( async (req, res) => {
 
    const { status } = req.body;
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedInvoice) {
        return next(new ErrorHandler('Invoice not found',404 ));
    }

    res.status(200).json(updatedInvoice);
 
});

// Delete an invoice
exports.deleteInvoice = catchAsyncErrors( async (req, res) => {
  
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
        return next(new ErrorHandler('Invoice not found',404 ));
    }
    res.status(200).json({ message: 'Invoice deleted successfully' });
 
});

//find invoice by userID

exports.findInvoiceByUserId = catchAsyncErrors(async (req,res,next) => {
    const userId = req.user.id
    if (!userId) {
        return next(new ErrorHandler('This User not found',404))
    }
    const invoice = await Invoice.find({patientId:userId}).populate('patientId')

    
    res.status(200).json({
        invoice: Array.isArray(invoice) ? invoice :[invoice]
    })
})


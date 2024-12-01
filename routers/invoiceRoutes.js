const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const {isAuthenticated} = require('../middleware/auth')

const router = express.Router();

router.post('/add',isAuthenticated, invoiceController.createInvoice);
router.get('/admin',isAuthenticated, invoiceController.getAllInvoices);
router.get('/admin/:id',isAuthenticated, invoiceController.getInvoiceById);
router.put('/admin/:id',isAuthenticated, invoiceController.updateInvoice);
router.delete('/admin/:id',isAuthenticated, invoiceController.deleteInvoice);
router.get('/user',isAuthenticated, invoiceController.findInvoiceByUserId)

module.exports = router;

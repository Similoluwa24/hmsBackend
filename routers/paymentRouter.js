const express = require('express');
const { initiatePayment, verifyPayment,getAllPayments, findbyUserId,forAdmin ,getLatestPayment, getTotalPayments} = require('../controllers/paymentController');
const router = express.Router();
const {isAuthenticated} = require('../middleware/auth')

// Initiate payment
router.post('/initiate',isAuthenticated, initiatePayment);

// Verify payment
router.get('/verify-payment',isAuthenticated, verifyPayment);

router.get('/pay', isAuthenticated, getLatestPayment)

router.get('/total-payments', getTotalPayments);

router.get('/',isAuthenticated, getAllPayments);
router.get('/me',isAuthenticated, findbyUserId);
router.get('/:id',isAuthenticated, forAdmin);

module.exports = router;

const express = require('express');
const router = express.Router()
const prescriptionController = require('../controllers/prescriptionController')
const {isAuthenticated} = require('../middleware/auth')
router.post('/add', isAuthenticated,prescriptionController.addPrescription)
router.get('/',isAuthenticated, prescriptionController.findPrescription)
router.get('/doctor',isAuthenticated, prescriptionController.findPrescriptionByDoctorId)
router.get('/user',isAuthenticated, prescriptionController.findPrescriptionByPatientId)
router.delete('/delete/:id',prescriptionController.deletePrescription)
router.put('/edit/:id',prescriptionController.editPrescription)
router.get('/pending', isAuthenticated, prescriptionController.getPendingInvoices)
router.get('/:id', isAuthenticated, prescriptionController.findPrescriptionById)

module.exports = router
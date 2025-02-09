const express = require('express');
const router = express.Router()
const pharmacyController = require('../controllers/pharmacyController') 
const {isAuthenticated} = require('../middleware/auth')

router.post('/add',isAuthenticated, pharmacyController.createPharmacyRecord)
 router.get('/meds', pharmacyController.getMedication)
 router.get('/:id',pharmacyController.getPharmacyById); // Get a specific record
 router.put('/:id', pharmacyController.updatePharmacyRecord); // Update a record
 router.delete('/:id', pharmacyController.deletePharmacyRecord); // Delete a record

module.exports = router
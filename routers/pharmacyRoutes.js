const express = require('express');
const router = express.Router()
const pharmacyController = require('../controllers/pharmacyController') 

router.post('/add', pharmacyController.addMedications)
router.get('/meds', pharmacyController.fetchMedications)
router.delete('/delete/:id', pharmacyController.deleteMedications)
router.put('/edit/:id', pharmacyController.updateMedications)

module.exports = router
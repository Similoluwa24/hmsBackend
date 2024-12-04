const express = require('express');
const router = express.Router()
const vitalController = require('../controllers/vitalsController')
const {isAuthenticated} = require('../middleware/auth')

router.post('/add', isAuthenticated, vitalController.addVitals)
router.get('/view',isAuthenticated, vitalController.getByUserId)
router.get('/latest',isAuthenticated, vitalController.getLatest)
router.get('/:id',isAuthenticated,vitalController.getById)
router.get('/me', isAuthenticated, vitalController.getVitalsByUserId)

module.exports = router
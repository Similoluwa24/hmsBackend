const express = require('express');
const router = express.Router()
const vitalController = require('../controllers/vitalsController')
const {isAuthenticated} = require('../middleware/auth')

router.post('/add', isAuthenticated, vitalController.addVitals)

module.exports = router
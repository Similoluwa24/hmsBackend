const express = require('express');
const router = express.Router()
const vitalController = require('../controllers/vitalsController')
const {isAuthenticated} = require('../middleware/auth')

router.post('/add', isAuthenticated, vitalController.addVitals)
router.get('/latest',isAuthenticated, vitalController.getLatest)
router.get('/:id',isAuthenticated,vitalController.getById)
router.get('/view', vitalController.getbyUserId)

module.exports = router
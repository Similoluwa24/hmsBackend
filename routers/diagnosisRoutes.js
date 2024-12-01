const express = require ('express')
const route = express.Router()
const {isAuthenticated} = require('../middleware/auth')
const diagnosisController = require('../controllers/diagnosisController')

route.post('/add',isAuthenticated, diagnosisController.addDiagnosis)
route.delete('/delete/:id',isAuthenticated, diagnosisController.deleteDiagnosis)
route.get('/admin',isAuthenticated, diagnosisController.findDiagnosis)
route.get('/user',isAuthenticated, diagnosisController.findByUserId)
route.get('/doctor',isAuthenticated, diagnosisController.findByDoctorId)


module.exports = route
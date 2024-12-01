const express = require('express');
const route = express.Router()
const appointmentControllers = require('../controllers/appointmentControllers')
const {isAuthenticated} = require('../middleware/auth')

route.post('/add',isAuthenticated,appointmentControllers.createAppointment)
route.put('/edit/:id',isAuthenticated,appointmentControllers.editAppointment)
route.delete('/delete/:id',isAuthenticated,appointmentControllers.deleteAppointment)
route.get('/admin',appointmentControllers.findAppointment)
route.get('/get',isAuthenticated,appointmentControllers.findAppointmentByUserId)
route.get('/doctor',isAuthenticated, appointmentControllers.getAppointmentsByDoctor);
route.get('/latest',isAuthenticated, appointmentControllers.getLatestAppointment);

module.exports = route
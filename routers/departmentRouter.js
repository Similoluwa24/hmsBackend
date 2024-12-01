const express = require('express');
const departmentControllers = require('../controllers/departmentControllers');
router = express.Router()

router.post('/add',departmentControllers.addDepartment)
router.get('/admin/get',departmentControllers.getDepartment)
router.delete('/delete/:id',departmentControllers.deleteDepartment)
router.put('/edit/:id',departmentControllers.editDepartment)

module.exports = router
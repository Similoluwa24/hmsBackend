const express = require('express');
const router = express.Router()
const inventoryControllers = require('../controllers/inventoryControllers')

router.get('/admin/get',inventoryControllers.getInventory)
router.post('/add',inventoryControllers.addInventory)
router.delete('/delete/:id',inventoryControllers.deleteInventory)
router.put('/edit/:id',inventoryControllers.updateInventory)

module.exports = router
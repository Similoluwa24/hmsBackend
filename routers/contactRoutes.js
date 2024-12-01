const express = require('express');
const router = express.Router()
const contactController = require('../controllers/contactController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/add',contactController.addMessage)
router.get('/all', isAuthenticated,contactController.getAllMessages)
router.get('/delete',isAuthenticated, contactController.deleteMessages)

module.exports = router
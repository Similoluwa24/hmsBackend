const express = require('express');
const router = express.Router()
const authController = require('../controllers/authController');
const {isAuthenticated, isAdmin} = require('../middleware/auth')
const multer = require('multer')

const storage = multer.memoryStorage()
const uploads = multer({storage:storage})

router.post('/signup', uploads.single('photo'), authController.signup);
router.post("/login", authController.login)
router.get("/logout", authController.logout)
router.post("/forgotpwd", authController.forgotPassword)
router.put("/resetpwd/:token", authController.resetPassword)
router.get("/admin", authController.getAllUsers)
router.get("/admin/:id",isAuthenticated,isAdmin, authController.getUserbyId)
router.get("/me",isAuthenticated, authController.getUserProfile)
router.put("/updatepwd",isAuthenticated, authController.updatePassword)
router.put("/updateprofile",isAuthenticated,uploads.single('photo'), authController.updateProfile)
router.put("/admin/update/:id",isAuthenticated,uploads.single('photo'),isAdmin, authController.updateProfileAdmin)
router.delete('/delete/:id',authController.deleteUser)
router.get('/api/v1/test-auth', isAuthenticated, authController.checkMiddleware);
router.get('/latest', authController.getLatest)

module.exports = router
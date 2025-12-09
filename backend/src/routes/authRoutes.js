const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', upload.single('logo'), authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, upload.single('logo'), authController.updateProfile);
router.delete('/profile', auth, authController.deleteProfile);

module.exports = router;
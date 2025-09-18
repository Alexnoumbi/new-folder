const express = require('express');
const router = express.Router();
const {
    login,
    register,
    logout,
    getMe,
    updatePassword,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const auth = require('../middleware/auth');

// Routes publiques
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Routes protégées
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.put('/update-password', auth, updatePassword);

module.exports = router;

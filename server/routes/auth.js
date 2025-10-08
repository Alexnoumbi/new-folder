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

// Toutes les routes publiques (pas d'authentification requise)
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/update-password', updatePassword);

module.exports = router;

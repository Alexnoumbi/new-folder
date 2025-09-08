const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configuration du limiteur de tentatives
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limite à 5 tentatives
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.'
});

// Validation pour l'inscription
const registerValidation = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('prenom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Veuillez entrer un email valide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
];

// Routes publiques
router.post('/register', registerValidation, register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Routes protégées
router.use(auth); // Middleware d'authentification pour les routes suivantes
router.get('/me', getMe);
router.post('/logout', logout);
router.put('/update-password', updatePassword);

module.exports = router;

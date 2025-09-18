const express = require('express');
const { body, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');

const router = express.Router();

// Validation pour la création d'utilisateur
const validationUser = [
  body('nom')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

// Routes de profil utilisateur
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

// Routes des utilisateurs
router.get('/', auth, getUsers);
router.get('/:id', auth, getUserById);
router.post('/', auth, validationUser, createUser);
router.put('/:id', auth, validationUser, updateUser);
router.delete('/:id', auth, deleteUser);

module.exports = router;

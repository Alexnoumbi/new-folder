const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  convertToEnterprise
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

// Routes de profil utilisateur (accessibles sans authentification)
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Routes des utilisateurs
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', validationUser, createUser);
router.put('/:id', validationUser, updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/convert-to-enterprise', convertToEnterprise);

module.exports = router;

const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
    const { search, role, typeCompte } = req.query;

    let query = {};

    // Ajouter le filtre de recherche
    if (search) {
        query.$or = [
            { nom: { $regex: search, $options: 'i' } },
            { prenom: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Ajouter le filtre de rôle
    if (role) {
        query.role = role;
    }

    // Ajouter le filtre de type de compte
    if (typeCompte) {
        query.typeCompte = typeCompte;
    }

    const users = await User.find(query).select('-password');
    res.json(users);
});

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
});

// @desc    Créer un utilisateur
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res) => {
    const { nom, prenom, email, role, typeCompte, telephone, entrepriseId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);

    const user = await User.create({
        nom,
        prenom,
        email,
        password: tempPassword, // Ceci doit être hashé par le middleware pre-save du modèle User
        role,
        typeCompte,
        telephone,
        entrepriseId,
        status: 'active'
    });

    if (user) {
        // TODO: Envoyer un email avec le mot de passe temporaire
        res.status(201).json({
            _id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            typeCompte: user.typeCompte,
            telephone: user.telephone,
            entrepriseId: user.entrepriseId,
            status: user.status
        });
    } else {
        res.status(400);
        throw new Error('Données utilisateur invalides');
    }
});

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.nom = req.body.nom || user.nom;
        user.prenom = req.body.prenom || user.prenom;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.typeCompte = req.body.typeCompte || user.typeCompte;
        user.telephone = req.body.telephone || user.telephone;
        user.entrepriseId = req.body.entrepriseId || user.entrepriseId;
        user.status = req.body.status || user.status;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            nom: updatedUser.nom,
            prenom: updatedUser.prenom,
            email: updatedUser.email,
            role: updatedUser.role,
            typeCompte: updatedUser.typeCompte,
            telephone: updatedUser.telephone,
            entrepriseId: updatedUser.entrepriseId,
            status: updatedUser.status
        });
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
});

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'Utilisateur supprimé' });
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
});

// @desc    Obtenir le profil de l'utilisateur
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        res.json({
            _id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            typeCompte: user.typeCompte,
            telephone: user.telephone,
            entrepriseId: user.entrepriseId,
            status: user.status,
            adresse: user.adresse,
            ville: user.ville,
            pays: user.pays,
            codePostal: user.codePostal,
            avatar: user.avatar,
            description: user.description
        });
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
});

// @desc    Mettre à jour le profil de l'utilisateur
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.nom = req.body.nom || user.nom;
        user.prenom = req.body.prenom || user.prenom;
        user.email = req.body.email || user.email;
        user.telephone = req.body.telephone || user.telephone;
        user.adresse = req.body.adresse || user.adresse;
        user.ville = req.body.ville || user.ville;
        user.pays = req.body.pays || user.pays;
        user.codePostal = req.body.codePostal || user.codePostal;
        user.avatar = req.body.avatar || user.avatar;
        user.description = req.body.description || user.description;

        // Mettre à jour le mot de passe si fourni
        if (req.body.currentPassword && req.body.newPassword) {
            const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isMatch) {
                res.status(400);
                throw new Error('Mot de passe actuel incorrect');
            }
            user.password = req.body.newPassword;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            nom: updatedUser.nom,
            prenom: updatedUser.prenom,
            email: updatedUser.email,
            role: updatedUser.role,
            typeCompte: updatedUser.typeCompte,
            telephone: updatedUser.telephone,
            entrepriseId: updatedUser.entrepriseId,
            status: updatedUser.status,
            adresse: updatedUser.adresse,
            ville: updatedUser.ville,
            pays: updatedUser.pays,
            codePostal: updatedUser.codePostal,
            avatar: updatedUser.avatar,
            description: updatedUser.description
        });
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
});

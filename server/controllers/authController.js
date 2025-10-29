const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Entreprise = require('../models/Entreprise');
const { logAuth, logAudit } = require('../utils/auditLogger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, nom, prenom, role = 'user', typeCompte = 'entreprise', telephone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    let entrepriseId = undefined;

    // Si compte entreprise, créer une fiche Entreprise minimale (valeurs par défaut conformes au schéma)
    if (typeCompte === 'entreprise') {
      const tmpNumero = `TMP-${Date.now()}`;
      const entreprise = await Entreprise.create({
        identification: {
          nomEntreprise: `${prenom || ''} ${nom || ''}`.trim() || email.split('@')[0],
          raisonSociale: '',
          region: 'Centre',
          ville: 'Yaoundé',
          dateCreation: new Date(),
          secteurActivite: 'Tertiaire',
          sousSecteur: 'Autres',
          filiereProduction: '',
          formeJuridique: 'EI',
          numeroContribuable: tmpNumero
        },
        contact: {
          email
        },
        investissementEmploi: {
          effectifsEmployes: 0
        },
        statut: 'En attente',
        description: ''
      });
      entrepriseId = entreprise._id;
    }

    // Create user (map password -> motDePasse)
    const user = await User.create({
      email,
      motDePasse: password,
      nom,
      prenom,
      role,
      typeCompte,
      telephone,
      entrepriseId
    });

    // Log l'inscription
    await logAudit({
      user,
      action: 'CREATE',
      entityType: 'USER',
      entityId: user._id,
      details: { typeCompte, role, email },
      req,
      status: 'success'
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          typeCompte: user.typeCompte,
          telephone: user.telephone,
          entrepriseId: user.entrepriseId || null,
          avatar: user.avatar,
          status: user.status
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    const user = await User.findOne({ email }).select('+motDePasse');
    if (!user) {
      console.log('Login failed: user not found');
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    console.log(`User found for login: id=${user._id}, typeCompte=${user.typeCompte}, role=${user.role}`);

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.motDePasse);
    if (!isMatch) {
      console.log('Login failed: invalid password');
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Déterminer le dashboard approprié
    let dashboard = '';
    switch(user.typeCompte) {
      case 'admin':
        dashboard = '/admin/dashboard';
        break;
      case 'entreprise':
        dashboard = '/enterprise/dashboard';
        break;
      default:
        dashboard = '/dashboard';
    }

    // Log la connexion réussie
    await logAuth(user, 'LOGIN', req, true);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          typeCompte: user.typeCompte,
          entrepriseId: user.entrepriseId,
          telephone: user.telephone,
          avatar: user.avatar,
          status: user.status
        },
        dashboard
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Log la déconnexion
    if (req.user) {
      await logAuth(req.user, 'LOGOUT', req, true);
    }
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+motDePasse');

    const isMatch = await bcrypt.compare(currentPassword, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    user.motDePasse = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du mot de passe'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur trouvé avec cet email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.tokenResetMotDePasse = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.dateExpirationReset = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    res.json({
      success: true,
      message: 'Instructions de réinitialisation envoyées par email',
      resetToken // In production, send this via email instead
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande de réinitialisation'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      tokenResetMotDePasse: resetPasswordToken,
      dateExpirationReset: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    user.motDePasse = password;
    user.tokenResetMotDePasse = undefined;
    user.dateExpirationReset = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword
};

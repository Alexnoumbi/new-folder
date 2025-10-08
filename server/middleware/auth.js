const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const email = req.headers['x-user-email'];

    if (!email) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(401).json({ message: 'Erreur d\'authentification' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!roles.includes(req.user.typeCompte)) {
      return res.status(403).json({ 
        message: 'Accès refusé - Privilèges insuffisants',
        required: roles,
        current: req.user.typeCompte
      });
    }

    next();
  };
};

// Backward compatibility
const auth = protect;

module.exports = { protect, authorize, auth };

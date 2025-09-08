const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // For login route, skip authentication
    if (req.path === '/login') {
      return next();
    }

    // For other protected routes, verify user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Utilisateur non trouvé'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Non autorisé - Erreur d\'authentification'
    });
  }
};

// Authorization middleware helper
const authorize = (allowedRoles) => {
  // normalize single role to array
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userRole = (req.user.role || '').toString().toLowerCase();

    const isAllowed = rolesArray.some(r => {
      if (!r) return false;
      return r.toString().toLowerCase() === userRole;
    });

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Insufficient role',
        required: rolesArray,
        current: req.user.role
      });
    }

    next();
  };
};

module.exports = { auth, authorize };

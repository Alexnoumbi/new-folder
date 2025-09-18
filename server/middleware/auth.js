const User = require('../models/User');

const auth = async (req, res, next) => {
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

module.exports = auth;

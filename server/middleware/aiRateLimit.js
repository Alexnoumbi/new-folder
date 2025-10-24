const rateLimit = require('express-rate-limit');

// Rate limiting spécialisé pour les requêtes IA
const createAIRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes par défaut
    max: 30, // 30 requêtes par défaut
    message: {
      success: false,
      message: 'Trop de requêtes IA. Veuillez patienter avant de réessayer.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip pour les tests ou en développement
      return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
    },
    keyGenerator: (req) => {
      // Utiliser l'email utilisateur si disponible, sinon l'IP
      return req.user?.email || req.ip;
    },
    onLimitReached: (req, res, options) => {
      console.warn(`Rate limit atteint pour ${req.user?.email || req.ip} sur l'API IA`);
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Rate limiting pour les admins (plus permissif)
const adminAIRateLimit = createAIRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Plus de requêtes pour les admins
  message: {
    success: false,
    message: 'Limite de requêtes IA admin atteinte. Veuillez patienter.',
    retryAfter: '15 minutes'
  }
});

// Rate limiting pour les entreprises
const enterpriseAIRateLimit = createAIRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Moins de requêtes pour les entreprises
  message: {
    success: false,
    message: 'Limite de requêtes IA entreprise atteinte. Veuillez patienter.',
    retryAfter: '15 minutes'
  }
});

// Rate limiting pour l'escalade (très restrictif)
const escalationRateLimit = createAIRateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // Maximum 3 escalades par heure
  message: {
    success: false,
    message: 'Limite d\'escalades atteinte. Veuillez attendre avant d\'escalader une nouvelle demande.',
    retryAfter: '1 heure'
  }
});

// Rate limiting pour les statistiques
const statsRateLimit = createAIRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requêtes de stats par 5 minutes
  message: {
    success: false,
    message: 'Limite de requêtes de statistiques atteinte.',
    retryAfter: '5 minutes'
  }
});

module.exports = {
  createAIRateLimit,
  adminAIRateLimit,
  enterpriseAIRateLimit,
  escalationRateLimit,
  statsRateLimit
};

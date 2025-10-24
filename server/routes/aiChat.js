const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const aiChatController = require('../controllers/aiChatController');
const aiService = require('../utils/aiService');

// Middleware de rate limiting spécifique pour l'IA
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limite par IP
  message: {
    success: false,
    message: 'Trop de requêtes IA. Veuillez patienter avant de réessayer.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting plus strict pour les admins (accès DB)
const adminAIRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Plus de requêtes pour les admins
  message: {
    success: false,
    message: 'Limite de requêtes IA admin atteinte. Veuillez patienter.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation des messages
const messageValidation = [
  body('message')
    .isString()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Le message doit contenir entre 1 et 2000 caractères')
    .custom((value) => {
      // Vérifier qu'il n'y a pas de contenu malveillant
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /eval\(/i,
        /expression\(/i
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(value))) {
        throw new Error('Contenu du message non autorisé');
      }
      
      return true;
    }),
  body('conversationId')
    .optional()
    .isMongoId()
    .withMessage('ID de conversation invalide')
];

const escalationValidation = [
  body('conversationId')
    .isMongoId()
    .withMessage('ID de conversation invalide'),
  body('details')
    .isString()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Les détails doivent contenir entre 10 et 1000 caractères')
];

// Route de santé pour vérifier le statut de l'IA (sans auth)
router.get('/health', async (req, res) => {
  const aiService = require('../utils/aiService');
  const aiKnowledgeBase = require('../utils/aiKnowledgeBase');
  const axios = require('axios');
  
  // Vérifier si Open WebUI est accessible
  let openwebuiStatus = 'unknown';
  try {
    const healthUrl = `${process.env.OPENWEBUI_BASE_URL || 'https://your-openwebui-domain.com'}/health`;
    const response = await axios.get(healthUrl, { timeout: 10000 });
    openwebuiStatus = response.status === 200 ? 'online' : 'offline';
  } catch (error) {
    openwebuiStatus = 'offline';
    console.warn(`⚠️ Open WebUI non accessible: ${error.message}`);
  }
  
  res.json({
    success: true,
    data: {
      aiService: {
        provider: 'openwebui',
        configured: true,
        model: process.env.AI_MODEL_NAME || 'impact',
        openwebuiUrl: process.env.OPENWEBUI_BASE_URL || 'https://your-openwebui-domain.com',
        openwebuiStatus
      },
      knowledgeBase: {
        loaded: aiKnowledgeBase.knowledgeBase.size > 0,
        entries: aiKnowledgeBase.knowledgeBase.size
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Routes protégées par authentification
router.use(auth);

// Routes pour les messages IA
router.post('/admin/message', 
  adminAIRateLimit,
  messageValidation,
  aiChatController.sendAdminMessage
);

router.post('/enterprise/message',
  aiRateLimit,
  messageValidation,
  aiChatController.sendEnterpriseMessage
);

// Route SSE: stream de réponse en direct depuis Open WebUI
router.post('/stream', aiRateLimit, messageValidation, async (req, res) => {
  try {
    // Forcer SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    const { message } = req.body;
    const user = req.user;

    // Construire le contexte minimum (pas de DB ici pour simplicité streaming)
    const systemPrompt = aiService.getSystemPrompt(user?.typeCompte === 'admin' ? 'admin' : 'entreprise', {});
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    await aiService.streamOpenWebUI(messages, (delta) => {
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Erreur streaming Open WebUI:', error);
    // En cas d'erreur, envoyer un message SSE d'erreur
    try {
      res.write(`data: ${JSON.stringify({ error: 'Streaming interrompu' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (_) {}
  }
});

// Routes pour la gestion des conversations
router.get('/conversations',
  aiRateLimit,
  aiChatController.getConversations
);

router.get('/conversations/:id',
  aiRateLimit,
  aiChatController.getConversationDetails
);

router.delete('/conversations/:id',
  aiRateLimit,
  aiChatController.deleteConversation
);

// Route pour l'escalade (entreprises uniquement)
router.post('/enterprise/escalate',
  aiRateLimit,
  escalationValidation,
  aiChatController.escalateToAdmin
);

// Route pour les statistiques (admins uniquement)
router.get('/stats',
  aiRateLimit,
  aiChatController.getAIStats
);


module.exports = router;

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const EnhancedSimpleAssistantController = require('../controllers/enhancedSimpleAssistantController');

// Instancier le contrôleur
const enhancedController = new EnhancedSimpleAssistantController();

// Middleware d'authentification pour toutes les routes
router.use(auth);

/**
 * @route POST /api/enhanced-assistant/ask
 * @desc Poser une question à l'assistant amélioré
 * @access Private
 */
router.post('/ask', async (req, res) => {
  await enhancedController.askQuestion(req, res);
});

/**
 * @route GET /api/enhanced-assistant/stats
 * @desc Obtenir les statistiques du service
 * @access Private
 */
router.get('/stats', async (req, res) => {
  await enhancedController.getStats(req, res);
});

/**
 * @route POST /api/enhanced-assistant/reload
 * @desc Recharger la base de connaissances
 * @access Private (Admin only)
 */
router.post('/reload', async (req, res) => {
  // Vérifier que l'utilisateur est admin
  if (req.user?.typeCompte !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé - Administrateur requis'
    });
  }
  
  await enhancedController.reloadKnowledge(req, res);
});

/**
 * @route GET /api/enhanced-assistant/search
 * @desc Rechercher dans la base de connaissances
 * @access Private
 */
router.get('/search', async (req, res) => {
  await enhancedController.searchKnowledge(req, res);
});

/**
 * @route GET /api/enhanced-assistant/health
 * @desc Health check du service
 * @access Private
 */
router.get('/health', async (req, res) => {
  await enhancedController.healthCheck(req, res);
});

module.exports = router;

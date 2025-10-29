/**
 * Routes pour le système IA hybride
 * Remplace simpleAI.js avec des fonctionnalités étendues
 */

const express = require('express');
const router = express.Router();
const hybridAIController = require('../controllers/hybridAIController');
const { auth } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(auth);

// Routes OCR (identiques à simpleAI)
router.post('/ocr/extract', 
    hybridAIController.uploadSingle(), 
    hybridAIController.extractTextFromImage
);

router.post('/ocr/batch', 
    hybridAIController.uploadMultiple(), 
    hybridAIController.processBatchOCR
);

router.post('/ocr/analyze', hybridAIController.quickAnalyze);

// Routes Questions/Réponses hybrides (NOUVELLES)
router.post('/qa/ask', hybridAIController.askHybridQuestion);

// Routes Requêtes base de données (identiques)
router.post('/db/query', hybridAIController.queryDatabase);
router.get('/db/suggestions', hybridAIController.getSuggestions);

// Routes de monitoring et administration (NOUVELLES)
router.get('/status', hybridAIController.getStatus);
router.get('/metrics', hybridAIController.getMetrics);

// Routes d'administration (NOUVELLES)
router.post('/admin/reload-knowledge', hybridAIController.reloadKnowledgeBase);
router.post('/admin/test-performance', hybridAIController.testPerformance);

module.exports = router;

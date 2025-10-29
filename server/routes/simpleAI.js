/**
 * Routes pour les services IA simples
 * OCR + Questions/Réponses + Requêtes base de données
 */

const express = require('express');
const router = express.Router();
const simpleAIController = require('../controllers/simpleAIController');
const { auth } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(auth);

// Routes OCR
router.post('/ocr/extract', 
    simpleAIController.uploadSingle(), 
    simpleAIController.extractTextFromImage
);

router.post('/ocr/batch', 
    simpleAIController.uploadMultiple(), 
    simpleAIController.processBatchOCR
);

router.post('/ocr/analyze', simpleAIController.quickAnalyze);

// Routes Questions/Réponses
router.post('/qa/ask', simpleAIController.askQuestion);

// Routes Requêtes base de données
router.post('/db/query', simpleAIController.queryDatabase);
router.get('/db/suggestions', simpleAIController.getSuggestions);

// Route statut
router.get('/status', simpleAIController.getStatus);

module.exports = router;

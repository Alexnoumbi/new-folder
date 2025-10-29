/**
 * Routes pour l'assistant IA optimisé
 * Version améliorée avec cache, compression et monitoring
 */

const express = require('express');
const router = express.Router();
const OptimizedAssistantController = require('../controllers/optimizedAssistantController');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Instanciation du contrôleur
const optimizedAssistantController = new OptimizedAssistantController();

// Rate limiting spécifique aux assistants
const assistantRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requêtes par minute par utilisateur
    message: {
        success: false,
        error: 'Trop de questions posées. Veuillez patienter une minute.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const adminRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Plus de requêtes pour les admins
    message: {
        success: false,
        error: 'Trop de requêtes administratives. Veuillez patienter.'
    }
});

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Middleware de compression pour optimiser les réponses
router.use(optimizedAssistantController.compress());

// ====== ROUTES PRINCIPALES ======

// Question principale (avec rate limiting)
router.post('/ask', 
    assistantRateLimit,
    optimizedAssistantController.askQuestion.bind(optimizedAssistantController)
);

// Suggestions contextuelles
router.get('/suggestions', 
    optimizedAssistantController.getSuggestions.bind(optimizedAssistantController)
);

// Statut du service
router.get('/status', 
    optimizedAssistantController.getServiceStatus.bind(optimizedAssistantController)
);

// Métriques de performance
router.get('/metrics', 
    optimizedAssistantController.getMetrics.bind(optimizedAssistantController)
);

// Test de santé
router.get('/health', 
    optimizedAssistantController.healthCheck.bind(optimizedAssistantController)
);

// ====== ROUTES ADMINISTRATIVES ======

// Rechargement de la base de connaissances (admin uniquement)
router.post('/admin/reload-knowledge', 
    adminRateLimit,
    optimizedAssistantController.reloadKnowledge.bind(optimizedAssistantController)
);

// ====== ROUTES DE FICHIERS ======

// Upload de fichier unique pour analyse
router.post('/upload/single',
    assistantRateLimit,
    optimizedAssistantController.uploadSingle(),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Aucun fichier fourni'
                });
            }

            // TODO: Implémenter l'analyse de fichier avec l'assistant
            res.json({
                success: true,
                message: 'Fichier reçu avec succès',
                filename: req.file.originalname,
                size: req.file.size,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur upload fichier:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors du traitement du fichier'
            });
        }
    }
);

// Upload de fichiers multiples
router.post('/upload/multiple',
    assistantRateLimit,
    optimizedAssistantController.uploadMultiple(),
    async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Aucun fichier fourni'
                });
            }

            const files = req.files.map(file => ({
                originalname: file.originalname,
                size: file.size,
                mimetype: file.mimetype
            }));

            // TODO: Implémenter l'analyse de fichiers multiples
            res.json({
                success: true,
                message: `${req.files.length} fichier(s) reçu(s) avec succès`,
                files: files,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur upload fichiers multiples:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors du traitement des fichiers'
            });
        }
    }
);

// ====== ROUTES DE DEBUG (développement uniquement) ======

if (process.env.NODE_ENV === 'development') {
    // Cache info pour debug
    router.get('/debug/cache', (req, res) => {
        if (req.user?.typeCompte !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès admin requis' 
            });
        }

        const stats = optimizedAssistantController.qaService.getServiceStats();
        
        res.json({
            success: true,
            debug: {
                cache: stats.cacheStats,
                service: stats.serviceMode,
                performance: {
                    totalQuestions: stats.totalQuestions,
                    averageResponseTime: stats.averageResponseTime,
                    successRate: stats.successRate
                }
            }
        });
    });

    // Reset des métriques (développement)
    router.post('/debug/reset-metrics', (req, res) => {
        if (req.user?.typeCompte !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès admin requis' 
            });
        }

        // Reset des métriques
        optimizedAssistantController.qaService.metrics = {
            totalQuestions: 0,
            rulesSuccess: 0,
            embeddingsSuccess: 0,
            cacheHits: 0,
            failures: 0,
            averageResponseTime: 0,
            lastResponse: null,
            errorRate: 0,
            serviceStatus: optimizedAssistantController.qaService.metrics.serviceStatus
        };

        res.json({
            success: true,
            message: 'Métriques réinitialisées',
            timestamp: new Date()
        });
    });
}

// ====== GESTION D'ERREURS ======

// Middleware de gestion d'erreurs pour les routes d'assistant
router.use((error, req, res, next) => {
    console.error('Erreur route assistant:', error);
    
    // Erreurs de multer (upload)
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                success: false,
                error: 'Fichier trop volumineux (limite: 15MB)'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(413).json({
                success: false,
                error: 'Trop de fichiers (limite: 5)'
            });
        }
    }

    // Erreur générique
    res.status(500).json({
        success: false,
        error: 'Erreur interne du service assistant',
        timestamp: new Date()
    });
});

module.exports = router;

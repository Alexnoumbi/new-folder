/**
 * Routes pour les assistants IA avancés
 * Endpoints spécialisés pour admin et entreprise
 */

const express = require('express');
const router = express.Router();

// Import des contrôleurs avancés
const AdvancedAdminAssistantController = require('../controllers/advancedAdminAssistantController');
const PersonalizedEnterpriseAssistantController = require('../controllers/personalizedEnterpriseAssistantController');
const OptimizedAssistantController = require('../controllers/optimizedAssistantController');

// Import du middleware d'authentification
const { auth } = require('../middleware/auth');

// Instanciation des contrôleurs
const adminController = new AdvancedAdminAssistantController();
const enterpriseController = new PersonalizedEnterpriseAssistantController();
const optimizedController = new OptimizedAssistantController();

// Middleware d'authentification pour toutes les routes
router.use(auth);

/**
 * Routes pour l'assistant administrateur avancé
 */
router.post('/admin/ask', async (req, res) => {
    await adminController.processAdminQuestion(req, res);
});

router.get('/admin/stats', async (req, res) => {
    try {
        if (req.user?.typeCompte !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès administrateur requis' 
            });
        }

        const stats = adminController.getStats();
        res.json({
            success: true,
            stats,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur récupération statistiques admin'
        });
    }
});

router.get('/admin/capabilities', async (req, res) => {
    try {
        if (req.user?.typeCompte !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès administrateur requis' 
            });
        }

        res.json({
            success: true,
            capabilities: adminController.adminCapabilities,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur récupération capacités admin'
        });
    }
});

/**
 * Routes pour l'assistant entreprise personnalisé
 */
router.post('/enterprise/ask', async (req, res) => {
    await enterpriseController.processEnterpriseQuestion(req, res);
});

router.get('/enterprise/profile', async (req, res) => {
    try {
        if (req.user?.typeCompte !== 'entreprise') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès entreprise requis' 
            });
        }

        const profile = await enterpriseController.getUserProfile(
            req.user.id, 
            req.user.entrepriseId
        );
        
        res.json({
            success: true,
            profile,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur récupération profil entreprise'
        });
    }
});

router.get('/enterprise/suggestions', async (req, res) => {
    try {
        if (req.user?.typeCompte !== 'entreprise') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès entreprise requis' 
            });
        }

        const suggestions = await enterpriseController.generatePersonalizedSuggestions(
            await enterpriseController.getUserProfile(req.user.id, req.user.entrepriseId),
            req.user.entrepriseId
        );
        
        res.json({
            success: true,
            suggestions,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur génération suggestions entreprise'
        });
    }
});

router.get('/enterprise/stats', async (req, res) => {
    try {
        if (req.user?.typeCompte !== 'entreprise') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès entreprise requis' 
            });
        }

        const stats = enterpriseController.getStats();
        res.json({
            success: true,
            stats,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur récupération statistiques entreprise'
        });
    }
});

/**
 * Routes pour l'assistant optimisé (fallback)
 */
router.post('/optimized/ask', async (req, res) => {
    await optimizedController.askQuestion(req, res);
});

router.get('/optimized/status', async (req, res) => {
    await optimizedController.getStatus(req, res);
});

router.get('/optimized/metrics', async (req, res) => {
    await optimizedController.getMetrics(req, res);
});

router.post('/optimized/reload-knowledge', async (req, res) => {
    await optimizedController.reloadKnowledge(req, res);
});

/**
 * Routes pour la mémoire conversationnelle
 */
router.get('/memory/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        // Vérification des droits
        if (req.user.id !== userId && req.user.typeCompte !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès non autorisé à l\'historique' 
            });
        }

        const history = await optimizedController.qaService.conversationMemory?.getUserHistory(
            userId, 
            parseInt(limit)
        ) || [];

        res.json({
            success: true,
            history,
            count: history.length,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur récupération historique'
        });
    }
});

router.get('/memory/context/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        const context = await optimizedController.qaService.conversationMemory?.getSessionContext(sessionId);

        res.json({
            success: true,
            context,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur récupération contexte'
        });
    }
});

/**
 * Routes pour les suggestions personnalisées
 */
router.get('/suggestions/:userRole', async (req, res) => {
    try {
        const { userRole } = req.params;
        const { enterpriseId } = req.query;

        // Vérification des droits
        if (req.user.typeCompte !== userRole && req.user.typeCompte !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès non autorisé aux suggestions' 
            });
        }

        let suggestions = [];
        
        if (userRole === 'admin') {
            suggestions = [
                'Affiche-moi les statistiques globales du système',
                'Comment gérer les utilisateurs efficacement ?',
                'Configuration avancée du système',
                'Rapports de performance détaillés',
                'Monitoring de la sécurité',
                'Analyses prédictives'
            ];
        } else if (userRole === 'entreprise') {
            suggestions = [
                'Analyse de mes KPIs actuels',
                'Comment créer un rapport personnalisé ?',
                'Améliorer mes performances',
                'Comparaison avec le secteur',
                'Définir de nouveaux objectifs',
                'Suivi de mes tendances'
            ];
        }

        res.json({
            success: true,
            suggestions,
            userRole,
            enterpriseId,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur génération suggestions'
        });
    }
});

/**
 * Routes pour le feedback utilisateur
 */
router.post('/feedback', async (req, res) => {
    try {
        const { messageId, feedback, comment } = req.body;

        if (!messageId || !feedback) {
            return res.status(400).json({ 
                success: false,
                error: 'MessageId et feedback requis' 
            });
        }

        // Enregistrement du feedback
        // TODO: Implémenter l'enregistrement du feedback en base
        
        res.json({
            success: true,
            message: 'Feedback enregistré avec succès',
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur enregistrement feedback'
        });
    }
});

/**
 * Routes pour l'export de conversations
 */
router.get('/export/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Vérification des droits
        if (req.user.typeCompte !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès administrateur requis pour l\'export' 
            });
        }

        const conversation = await optimizedController.qaService.conversationMemory?.memoryData.conversations[sessionId];

        if (!conversation) {
            return res.status(404).json({ 
                success: false,
                error: 'Conversation non trouvée' 
            });
        }

        res.json({
            success: true,
            conversation,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur export conversation'
        });
    }
});

/**
 * Routes pour les statistiques globales
 */
router.get('/global/stats', async (req, res) => {
    try {
        if (req.user?.typeCompte !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Accès administrateur requis' 
            });
        }

        const adminStats = adminController.getStats();
        const enterpriseStats = enterpriseController.getStats();
        const optimizedStats = optimizedController.getMetrics();

        res.json({
            success: true,
            stats: {
                admin: adminStats,
                enterprise: enterpriseStats,
                optimized: optimizedStats,
                global: {
                    totalServices: 3,
                    activeServices: [adminStats.isInitialized, enterpriseStats.isInitialized, true].filter(Boolean).length,
                    timestamp: new Date()
                }
            },
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur récupération statistiques globales'
        });
    }
});

/**
 * Route de santé globale
 */
router.get('/health', async (req, res) => {
    try {
        const health = {
            admin: adminController.isInitialized,
            enterprise: enterpriseController.isInitialized,
            optimized: true, // Toujours disponible
            timestamp: new Date()
        };

        const isHealthy = Object.values(health).filter(Boolean).length > 0;

        res.status(isHealthy ? 200 : 503).json({
            success: isHealthy,
            health,
            message: isHealthy ? 'Services opérationnels' : 'Services dégradés'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Erreur vérification santé'
        });
    }
});

module.exports = router;

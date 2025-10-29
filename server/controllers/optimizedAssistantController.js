/**
 * Contrôleur optimisé pour les assistants IA
 * Version améliorée avec cache, monitoring et performances optimisées
 */

const OptimizedHybridQAService = require('../utils/optimizedHybridQAService');
const multer = require('multer');
const path = require('path');
const compression = require('compression');
const NodeCache = require('node-cache');

class OptimizedAssistantController {
    constructor() {
        this.qaService = new OptimizedHybridQAService();
        this.isInitialized = false;
        
        // Cache pour les réponses fréquentes
        this.frequentResponsesCache = new NodeCache({ 
            stdTTL: 600, // 10 minutes
            checkperiod: 120 // 2 minutes
        });
        
        // Configuration multer optimisée
        this.upload = multer({
            dest: 'uploads/assistant/',
            fileFilter: (req, file, cb) => {
                const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff|pdf/;
                const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
                const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
                
                if (mimetype && extname) {
                    return cb(null, true);
                } else {
                    cb(new Error('Seules les images et PDF sont autorisés'));
                }
            },
            limits: { fileSize: 15 * 1024 * 1024 } // 15MB max
        });

        // Middleware de compression
        this.compressionMiddleware = compression({
            filter: (req, res) => {
                if (req.headers['x-no-compression']) {
                    return false;
                }
                return compression.filter(req, res);
            }
        });

        // Initialisation des patterns de questions fréquentes
        this.initializeFrequentPatterns();
        
        // Initialisation automatique du service
        this.initializeServices();
    }

    /**
     * Initialisation des services
     */
    async initializeServices() {
        if (this.isInitialized) return;
        
        try {
            console.log('🔄 Initialisation du contrôleur assistant...');
            await this.qaService.initialize();
            this.isInitialized = true;
            console.log('✅ Contrôleur assistant initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation contrôleur:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Patterns pour les questions fréquentes
     */
    initializeFrequentPatterns() {
        this.frequentPatterns = {
            greeting: {
                patterns: [/bonjour/i, /salut/i, /hello/i, /bonsoir/i],
                response: 'Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd\'hui ?',
                confidence: 1.0
            },
            thanks: {
                patterns: [/merci/i, /thanks/i, /thank you/i],
                response: 'Je vous en prie ! N\'hésitez pas si vous avez d\'autres questions.',
                confidence: 1.0
            },
            goodbye: {
                patterns: [/au revoir/i, /bye/i, /goodbye/i, /à bientôt/i],
                response: 'Au revoir ! N\'hésitez pas à revenir si vous avez besoin d\'aide.',
                confidence: 1.0
            }
        };
    }

    /**
     * Traitement optimisé des questions avec réponses instantanées
     */
    async askQuestion(req, res) {
        const startTime = Date.now();
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            console.log(`🚀 [${requestId}] === DÉBUT TRAITEMENT QUESTION ===`);
            console.log(`🚀 [${requestId}] Headers:`, {
                'user-agent': req.headers['user-agent'],
                'content-type': req.headers['content-type'],
                'authorization': req.headers['authorization'] ? 'présent' : 'absent'
            });
            console.log(`🚀 [${requestId}] User:`, {
                id: req.user?.id,
                email: req.user?.email,
                typeCompte: req.user?.typeCompte,
                entrepriseId: req.user?.entrepriseId
            });
            console.log(`🚀 [${requestId}] Body:`, req.body);

            // Vérification de l'initialisation
            console.log(`🔍 [${requestId}] Vérification initialisation:`, this.isInitialized);
            if (!this.isInitialized) {
                console.log(`🔄 [${requestId}] Initialisation en cours...`);
                await this.initializeServices();
                console.log(`✅ [${requestId}] Initialisation terminée:`, this.isInitialized);
                if (!this.isInitialized) {
                    console.log(`❌ [${requestId}] Échec initialisation`);
                    return res.status(503).json({ 
                        success: false,
                        error: 'Service assistant non disponible' 
                    });
                }
            }

            const { question, enterpriseId } = req.body;
            const userRole = req.user?.typeCompte === 'admin' ? 'admin' : 'enterprise';
            
            console.log(`📝 [${requestId}] Données extraites:`, {
                question: question,
                enterpriseId: enterpriseId,
                userRole: userRole,
                extractedEnterpriseId: enterpriseId || req.user?.entrepriseId || req.user?.id
            });

            // Validation des entrées
            if (!question?.trim()) {
                console.log(`❌ [${requestId}] Question vide ou invalide`);
                return res.status(400).json({ 
                    success: false,
                    error: 'Question requise' 
                });
            }

            if (!req.user) {
                console.log(`❌ [${requestId}] Utilisateur non authentifié`);
                return res.status(401).json({ 
                    success: false,
                    error: 'Authentification requise' 
                });
            }

            console.log(`💭 [${requestId}] Question: "${question}" (Role: ${userRole})`);

            // Vérification des réponses fréquentes instantanées
            console.log(`🔍 [${requestId}] Vérification patterns fréquents...`);
            const quickResponse = this.checkFrequentPatterns(question);
            if (quickResponse) {
                console.log(`⚡ [${requestId}] Réponse instantanée trouvée:`, quickResponse);
                return res.json({
                    success: true,
                    question: question,
                    answer: quickResponse.response,
                    approach: 'instant',
                    confidence: quickResponse.confidence,
                    responseTime: Date.now() - startTime,
                    service: 'optimized',
                    timestamp: new Date()
                });
            }

            // Traitement avec le service optimisé
            console.log(`🤖 [${requestId}] Appel au service Q&A...`);
            const response = await this.qaService.processQuestion(
                question, 
                userRole, 
                enterpriseId || req.user?.entrepriseId || req.user?.id
            );

            console.log(`📊 [${requestId}] Réponse du service:`, {
                success: response.success,
                hasResponse: !!response.response,
                approach: response.approach,
                confidence: response.confidence,
                responseTime: response.responseTime,
                error: response.error
            });

            if (!response.success) {
                console.log(`❌ [${requestId}] Échec du service Q&A:`, response.error);
                return res.status(500).json({ 
                    success: false,
                    error: response.error || 'Erreur lors du traitement'
                });
            }

            // Enrichissement de la réponse
            console.log(`✨ [${requestId}] Enrichissement de la réponse...`);
            const enrichedResponse = {
                success: true,
                question: question,
                answer: response.response,
                approach: response.approach,
                confidence: response.confidence,
                responseTime: response.responseTime,
                service: 'optimized',
                metadata: {
                    pattern: response.pattern,
                    matchedQuestion: response.matchedQuestion,
                    category: response.category,
                    warning: response.warning,
                    fromCache: response.fromCache,
                    serviceMode: response.service
                },
                timestamp: new Date()
            };

            // Log des performances
            console.log(`✅ [${requestId}] Réponse générée en ${response.responseTime}ms (${response.approach})`);
            console.log(`📤 [${requestId}] Envoi de la réponse au client`);

            res.json(enrichedResponse);

        } catch (error) {
            console.error(`❌ [${requestId}] Erreur assistant optimisé:`, {
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 5),
                name: error.name,
                code: error.code
            });
            
            const errorResponse = {
                success: false,
                error: 'Erreur lors du traitement de la question',
                responseTime: Date.now() - startTime,
                service: 'optimized',
                debug: process.env.NODE_ENV === 'development' ? {
                    message: error.message,
                    stack: error.stack?.split('\n').slice(0, 5)
                } : undefined,
                timestamp: new Date()
            };

            console.log(`📤 [${requestId}] Envoi de l'erreur au client:`, errorResponse);
            res.status(500).json(errorResponse);
        }
    }

    /**
     * Vérification des patterns de questions fréquentes
     */
    checkFrequentPatterns(question) {
        const normalizedQuestion = question.toLowerCase().trim();
        
        for (const [key, config] of Object.entries(this.frequentPatterns)) {
            for (const pattern of config.patterns) {
                if (pattern.test(normalizedQuestion)) {
                    return {
                        response: config.response,
                        confidence: config.confidence,
                        pattern: key
                    };
                }
            }
        }
        
        return null;
    }

    /**
     * Statut avancé du service avec monitoring
     */
    async getServiceStatus(req, res) {
        try {
            const stats = this.qaService.getServiceStats();
            const systemInfo = {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                timestamp: new Date()
            };

            const status = {
                service: 'OptimizedAssistantController',
                version: '2.0.0',
                status: stats.serviceStatus,
                performance: {
                    totalQuestions: stats.totalQuestions,
                    successRate: parseFloat(stats.successRate),
                    averageResponseTime: Math.round(stats.averageResponseTime),
                    cacheHitRate: parseFloat(stats.cacheHitRate),
                    errorRate: parseFloat(stats.errorRate)
                },
                approaches: {
                    rules: {
                        count: stats.rulesSuccess,
                        rate: parseFloat(stats.rulesSuccessRate)
                    },
                    embeddings: {
                        count: stats.embeddingsSuccess,
                        rate: parseFloat(stats.embeddingsSuccessRate)
                    },
                    cache: {
                        hits: stats.cacheHits,
                        rate: parseFloat(stats.cacheHitRate)
                    }
                },
                services: {
                    qa: {
                        initialized: this.qaService.isInitialized,
                        mode: stats.serviceMode,
                        lastResponse: stats.lastResponse
                    },
                    embeddings: stats.embeddingService,
                    vectorStore: stats.vectorStore
                },
                system: systemInfo
            };

            res.json({
                success: true,
                status: status,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur statut service:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erreur lors de la vérification du statut' 
            });
        }
    }

    /**
     * Métriques détaillées pour le monitoring
     */
    async getMetrics(req, res) {
        try {
            const stats = this.qaService.getServiceStats();
            const cacheInfo = {
                frequent: {
                    keys: this.frequentResponsesCache.keys().length,
                    stats: this.frequentResponsesCache.getStats()
                },
                qa: stats.cacheStats
            };

            const metrics = {
                timestamp: new Date(),
                service: 'OptimizedAssistant',
                performance: {
                    requests: {
                        total: stats.totalQuestions,
                        successful: stats.rulesSuccess + stats.embeddingsSuccess,
                        failed: stats.failures,
                        cached: stats.cacheHits
                    },
                    timing: {
                        averageResponse: Math.round(stats.averageResponseTime),
                        lastResponse: stats.lastResponse
                    },
                    rates: {
                        success: parseFloat(stats.successRate),
                        error: parseFloat(stats.errorRate),
                        cache: parseFloat(stats.cacheHitRate)
                    }
                },
                distribution: {
                    byApproach: {
                        rules: stats.rulesSuccess,
                        embeddings: stats.embeddingsSuccess,
                        failures: stats.failures,
                        cached: stats.cacheHits
                    },
                    byService: {
                        primary: stats.serviceMode === 'primary' ? stats.totalQuestions : 0,
                        fallback: stats.serviceMode === 'fallback' ? stats.totalQuestions : 0
                    }
                },
                cache: cacheInfo,
                health: {
                    status: stats.serviceStatus,
                    initialized: this.qaService.isInitialized,
                    serviceMode: stats.serviceMode
                }
            };

            res.json({
                success: true,
                metrics: metrics
            });

        } catch (error) {
            console.error('Erreur métriques:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erreur lors de la récupération des métriques' 
            });
        }
    }

    /**
     * Suggestions intelligentes basées sur le contexte
     */
    async getSuggestions(req, res) {
        try {
            const userRole = req.user?.typeCompte === 'admin' ? 'admin' : 'enterprise';
            
            const suggestions = userRole === 'admin' 
                ? [
                    "Combien d'entreprises sont enregistrées ?",
                    "Quelles sont les statistiques du système ?",
                    "Comment analyser les performances globales ?",
                    "Quels sont les derniers KPIs système ?",
                    "Comment gérer les utilisateurs ?",
                    "Quelles sont les alertes actives ?"
                ]
                : [
                    "Comment améliorer ma rentabilité ?",
                    "Quels sont mes KPIs actuels ?",
                    "Comment motiver mon équipe ?",
                    "Comment optimiser mes coûts ?",
                    "Quels sont mes derniers rapports ?",
                    "Comment développer ma stratégie marketing ?"
                ];
            
            res.json({
                success: true,
                suggestions: suggestions,
                userRole: userRole,
                count: suggestions.length,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur suggestions:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erreur lors de la récupération des suggestions' 
            });
        }
    }

    /**
     * Rechargement de la base de connaissances
     */
    async reloadKnowledge(req, res) {
        try {
            // Vérification de l'initialisation
            if (!this.isInitialized) {
                await this.initializeServices();
                if (!this.isInitialized) {
                    return res.status(503).json({ 
                        success: false,
                        error: 'Service assistant non disponible' 
                    });
                }
            }

            if (req.user?.typeCompte !== 'admin') {
                return res.status(403).json({ 
                    success: false,
                    error: 'Accès administrateur requis' 
                });
            }

            console.log('🔄 Rechargement demandé par:', req.user.email);
            
            await this.qaService.loadKnowledgeBase();
            await this.qaService.generateAndIndexEmbeddings();
            
            res.json({
                success: true,
                message: 'Base de connaissances rechargée avec succès',
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur rechargement:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erreur lors du rechargement' 
            });
        }
    }

    /**
     * Test de santé du service
     */
    async healthCheck(req, res) {
        try {
            const isHealthy = this.qaService.isInitialized && 
                            this.qaService.metrics.serviceStatus !== 'error';
            
            const health = {
                status: isHealthy ? 'healthy' : 'unhealthy',
                service: 'OptimizedAssistant',
                initialized: this.qaService.isInitialized,
                serviceMode: this.qaService.useFallback ? 'fallback' : 'primary',
                uptime: process.uptime(),
                timestamp: new Date()
            };

            res.status(isHealthy ? 200 : 503).json({
                success: isHealthy,
                health: health
            });

        } catch (error) {
            res.status(503).json({
                success: false,
                health: {
                    status: 'error',
                    error: error.message,
                    timestamp: new Date()
                }
            });
        }
    }

    /**
     * Middleware pour l'upload de fichiers
     */
    uploadSingle() {
        return this.upload.single('file');
    }

    /**
     * Middleware pour l'upload multiple
     */
    uploadMultiple() {
        return this.upload.array('files', 5);
    }

    /**
     * Middleware de compression
     */
    compress() {
        return this.compressionMiddleware;
    }

    /**
     * Nettoyage des ressources
     */
    async cleanup() {
        this.frequentResponsesCache.flushAll();
        await this.qaService.cleanup();
    }
}

module.exports = OptimizedAssistantController;

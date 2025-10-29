/**
 * Contrôleur hybride IA combinant OCR + Q&A hybride (Approches A + B)
 * Remplace simpleAIController.js avec des fonctionnalités avancées
 */

const SimpleOCRService = require('../utils/simpleOCRService');
const DatabaseQueryService = require('../utils/databaseQueryService');

// Tentative de chargement du service principal, fallback si échec
let HybridQAService, HybridQAServiceFallback;
try {
    HybridQAService = require('../utils/hybridQAService');
} catch (error) {
    console.log('⚠️ Service principal non disponible, utilisation du fallback');
}
HybridQAServiceFallback = require('../utils/hybridQAServiceFallback');
const multer = require('multer');
const path = require('path');

class HybridAIController {
    constructor() {
        this.ocrService = new SimpleOCRService();
        this.hybridQAService = HybridQAService ? new HybridQAService() : null;
        this.hybridQAServiceFallback = new HybridQAServiceFallback();
        this.dbQueryService = new DatabaseQueryService();
        this.useFallback = !HybridQAService; // Utiliser fallback si service principal indisponible
        this.isInitialized = false;
        this.isInitializing = false;
        
        // Configuration multer pour upload d'images (identique)
        this.upload = multer({
            dest: 'uploads/ocr/',
            fileFilter: (req, file, cb) => {
                const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff/;
                const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
                const mimetype = allowedTypes.test(file.mimetype);
                
                if (mimetype && extname) {
                    return cb(null, true);
                } else {
                    cb(new Error('Seules les images sont autorisées'));
                }
            },
            limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
        });

        // Initialisation du service hybride
        this.initializeServices();
    }

    /**
     * Initialisation asynchrone des services
     */
    async initializeServices() {
        this.isInitializing = true;
        
        if (this.useFallback) {
            console.log('🔄 Initialisation du service fallback (dépendances manquantes)...');
            try {
                await this.hybridQAServiceFallback.initialize();
                console.log('✅ Service IA fallback initialisé');
                this.isInitialized = true;
            } catch (fallbackError) {
                console.error('❌ Erreur initialisation service fallback:', fallbackError);
                this.isInitialized = false;
            }
        } else {
            try {
                await this.hybridQAService.initialize();
                console.log('✅ Services IA hybrides initialisés');
                this.isInitialized = true;
            } catch (error) {
                console.error('❌ Erreur initialisation service principal:', error);
                console.log('🔄 Basculement vers le service fallback...');
                
                try {
                    await this.hybridQAServiceFallback.initialize();
                    console.log('✅ Service IA fallback initialisé');
                    this.useFallback = true;
                    this.isInitialized = true;
                } catch (fallbackError) {
                    console.error('❌ Erreur initialisation service fallback:', fallbackError);
                    this.isInitialized = false;
                }
            }
        }
        
        this.isInitializing = false;
    }

    /**
     * Extraction de texte depuis une image (OCR) - Identique
     */
    async extractTextFromImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Aucune image fournie' });
            }

            const { documentType = 'general', language = 'fra+eng' } = req.body;
            const imagePath = req.file.path;

            console.log(`OCR demandé pour: ${imagePath}`);

            const result = await this.ocrService.extractAndAnalyze(imagePath, documentType);

            if (!result.success) {
                return res.status(500).json({ error: result.error });
            }

            res.json({
                success: true,
                filename: req.file.originalname,
                text: result.text,
                analysis: result.analysis,
                documentType: documentType,
                extractedAt: new Date()
            });

        } catch (error) {
            console.error('Erreur OCR:', error);
            res.status(500).json({ error: 'Erreur lors de l\'extraction de texte' });
        }
    }

    /**
     * Questions/Réponses hybrides (NOUVEAU - Remplace askQuestion)
     * Combine approches A (règles) et B (embeddings)
     */
    async askHybridQuestion(req, res) {
        try {
            console.log('📥 Requête reçue:', {
                body: req.body,
                headers: req.headers['x-user-email'],
                user: req.user ? { typeCompte: req.user.typeCompte, email: req.user.email } : 'Non authentifié'
            });

            // Vérification de l'initialisation
            if (this.isInitializing) {
                console.log('⏳ Service en cours d\'initialisation, attente...');
                return res.status(503).json({ 
                    error: 'Service en cours d\'initialisation, veuillez patienter quelques secondes' 
                });
            }

            if (!this.isInitialized) {
                console.log('❌ Service non initialisé');
                return res.status(503).json({ 
                    error: 'Service non disponible, veuillez réessayer dans quelques instants' 
                });
            }

            const { question, enterpriseId } = req.body;
            const userRole = req.user?.typeCompte === 'admin' ? 'admin' : 'enterprise';

            if (!question) {
                console.log('❌ Question manquante');
                return res.status(400).json({ error: 'Question requise' });
            }

            if (!req.user) {
                console.log('❌ Utilisateur non authentifié');
                return res.status(401).json({ error: 'Authentification requise' });
            }

            console.log(`Question hybride posée: ${question} (Role: ${userRole}, User: ${req.user.email})`);

            // Traitement avec le service hybride (principal ou fallback)
            const service = this.useFallback ? this.hybridQAServiceFallback : this.hybridQAService;
            
            console.log('🔧 Service utilisé:', this.useFallback ? 'fallback' : 'principal');
            console.log('🔧 Service initialisé:', service.isInitialized);
            
            const response = await service.processQuestion(
                question, 
                userRole, 
                enterpriseId
            );

            if (!response.success) {
                return res.status(500).json({ error: response.error });
            }

            res.json({
                success: true,
                question: question,
                answer: response.response,
                approach: response.approach,
                confidence: response.confidence,
                responseTime: response.responseTime,
                service: response.service || (this.useFallback ? 'fallback' : 'principal'),
                metadata: {
                    pattern: response.pattern,
                    matchedQuestion: response.matchedQuestion,
                    category: response.category,
                    warning: response.warning
                },
                timestamp: new Date()
            });

        } catch (error) {
            console.error('❌ ERREUR Q&A HYBRIDE DÉTAILLÉE:');
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
            console.error('Type:', error.name);
            console.error('Service fallback utilisé:', this.useFallback);
            console.error('Service disponible:', this.useFallback ? 'hybridQAServiceFallback' : 'hybridQAService');
            res.status(500).json({ 
                error: 'Erreur lors du traitement de la question',
                debug: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Requête base de données en langage naturel - Identique
     */
    async queryDatabase(req, res) {
        try {
            const { query, enterpriseId } = req.body;

            if (!query) {
                return res.status(400).json({ error: 'Requête requise' });
            }

            const validation = this.dbQueryService.validateQuery(query);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.error });
            }

            console.log(`Requête DB: ${query}`);

            const results = await this.dbQueryService.processQuery(query, enterpriseId);

            if (!results.success) {
                return res.status(500).json({ error: results.error });
            }

            res.json({
                success: true,
                query: query,
                results: results.results,
                count: results.count,
                type: results.type,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur requête DB:', error);
            res.status(500).json({ error: 'Erreur lors de la requête' });
        }
    }

    /**
     * Suggestions de requêtes - Identique
     */
    async getSuggestions(req, res) {
        try {
            const suggestions = this.dbQueryService.getSuggestions();
            
            res.json({
                success: true,
                suggestions: suggestions,
                count: suggestions.length
            });

        } catch (error) {
            console.error('Erreur suggestions:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des suggestions' });
        }
    }

    /**
     * Traitement par lot d'images OCR - Identique
     */
    async processBatchOCR(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Aucune image fournie' });
            }

            const { documentType = 'general' } = req.body;
            const imagePaths = req.files.map(file => file.path);

            console.log(`OCR par lot demandé pour ${imagePaths.length} images`);

            const results = await this.ocrService.processBatch(imagePaths, documentType);

            res.json({
                success: true,
                totalFiles: imagePaths.length,
                results: results,
                processedAt: new Date()
            });

        } catch (error) {
            console.error('Erreur OCR par lot:', error);
            res.status(500).json({ error: 'Erreur lors du traitement par lot' });
        }
    }

    /**
     * Analyse rapide d'un document - Identique
     */
    async quickAnalyze(req, res) {
        try {
            const { text, type = 'general' } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Texte requis' });
            }

            const analysis = this.ocrService.analyzeContent(text, type);

            res.json({
                success: true,
                text: text,
                analysis: analysis,
                type: type,
                analyzedAt: new Date()
            });

        } catch (error) {
            console.error('Erreur analyse rapide:', error);
            res.status(500).json({ error: 'Erreur lors de l\'analyse' });
        }
    }

    /**
     * Statut des services IA (AMÉLIORÉ)
     */
    async getStatus(req, res) {
        try {
            const service = this.useFallback ? this.hybridQAServiceFallback : this.hybridQAService;
            const hybridStats = service.getServiceStats();
            
            const status = {
                ocr: {
                    available: true,
                    languages: this.ocrService.supportedLanguages,
                    service: 'Tesseract.js'
                },
                hybridQA: {
                    available: hybridStats.embeddingService?.isInitialized || true,
                    totalQuestions: hybridStats.totalQuestions,
                    successRate: hybridStats.successRate + '%',
                    rulesSuccessRate: hybridStats.rulesSuccessRate + '%',
                    embeddingsSuccessRate: hybridStats.embeddingsSuccessRate + '%',
                    averageResponseTime: Math.round(hybridStats.averageResponseTime) + 'ms',
                    service: this.useFallback ? 'Fallback (NLP classique)' : 'Principal (Transformers + FAISS)',
                    serviceType: hybridStats.service || (this.useFallback ? 'fallback' : 'principal')
                },
                database: {
                    available: true,
                    queryTypes: Object.keys(this.dbQueryService.queryPatterns),
                    service: 'MongoDB queries'
                }
            };

            if (!this.useFallback && hybridStats.embeddingService) {
                status.embeddings = {
                    ...hybridStats.embeddingService,
                    service: 'Sentence Transformers'
                };
                status.vectorStore = {
                    ...hybridStats.vectorStore,
                    service: 'FAISS'
                };
            }

            res.json({
                success: true,
                status: status,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur statut:', error);
            res.status(500).json({ error: 'Erreur lors de la vérification du statut' });
        }
    }

    /**
     * Métriques détaillées de performance (NOUVEAU)
     */
    async getMetrics(req, res) {
        try {
            const service = this.useFallback ? this.hybridQAServiceFallback : this.hybridQAService;
            const metrics = service.getServiceStats();
            
            res.json({
                success: true,
                metrics: {
                    performance: {
                        totalQuestions: metrics.totalQuestions,
                        successRate: parseFloat(metrics.successRate),
                        averageResponseTime: metrics.averageResponseTime,
                        serviceType: this.useFallback ? 'fallback' : 'principal',
                        approaches: {
                            rules: {
                                count: metrics.rulesSuccess,
                                rate: parseFloat(metrics.rulesSuccessRate)
                            },
                            embeddings: {
                                count: metrics.embeddingsSuccess,
                                rate: parseFloat(metrics.embeddingsSuccessRate)
                            },
                            failures: {
                                count: metrics.failures,
                                rate: parseFloat(metrics.failureRate)
                            }
                        }
                    },
                    technical: {
                        embeddingService: metrics.embeddingService,
                        vectorStore: metrics.vectorStore
                    }
                },
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur métriques:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des métriques' });
        }
    }

    /**
     * Rechargement de la base de connaissances (NOUVEAU)
     */
    async reloadKnowledgeBase(req, res) {
        try {
            const service = this.useFallback ? this.hybridQAServiceFallback : this.hybridQAService;
            await service.loadKnowledgeBase();
            await service.generateAndIndexEmbeddings();
            
            res.json({
                success: true,
                message: 'Base de connaissances rechargée avec succès',
                serviceType: this.useFallback ? 'fallback' : 'principal',
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur rechargement:', error);
            res.status(500).json({ error: 'Erreur lors du rechargement de la base de connaissances' });
        }
    }

    /**
     * Test de performance du système IA (NOUVEAU)
     */
    async testPerformance(req, res) {
        try {
            const { testQuestions = [], iterations = 10 } = req.body;
            const service = this.useFallback ? this.hybridQAServiceFallback : this.hybridQAService;
            
            // Questions de test par défaut si aucune fournie
            const defaultTestQuestions = [
                "Qu'est-ce que votre entreprise fait ?",
                "Quels sont vos services ?",
                "Comment vous contacter ?",
                "Quels sont vos horaires ?",
                "Où êtes-vous situés ?"
            ];
            
            const questionsToTest = testQuestions.length > 0 ? testQuestions : defaultTestQuestions;
            const results = [];
            let totalTime = 0;
            
            console.log(`🧪 Test de performance en cours (${iterations} itérations)...`);
            
            for (let i = 0; i < iterations; i++) {
                for (const question of questionsToTest) {
                    const startTime = Date.now();
                    
                    try {
                        const response = await service.processQuestion(question, 'enterprise');
                        const endTime = Date.now();
                        const responseTime = endTime - startTime;
                        totalTime += responseTime;
                        
                        results.push({
                            iteration: i + 1,
                            question: question,
                            success: response.success,
                            responseTime: responseTime,
                            approach: response.approach,
                            confidence: response.confidence
                        });
                    } catch (error) {
                        results.push({
                            iteration: i + 1,
                            question: question,
                            success: false,
                            responseTime: Date.now() - startTime,
                            error: error.message
                        });
                    }
                }
            }
            
            // Calcul des statistiques
            const successfulTests = results.filter(r => r.success);
            const averageResponseTime = totalTime / results.length;
            const successRate = (successfulTests.length / results.length) * 100;
            
            res.json({
                success: true,
                testResults: {
                    totalTests: results.length,
                    successfulTests: successfulTests.length,
                    successRate: Math.round(successRate * 100) / 100,
                    averageResponseTime: Math.round(averageResponseTime),
                    totalTime: totalTime,
                    serviceType: this.useFallback ? 'fallback' : 'principal',
                    details: results
                },
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur test de performance:', error);
            res.status(500).json({ error: 'Erreur lors du test de performance' });
        }
    }

    /**
     * Middleware pour upload d'image unique
     */
    uploadSingle() {
        return this.upload.single('image');
    }

    /**
     * Middleware pour upload d'images multiples
     */
    uploadMultiple() {
        return this.upload.array('images', 10);
    }
}

module.exports = new HybridAIController();

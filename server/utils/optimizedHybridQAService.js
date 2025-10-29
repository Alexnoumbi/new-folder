/**
 * Service hybride Q&A optimisé - Version stabilisée
 * Amélioration du service existant avec cache et performances optimisées
 */

// Tentative de chargement des services avancés, fallback si échec
let EmbeddingService, VectorStore;
let EmbeddingServiceFallback, VectorStoreFallback;

try {
    EmbeddingService = require('./embeddingService');
    VectorStore = require('./vectorStore');
    console.log('✅ Services IA avancés chargés');
} catch (error) {
    console.log('⚠️ Services IA avancés non disponibles, utilisation du fallback');
    EmbeddingService = null;
    VectorStore = null;
}

try {
    EmbeddingServiceFallback = require('./embeddingServiceFallback');
    VectorStoreFallback = require('./vectorStoreFallback');
    console.log('✅ Services IA de fallback chargés');
} catch (error) {
    console.error('❌ Services IA de fallback non disponibles:', error);
    EmbeddingServiceFallback = null;
    VectorStoreFallback = null;
}
const Enterprise = require('../models/Entreprise');
const KPI = require('../models/KPI');
const Report = require('../models/Report');
const User = require('../models/User');
const NodeCache = require('node-cache');
const fs = require('fs').promises;
const path = require('path');
const _ = require('lodash');

class OptimizedHybridQAService {
    constructor() {
        // Services primaires et fallback
        this.embeddingService = null;
        this.vectorStore = null;
        this.useFallback = false;
        
        // Cache intelligent avec TTL
        this.responseCache = new NodeCache({ 
            stdTTL: 300, // 5 minutes
            checkperiod: 60, // Vérification toutes les minutes
            maxKeys: 1000 // Max 1000 réponses en cache
        });
        
        this.knowledgeBase = null;
        this.rulePatterns = this.initializeRulePatterns();
        this.isInitialized = false;
        this.isInitializing = false;
        
        // Seuils de confiance optimisés
        this.confidenceThresholds = {
            rules: 0.85,        // Plus strict pour les règles
            embeddings: 0.7,    // Seuil pour embeddings
            fallback: 0.5,      // Minimum acceptable
            cache: 0.6          // Seuil pour mise en cache
        };

        // Métriques de performance enrichies
        this.metrics = {
            totalQuestions: 0,
            rulesSuccess: 0,
            embeddingsSuccess: 0,
            cacheHits: 0,
            failures: 0,
            averageResponseTime: 0,
            lastResponse: null,
            errorRate: 0,
            serviceStatus: 'initializing'
        };

        // Initialisation automatique
        this.initialize().catch(error => {
            console.error('❌ Erreur initialisation auto:', error);
        });
    }

    /**
     * Initialisation intelligente avec fallback automatique
     */
    async initialize() {
        if (this.isInitialized || this.isInitializing) return;
        
        this.isInitializing = true;
        this.metrics.serviceStatus = 'initializing';

        try {
            console.log('🔄 Initialisation du service hybride Q&A optimisé...');

            // Chargement de la base de connaissances
            await this.loadKnowledgeBase();

            // Tentative d'initialisation des services principaux
            try {
                if (EmbeddingService && VectorStore) {
                    this.embeddingService = new EmbeddingService();
                    this.vectorStore = new VectorStore();
                    
                    await this.embeddingService.initialize();
                    await this.vectorStore.initialize();
                    
                    console.log('✅ Services principaux initialisés');
                    this.useFallback = false;
                    this.metrics.serviceStatus = 'primary';
                } else {
                    throw new Error('Services principaux non disponibles');
                }
                
            } catch (primaryError) {
                console.warn('⚠️ Services principaux indisponibles, utilisation du fallback');
                console.warn('Erreur:', primaryError.message);
                
                // Initialisation des services fallback
                if (EmbeddingServiceFallback && VectorStoreFallback) {
                    this.embeddingService = new EmbeddingServiceFallback();
                    this.vectorStore = new VectorStoreFallback();
                    
                    await this.embeddingService.initialize();
                    await this.vectorStore.initialize();
                    
                    this.useFallback = true;
                    this.metrics.serviceStatus = 'fallback';
                    console.log('✅ Services fallback initialisés');
                } else {
                    throw new Error('Aucun service IA disponible');
                }
            }

            // Génération et indexation des embeddings
            await this.ensureEmbeddingsGenerated();

            this.isInitialized = true;
            this.metrics.serviceStatus = this.useFallback ? 'fallback_ready' : 'primary_ready';
            
            console.log(`✅ Service hybride Q&A optimisé initialisé (Mode: ${this.useFallback ? 'fallback' : 'principal'})`);
            
        } catch (error) {
            console.error('❌ Erreur initialisation service hybride optimisé:', error);
            this.metrics.serviceStatus = 'error';
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    /**
     * Chargement optimisé de la base de connaissances avec cache
     */
    async loadKnowledgeBase() {
        try {
            const knowledgeBasePath = path.join(__dirname, '../data/knowledge_base.json');
            const content = await fs.readFile(knowledgeBasePath, 'utf8');
            this.knowledgeBase = JSON.parse(content);
            
            console.log(`📚 Base de connaissances chargée: ${this.knowledgeBase.enterprise_questions.length + this.knowledgeBase.admin_questions.length} questions`);
        } catch (error) {
            console.error('Erreur chargement base de connaissances:', error);
            throw error;
        }
    }

    /**
     * Patterns de règles optimisés avec scores
     */
    initializeRulePatterns() {
        return {
            // Statistiques entreprises
            enterprise_count: {
                patterns: [
                    /combien d['\s]?entreprises?/i,
                    /nombre d['\s]?entreprises?/i,
                    /total.*entreprises?/i,
                    /quantité.*entreprises?/i
                ],
                handler: 'getEnterpriseCount',
                confidence: 0.95,
                cacheTTL: 60 // Cache 1 minute pour les stats
            },

            // KPIs et indicateurs
            kpi_stats: {
                patterns: [
                    /combien.*kpis?/i,
                    /nombre.*indicateurs?/i,
                    /total.*performances?/i,
                    /statistiques?.*kpis?/i,
                    /mes kpis?/i
                ],
                handler: 'getKPIStats',
                confidence: 0.9,
                cacheTTL: 30
            },

            // Rapports
            report_stats: {
                patterns: [
                    /combien.*rapports?/i,
                    /nombre.*documents?/i,
                    /statistiques?.*rapports?/i,
                    /mes rapports?/i
                ],
                handler: 'getReportStats',
                confidence: 0.9,
                cacheTTL: 30
            },

            // Utilisateurs (admin uniquement)
            user_stats: {
                patterns: [
                    /combien.*utilisateurs?/i,
                    /nombre.*users?/i,
                    /total.*comptes?/i,
                    /statistiques?.*utilisateurs?/i
                ],
                handler: 'getUserStats',
                confidence: 0.9,
                cacheTTL: 60,
                adminOnly: true
            },

            // Nouvelles patterns pour l'assistance
            help_general: {
                patterns: [
                    /aide/i,
                    /help/i,
                    /assistance/i,
                    /comment.*fonctionne/i
                ],
                handler: 'getGeneralHelp',
                confidence: 0.8,
                cacheTTL: 300
            }
        };
    }

    /**
     * Traitement optimisé d'une question avec cache intelligent
     */
    async processQuestion(question, userRole = 'enterprise', enterpriseId = null) {
        const startTime = Date.now();
        const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.metrics.totalQuestions++;

        try {
            console.log(`🤔 [${questionId}] === TRAITEMENT QUESTION Q&A ===`);
            console.log(`🤔 [${questionId}] Question: "${question}"`);
            console.log(`🤔 [${questionId}] UserRole: ${userRole}`);
            console.log(`🤔 [${questionId}] EnterpriseId: ${enterpriseId}`);
            console.log(`🤔 [${questionId}] Service initialisé: ${this.isInitialized}`);
            
            if (!this.isInitialized) {
                console.log(`⚠️ [${questionId}] Service non initialisé, tentative d'initialisation...`);
                await this.initialize();
                console.log(`✅ [${questionId}] Initialisation terminée: ${this.isInitialized}`);
                if (!this.isInitialized) {
                    console.log(`❌ [${questionId}] Échec initialisation`);
                    return {
                        success: false,
                        error: 'Service non disponible',
                        responseTime: Date.now() - startTime
                    };
                }
            }

            console.log(`🔍 [${questionId}] Vérification du cache...`);
            // Vérification du cache
            const cacheKey = this.generateCacheKey(question, userRole, enterpriseId);
            console.log(`🔑 [${questionId}] Clé de cache: ${cacheKey}`);
            const cachedResponse = this.responseCache.get(cacheKey);
            
            if (cachedResponse) {
                this.metrics.cacheHits++;
                console.log(`⚡ [${questionId}] Réponse depuis le cache`);
                
                return {
                    ...cachedResponse,
                    responseTime: Date.now() - startTime,
                    fromCache: true,
                    timestamp: new Date()
                };
            }

            console.log(`🔄 [${questionId}] Préprocessing de la question...`);
            // Préprocessing de la question
            const processedQuestion = this.preprocessQuestion(question);
            console.log(`📝 [${questionId}] Question préprocessée: "${processedQuestion}"`);

            // ÉTAPE 1: Approche par règles
            console.log(`📋 [${questionId}] Tentative approche par règles...`);
            const ruleResult = await this.tryRuleBasedApproach(processedQuestion, userRole, enterpriseId);
            console.log(`📊 [${questionId}] Résultat règles:`, {
                success: ruleResult.success,
                confidence: ruleResult.confidence,
                threshold: this.confidenceThresholds.rules
            });
            
            if (ruleResult.success && ruleResult.confidence >= this.confidenceThresholds.rules) {
                this.metrics.rulesSuccess++;
                const responseTime = Date.now() - startTime;
                this.updateMetrics(responseTime);
                
                const response = {
                    ...ruleResult,
                    approach: 'rules',
                    responseTime,
                    service: this.useFallback ? 'fallback' : 'primary'
                };

                // Mise en cache si confiance suffisante
                if (ruleResult.confidence >= this.confidenceThresholds.cache) {
                    console.log(`💾 [${questionId}] Mise en cache de la réponse`);
                    this.cacheResponse(cacheKey, response, ruleResult.cacheTTL || 300);
                }
                
                console.log(`✅ [${questionId}] Réponse par règles (${responseTime}ms, confiance: ${ruleResult.confidence})`);
                return response;
            }

            // ÉTAPE 2: Approche par embeddings
            console.log(`🧠 [${questionId}] Tentative approche par embeddings...`);
            const embeddingResult = await this.tryEmbeddingBasedApproach(processedQuestion, userRole, enterpriseId);
            console.log(`📊 [${questionId}] Résultat embeddings:`, {
                success: embeddingResult.success,
                confidence: embeddingResult.confidence,
                threshold: this.confidenceThresholds.embeddings
            });
            
            if (embeddingResult.success && embeddingResult.confidence >= this.confidenceThresholds.embeddings) {
                this.metrics.embeddingsSuccess++;
                const responseTime = Date.now() - startTime;
                this.updateMetrics(responseTime);
                
                const response = {
                    ...embeddingResult,
                    approach: 'embeddings',
                    responseTime,
                    service: this.useFallback ? 'fallback' : 'primary'
                };

                // Mise en cache
                if (embeddingResult.confidence >= this.confidenceThresholds.cache) {
                    console.log(`💾 [${questionId}] Mise en cache de la réponse`);
                    this.cacheResponse(cacheKey, response, 180); // 3 minutes pour embeddings
                }
                
                console.log(`✅ [${questionId}] Réponse par embeddings (${responseTime}ms, confiance: ${embeddingResult.confidence})`);
                return response;
            }

            // ÉTAPE 3: Fallback
            console.log(`🔄 [${questionId}] Tentative fallback...`);
            const fallbackResult = ruleResult.confidence > embeddingResult.confidence ? ruleResult : embeddingResult;
            console.log(`📊 [${questionId}] Résultat fallback:`, {
                confidence: fallbackResult.confidence,
                threshold: this.confidenceThresholds.fallback,
                approach: ruleResult.confidence > embeddingResult.confidence ? 'rules' : 'embeddings'
            });
            
            if (fallbackResult.confidence >= this.confidenceThresholds.fallback) {
                const responseTime = Date.now() - startTime;
                this.updateMetrics(responseTime);
                
                console.log(`⚠️ [${questionId}] Réponse fallback acceptée (confiance: ${fallbackResult.confidence})`);
                return {
                    ...fallbackResult,
                    approach: 'fallback',
                    responseTime,
                    service: this.useFallback ? 'fallback' : 'primary',
                    warning: 'Réponse avec confiance limitée'
                };
            }

            // ÉTAPE 4: Aide générale
            console.log(`❌ [${questionId}] Aucune réponse satisfaisante trouvée`);
            this.metrics.failures++;
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);

            const helpResponse = this.getHelpResponse(userRole);
            console.log(`📚 [${questionId}] Retour de l'aide générale`);
            return helpResponse;

        } catch (error) {
            console.error(`❌ [${questionId}] Erreur traitement question optimisé:`, {
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 5),
                name: error.name
            });
            this.metrics.failures++;
            this.metrics.errorRate = this.metrics.failures / this.metrics.totalQuestions;
            
            return {
                success: false,
                error: 'Erreur lors du traitement de votre question',
                approach: 'error',
                service: this.useFallback ? 'fallback' : 'primary',
                responseTime: Date.now() - startTime
            };
        }
    }

    /**
     * Génération de clé de cache intelligente
     */
    generateCacheKey(question, userRole, enterpriseId) {
        const normalizedQuestion = this.preprocessQuestion(question);
        const contextKey = enterpriseId ? `${userRole}_${enterpriseId}` : userRole;
        return `qa_${contextKey}_${Buffer.from(normalizedQuestion).toString('base64').slice(0, 20)}`;
    }

    /**
     * Mise en cache avec TTL personnalisé
     */
    cacheResponse(key, response, ttl = 300) {
        const cacheData = _.omit(response, ['responseTime', 'timestamp', 'fromCache']);
        this.responseCache.set(key, cacheData, ttl);
    }

    /**
     * Préprocessing amélioré
     */
    preprocessQuestion(question) {
        return question
            .toLowerCase()
            .trim()
            .replace(/[^\w\sàâäéèêëïîôöùûüÿç]/g, ' ')
            .replace(/\s+/g, ' ')
            .substring(0, 500); // Limite plus généreuse
    }

    /**
     * Approche par règles optimisée
     */
    async tryRuleBasedApproach(question, userRole, enterpriseId) {
        try {
            for (const [patternName, config] of Object.entries(this.rulePatterns)) {
                // Vérification des permissions admin
                if (config.adminOnly && userRole !== 'admin') {
                    continue;
                }

                for (const pattern of config.patterns) {
                    if (pattern.test(question)) {
                        console.log(`🔍 Pattern détecté: ${patternName}`);
                        
                        const result = await this[config.handler](question, userRole, enterpriseId);
                        
                        return {
                            success: true,
                            response: result,
                            confidence: config.confidence,
                            pattern: patternName,
                            method: 'rules',
                            cacheTTL: config.cacheTTL
                        };
                    }
                }
            }

            return { success: false, confidence: 0, method: 'rules' };
        } catch (error) {
            console.error('Erreur approche règles optimisée:', error);
            return { success: false, confidence: 0, method: 'rules' };
        }
    }

    /**
     * Approche par embeddings optimisée
     */
    async tryEmbeddingBasedApproach(question, userRole, enterpriseId) {
        try {
            const questionEmbedding = await this.embeddingService.getEmbedding(question);
            if (!questionEmbedding) {
                return { success: false, confidence: 0, method: 'embeddings' };
            }

            const searchResults = await this.vectorStore.searchWithFilter(
                questionEmbedding, 
                3, // Moins de résultats pour optimiser
                { role: userRole }
            );

            if (searchResults.length === 0) {
                return { success: false, confidence: 0, method: 'embeddings' };
            }

            const bestMatch = searchResults[0];
            console.log(`🎯 Meilleur match: ${bestMatch.similarity.toFixed(3)}`);

            let response = bestMatch.metadata.answer;
            
            if (bestMatch.metadata.handler) {
                const dynamicResult = await this[bestMatch.metadata.handler](question, userRole, enterpriseId);
                response = dynamicResult || response;
            }

            return {
                success: true,
                response: response,
                confidence: bestMatch.similarity,
                matchedQuestion: bestMatch.metadata.question,
                category: bestMatch.metadata.category,
                method: 'embeddings'
            };

        } catch (error) {
            console.error('Erreur approche embeddings optimisée:', error);
            return { success: false, confidence: 0, method: 'embeddings' };
        }
    }

    /**
     * Handlers optimisés avec cache
     */
    async getEnterpriseCount() {
        const count = await Enterprise.countDocuments();
        return `Il y a actuellement **${count}** entreprise(s) enregistrée(s) dans le système.`;
    }

    async getKPIStats(question, userRole, enterpriseId) {
        const filter = enterpriseId ? { entreprise: enterpriseId } : {};
        const count = await KPI.countDocuments(filter);
        const scope = enterpriseId ? 'pour votre entreprise' : 'au total';
        return `Il y a **${count}** KPI(s) enregistré(s) ${scope}.`;
    }

    async getReportStats(question, userRole, enterpriseId) {
        const filter = enterpriseId ? { entreprise: enterpriseId } : {};
        const count = await Report.countDocuments(filter);
        const scope = enterpriseId ? 'pour votre entreprise' : 'au total';
        return `Il y a **${count}** rapport(s) enregistré(s) ${scope}.`;
    }

    async getUserStats(question, userRole, enterpriseId) {
        if (userRole !== 'admin') {
            return 'Cette information n\'est disponible que pour les administrateurs.';
        }
        const count = await User.countDocuments();
        return `Il y a **${count}** utilisateur(s) enregistré(s) dans le système.`;
    }

    async getGeneralHelp(question, userRole, enterpriseId) {
        return this.getHelpResponse(userRole).response;
    }

    /**
     * Génération et indexation optimisées
     */
    async ensureEmbeddingsGenerated() {
        const stats = this.vectorStore.getStats();
        const totalQuestions = this.knowledgeBase.enterprise_questions.length + this.knowledgeBase.admin_questions.length;

        if (stats.totalVectors < totalQuestions) {
            console.log('🔄 Génération des embeddings optimisés...');
            await this.generateAndIndexEmbeddings();
        }
    }

    async generateAndIndexEmbeddings() {
        const allQuestions = [
            ...this.knowledgeBase.enterprise_questions.map(q => ({ ...q, role: 'enterprise' })),
            ...this.knowledgeBase.admin_questions.map(q => ({ ...q, role: 'admin' }))
        ];

        if (this.useFallback) {
            // Génération séquentielle pour le fallback
            const embeddings = [];
            const metadata = [];

            for (const q of allQuestions) {
                const embedding = await this.embeddingService.getEmbedding(q.question);
                if (embedding) {
                    embeddings.push(embedding);
                    metadata.push({
                        id: q.id,
                        question: q.question,
                        answer: q.answer,
                        category: q.category,
                        keywords: q.keywords,
                        confidence: q.confidence,
                        handler: q.handler,
                        role: q.role
                    });
                }
            }

            await this.vectorStore.addVectors(embeddings, metadata);
        } else {
            // Génération par batch pour le service principal
            const questions = allQuestions.map(q => q.question);
            const embeddings = await this.embeddingService.getBatchEmbeddings(questions);

            const metadata = allQuestions.map((q, index) => ({
                id: q.id,
                question: q.question,
                answer: q.answer,
                category: q.category,
                keywords: q.keywords,
                confidence: q.confidence,
                handler: q.handler,
                role: q.role
            }));

            await this.vectorStore.addVectors(embeddings, metadata);
        }

        await this.vectorStore.save();
        console.log(`✅ Embeddings optimisés générés`);
    }

    /**
     * Réponse d'aide améliorée avec markdown
     */
    getHelpResponse(userRole) {
        const helpMessage = userRole === 'admin' 
            ? `# 🔧 Assistant Administration

Je peux vous aider avec :

## 📊 **Questions administratives**
- "Combien d'entreprises sont enregistrées ?"
- "Quels sont les statistiques du système ?"
- "Comment gérer les utilisateurs ?"

## 🔍 **Monitoring**
- "Comment analyser les performances ?"
- "Quels sont les KPIs système ?"

## ⚙️ **Configuration**
- "Comment configurer les notifications ?"
- "Comment gérer les rôles utilisateurs ?"

**💡 Astuce :** Posez-moi une question spécifique pour obtenir une aide détaillée !`
            : `# 💼 Assistant Entreprise

Je peux vous aider avec :

## 📈 **Gestion d'entreprise**
- "Comment améliorer ma rentabilité ?"
- "Quels sont les KPIs essentiels ?"
- "Comment motiver mes employés ?"

## 📊 **Vos données**
- "Combien de KPIs ai-je ?"
- "Quels sont mes derniers rapports ?"

## 💡 **Conseils business**
- "Comment développer ma stratégie marketing ?"
- "Comment gérer une crise de trésorerie ?"

**💡 Astuce :** Posez-moi une question pour obtenir des conseils personnalisés !`;

        return {
            success: true,
            response: helpMessage,
            confidence: 1.0,
            approach: 'help'
        };
    }

    /**
     * Mise à jour des métriques
     */
    updateMetrics(responseTime) {
        const alpha = 0.1;
        this.metrics.averageResponseTime = 
            this.metrics.averageResponseTime * (1 - alpha) + responseTime * alpha;
        this.metrics.lastResponse = new Date();
        this.metrics.errorRate = this.metrics.failures / this.metrics.totalQuestions;
    }

    /**
     * Statistiques enrichies
     */
    getServiceStats() {
        const total = this.metrics.totalQuestions;
        return {
            ...this.metrics,
            successRate: total > 0 ? ((this.metrics.rulesSuccess + this.metrics.embeddingsSuccess) / total * 100).toFixed(1) : 0,
            rulesSuccessRate: total > 0 ? (this.metrics.rulesSuccess / total * 100).toFixed(1) : 0,
            embeddingsSuccessRate: total > 0 ? (this.metrics.embeddingsSuccess / total * 100).toFixed(1) : 0,
            cacheHitRate: total > 0 ? (this.metrics.cacheHits / total * 100).toFixed(1) : 0,
            failureRate: total > 0 ? (this.metrics.failures / total * 100).toFixed(1) : 0,
            embeddingService: this.embeddingService?.getStats(),
            vectorStore: this.vectorStore?.getStats(),
            serviceMode: this.useFallback ? 'fallback' : 'primary',
            cacheStats: {
                keys: this.responseCache.keys().length,
                hits: this.metrics.cacheHits,
                misses: total - this.metrics.cacheHits
            }
        };
    }

    /**
     * Nettoyage des ressources
     */
    async cleanup() {
        this.responseCache.flushAll();
        if (this.embeddingService) {
            await this.embeddingService.cleanup();
        }
        if (this.vectorStore) {
            await this.vectorStore.destroy();
        }
        this.isInitialized = false;
        this.metrics.serviceStatus = 'stopped';
    }
}

module.exports = OptimizedHybridQAService;

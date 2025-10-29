/**
 * Service RAG (Retrieval-Augmented Generation) intégré
 * Génération de réponses enrichies basées sur la récupération de données
 */

const ConversationMemory = require('./conversationMemory');
const Enterprise = require('../models/Entreprise');
const KPI = require('../models/KPI');
const Report = require('../models/Report');
const User = require('../models/User');
const NodeCache = require('node-cache');

class RAGService {
    constructor() {
        this.conversationMemory = new ConversationMemory();
        this.responseCache = new NodeCache({ 
            stdTTL: 600, // 10 minutes
            checkperiod: 120
        });
        
        this.isInitialized = false;
        this.retrievalStrategies = {
            semantic: 'embedding_based',
            keyword: 'rule_based',
            hybrid: 'combined',
            contextual: 'conversation_aware'
        };
        
        this.generationStrategies = {
            template: 'template_based',
            dynamic: 'dynamic_generation',
            contextual: 'context_aware',
            personalized: 'user_specific'
        };
    }

    /**
     * Initialisation du service RAG
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔄 Initialisation du service RAG...');
            
            await this.conversationMemory.initialize();
            
            this.isInitialized = true;
            console.log('✅ Service RAG initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation RAG:', error);
            this.isInitialized = true; // Continuer avec fonctionnalités limitées
        }
    }

    /**
     * Génération de réponse RAG complète
     */
    async generateRAGResponse(question, userRole, enterpriseId, userId, sessionId) {
        if (!this.isInitialized) await this.initialize();

        const startTime = Date.now();
        
        try {
            // 1. Analyse de la question
            const questionAnalysis = await this.analyzeQuestion(question, userRole);
            
            // 2. Récupération de données contextuelles
            const retrievedData = await this.retrieveRelevantData(
                questionAnalysis,
                userRole,
                enterpriseId,
                userId
            );
            
            // 3. Génération de la réponse enrichie
            const generatedResponse = await this.generateEnrichedResponse(
                question,
                questionAnalysis,
                retrievedData,
                userRole,
                enterpriseId,
                userId
            );
            
            // 4. Enrichissement avec le contexte conversationnel
            const contextualResponse = await this.addConversationalContext(
                generatedResponse,
                sessionId,
                userId
            );
            
            // 5. Personnalisation finale
            const personalizedResponse = await this.personalizeResponse(
                contextualResponse,
                userId,
                userRole
            );
            
            const responseTime = Date.now() - startTime;
            
            return {
                success: true,
                question: question,
                answer: personalizedResponse.content,
                approach: 'rag',
                confidence: personalizedResponse.confidence,
                responseTime: responseTime,
                metadata: {
                    questionAnalysis,
                    retrievedData: {
                        sources: retrievedData.sources.length,
                        dataTypes: retrievedData.dataTypes,
                        relevance: retrievedData.averageRelevance
                    },
                    generationStrategy: personalizedResponse.strategy,
                    personalizationLevel: personalizedResponse.personalizationLevel,
                    sessionId,
                    userId,
                    timestamp: new Date()
                },
                suggestions: await this.generateContextualSuggestions(
                    questionAnalysis,
                    retrievedData,
                    userRole,
                    enterpriseId
                )
            };
            
        } catch (error) {
            console.error('Erreur génération RAG:', error);
            return {
                success: false,
                error: 'Erreur lors de la génération de la réponse',
                approach: 'error',
                confidence: 0,
                responseTime: Date.now() - startTime
            };
        }
    }

    /**
     * Analyse de la question
     */
    async analyzeQuestion(question, userRole) {
        const analysis = {
            intent: this.extractIntent(question),
            entities: this.extractEntities(question),
            category: this.categorizeQuestion(question, userRole),
            complexity: this.assessComplexity(question),
            keywords: this.extractKeywords(question),
            context: this.extractContext(question),
            userRole,
            timestamp: new Date()
        };

        return analysis;
    }

    /**
     * Extraction de l'intention
     */
    extractIntent(question) {
        const questionLower = question.toLowerCase();
        
        const intentPatterns = {
            'information': ['comment', 'quoi', 'qu\'est-ce', 'explique', 'définis'],
            'action': ['créer', 'modifier', 'supprimer', 'ajouter', 'générer'],
            'analysis': ['analyse', 'statistiques', 'rapport', 'performance', 'tendance'],
            'help': ['aide', 'help', 'assistance', 'support'],
            'comparison': ['comparer', 'différence', 'vs', 'contre'],
            'status': ['état', 'statut', 'situation', 'où en suis-je']
        };

        for (const [intent, patterns] of Object.entries(intentPatterns)) {
            if (patterns.some(pattern => questionLower.includes(pattern))) {
                return intent;
            }
        }

        return 'general';
    }

    /**
     * Extraction des entités
     */
    extractEntities(question) {
        const entities = {
            kpis: [],
            reports: [],
            users: [],
            enterprises: [],
            dates: [],
            numbers: []
        };

        // Extraction des KPIs
        const kpiPatterns = ['kpi', 'indicateur', 'métrique', 'performance'];
        kpiPatterns.forEach(pattern => {
            if (question.toLowerCase().includes(pattern)) {
                entities.kpis.push(pattern);
            }
        });

        // Extraction des rapports
        const reportPatterns = ['rapport', 'rapports', 'report', 'bilan'];
        reportPatterns.forEach(pattern => {
            if (question.toLowerCase().includes(pattern)) {
                entities.reports.push(pattern);
            }
        });

        // Extraction des nombres
        const numberMatches = question.match(/\d+/g);
        if (numberMatches) {
            entities.numbers = numberMatches.map(n => parseInt(n));
        }

        return entities;
    }

    /**
     * Catégorisation de la question
     */
    categorizeQuestion(question, userRole) {
        const questionLower = question.toLowerCase();
        
        const categories = {
            'admin': {
                'users': ['utilisateur', 'compte', 'gestion', 'créer utilisateur'],
                'system': ['système', 'configuration', 'paramètre', 'réglage'],
                'analytics': ['statistique', 'global', 'toutes les entreprises'],
                'security': ['sécurité', 'permission', 'accès', 'rôle']
            },
            'enterprise': {
                'kpis': ['kpi', 'indicateur', 'performance', 'métrique'],
                'reports': ['rapport', 'bilan', 'résumé', 'export'],
                'data': ['donnée', 'information', 'historique', 'archive'],
                'improvement': ['améliorer', 'optimiser', 'conseil', 'recommandation']
            }
        };

        const roleCategories = categories[userRole] || {};
        
        for (const [category, keywords] of Object.entries(roleCategories)) {
            if (keywords.some(keyword => questionLower.includes(keyword))) {
                return category;
            }
        }

        return 'general';
    }

    /**
     * Récupération de données pertinentes
     */
    async retrieveRelevantData(questionAnalysis, userRole, enterpriseId, userId) {
        const retrievedData = {
            sources: [],
            dataTypes: [],
            averageRelevance: 0,
            enterpriseData: null,
            userData: null,
            historicalData: null,
            contextualData: null
        };

        try {
            // Récupération des données d'entreprise
            if (enterpriseId) {
                retrievedData.enterpriseData = await this.retrieveEnterpriseData(
                    enterpriseId,
                    questionAnalysis
                );
                retrievedData.sources.push('enterprise');
            }

            // Récupération des données utilisateur
            if (userId) {
                retrievedData.userData = await this.retrieveUserData(
                    userId,
                    questionAnalysis
                );
                retrievedData.sources.push('user');
            }

            // Récupération des données historiques
            retrievedData.historicalData = await this.retrieveHistoricalData(
                questionAnalysis,
                userRole,
                enterpriseId
            );
            retrievedData.sources.push('historical');

            // Récupération du contexte conversationnel
            retrievedData.contextualData = await this.retrieveConversationalContext(
                userId,
                questionAnalysis
            );
            retrievedData.sources.push('contextual');

            // Calcul de la pertinence moyenne
            retrievedData.averageRelevance = this.calculateAverageRelevance(retrievedData);

            return retrievedData;

        } catch (error) {
            console.error('Erreur récupération données:', error);
            return retrievedData;
        }
    }

    /**
     * Récupération des données d'entreprise
     */
    async retrieveEnterpriseData(enterpriseId, questionAnalysis) {
        try {
            const enterprise = await Enterprise.findById(enterpriseId);
            if (!enterprise) return null;

            const data = {
                basicInfo: {
                    name: enterprise.nom,
                    sector: enterprise.secteur,
                    size: enterprise.taille,
                    status: enterprise.statut
                },
                kpis: [],
                reports: [],
                performance: null
            };

            // Récupération des KPIs
            if (questionAnalysis.entities.kpis.length > 0) {
                data.kpis = await KPI.find({ entrepriseId })
                    .sort({ createdAt: -1 })
                    .limit(10);
            }

            // Récupération des rapports
            if (questionAnalysis.entities.reports.length > 0) {
                data.reports = await Report.find({ entrepriseId })
                    .sort({ createdAt: -1 })
                    .limit(5);
            }

            // Calcul des performances
            if (questionAnalysis.intent === 'analysis') {
                data.performance = await this.calculateEnterprisePerformance(enterpriseId);
            }

            return data;

        } catch (error) {
            console.error('Erreur récupération données entreprise:', error);
            return null;
        }
    }

    /**
     * Récupération des données utilisateur
     */
    async retrieveUserData(userId, questionAnalysis) {
        try {
            const user = await User.findById(userId);
            if (!user) return null;

            return {
                profile: {
                    name: user.nom,
                    email: user.email,
                    role: user.typeCompte,
                    enterpriseId: user.entrepriseId,
                    lastLogin: user.lastLogin
                },
                preferences: await this.conversationMemory.getUserPreferences(userId),
                history: await this.conversationMemory.getUserHistory(userId, 5),
                patterns: this.extractUserPatterns(userId)
            };

        } catch (error) {
            console.error('Erreur récupération données utilisateur:', error);
            return null;
        }
    }

    /**
     * Récupération des données historiques
     */
    async retrieveHistoricalData(questionAnalysis, userRole, enterpriseId) {
        try {
            const historicalData = {
                trends: [],
                patterns: [],
                benchmarks: [],
                insights: []
            };

            // Analyse des tendances
            if (questionAnalysis.intent === 'analysis') {
                historicalData.trends = await this.analyzeTrends(userRole, enterpriseId);
            }

            // Patterns d'utilisation
            if (questionAnalysis.intent === 'help') {
                historicalData.patterns = await this.analyzeUsagePatterns(userRole);
            }

            // Benchmarks sectoriels
            if (enterpriseId && questionAnalysis.category === 'kpis') {
                historicalData.benchmarks = await this.getSectorBenchmarks(enterpriseId);
            }

            return historicalData;

        } catch (error) {
            console.error('Erreur récupération données historiques:', error);
            return null;
        }
    }

    /**
     * Génération de réponse enrichie
     */
    async generateEnrichedResponse(question, questionAnalysis, retrievedData, userRole, enterpriseId, userId) {
        const response = {
            content: '',
            confidence: 0,
            strategy: 'template',
            personalizationLevel: 'basic',
            components: []
        };

        try {
            // Génération basée sur l'intention
            switch (questionAnalysis.intent) {
                case 'information':
                    response.content = await this.generateInformationalResponse(
                        question,
                        questionAnalysis,
                        retrievedData
                    );
                    response.strategy = 'template';
                    break;

                case 'analysis':
                    response.content = await this.generateAnalyticalResponse(
                        question,
                        questionAnalysis,
                        retrievedData
                    );
                    response.strategy = 'dynamic';
                    break;

                case 'action':
                    response.content = await this.generateActionResponse(
                        question,
                        questionAnalysis,
                        retrievedData
                    );
                    response.strategy = 'contextual';
                    break;

                default:
                    response.content = await this.generateGeneralResponse(
                        question,
                        questionAnalysis,
                        retrievedData
                    );
                    response.strategy = 'template';
            }

            // Calcul de la confiance
            response.confidence = this.calculateResponseConfidence(
                questionAnalysis,
                retrievedData,
                response.content
            );

            // Niveau de personnalisation
            response.personalizationLevel = this.assessPersonalizationLevel(
                retrievedData,
                userId
            );

            return response;

        } catch (error) {
            console.error('Erreur génération réponse:', error);
            return {
                content: 'Je ne peux pas générer de réponse enrichie pour le moment.',
                confidence: 0.3,
                strategy: 'fallback',
                personalizationLevel: 'none'
            };
        }
    }

    /**
     * Génération de réponse informationnelle
     */
    async generateInformationalResponse(question, questionAnalysis, retrievedData) {
        let response = '';

        // Réponse basée sur les données d'entreprise
        if (retrievedData.enterpriseData) {
            const enterprise = retrievedData.enterpriseData.basicInfo;
            response += `Pour votre entreprise **${enterprise.name}** (secteur: ${enterprise.sector}), `;
        }

        // Réponse basée sur la catégorie
        switch (questionAnalysis.category) {
            case 'kpis':
                response += this.generateKPIInformation(retrievedData);
                break;
            case 'reports':
                response += this.generateReportInformation(retrievedData);
                break;
            case 'users':
                response += this.generateUserInformation(retrievedData);
                break;
            default:
                response += this.generateGeneralInformation(questionAnalysis);
        }

        return response;
    }

    /**
     * Génération de réponse analytique
     */
    async generateAnalyticalResponse(question, questionAnalysis, retrievedData) {
        let response = '## Analyse des données\n\n';

        if (retrievedData.enterpriseData?.performance) {
            const performance = retrievedData.enterpriseData.performance;
            response += `### Performance actuelle\n`;
            response += `- **Score global**: ${performance.overallScore}/100\n`;
            response += `- **Tendance**: ${performance.trend}\n`;
            response += `- **Points forts**: ${performance.strengths.join(', ')}\n`;
            response += `- **Axes d'amélioration**: ${performance.improvements.join(', ')}\n\n`;
        }

        if (retrievedData.historicalData?.trends) {
            response += `### Tendances observées\n`;
            retrievedData.historicalData.trends.forEach(trend => {
                response += `- ${trend.description}\n`;
            });
        }

        return response;
    }

    /**
     * Génération de suggestions contextuelles
     */
    async generateContextualSuggestions(questionAnalysis, retrievedData, userRole, enterpriseId) {
        const suggestions = [];

        // Suggestions basées sur l'intention
        switch (questionAnalysis.intent) {
            case 'analysis':
                suggestions.push('Affiche-moi les détails');
                suggestions.push('Compare avec le mois dernier');
                suggestions.push('Génère un rapport complet');
                break;

            case 'action':
                suggestions.push('Guide-moi étape par étape');
                suggestions.push('Montre-moi un exemple');
                suggestions.push('Quels sont les prérequis ?');
                break;

            case 'information':
                suggestions.push('Peux-tu expliquer plus en détail ?');
                suggestions.push('Quels sont les avantages ?');
                suggestions.push('Y a-t-il des alternatives ?');
                break;
        }

        // Suggestions basées sur les données récupérées
        if (retrievedData.enterpriseData?.kpis?.length > 0) {
            suggestions.push('Analyse mes KPIs les plus récents');
        }

        if (retrievedData.historicalData?.trends?.length > 0) {
            suggestions.push('Montre-moi l\'évolution sur 6 mois');
        }

        return suggestions.slice(0, 4);
    }

    /**
     * Statistiques du service RAG
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            cacheStats: this.responseCache.getStats(),
            memoryStats: this.conversationMemory.getStats(),
            retrievalStrategies: Object.keys(this.retrievalStrategies),
            generationStrategies: Object.keys(this.generationStrategies)
        };
    }

    /**
     * Nettoyage des ressources
     */
    async destroy() {
        this.responseCache.destroy();
        await this.conversationMemory.destroy();
        this.isInitialized = false;
    }
}

module.exports = RAGService;




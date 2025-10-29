/**
 * Contrôleur personnalisé pour l'assistant entreprise
 * Fonctionnalités spécialisées pour les utilisateurs entreprise
 */

const RAGService = require('../utils/ragService');
const ConversationMemory = require('../utils/conversationMemory');
const Enterprise = require('../models/Entreprise');
const KPI = require('../models/KPI');
const Report = require('../models/Report');
const NodeCache = require('node-cache');

class PersonalizedEnterpriseAssistantController {
    constructor() {
        this.ragService = new RAGService();
        this.conversationMemory = new ConversationMemory();
        
        // Cache spécialisé pour les données entreprise
        this.enterpriseCache = new NodeCache({ 
            stdTTL: 600, // 10 minutes
            checkperiod: 120
        });
        
        this.isInitialized = false;
        this.enterpriseCapabilities = {
            kpiAnalysis: true,
            reportGeneration: true,
            performanceTracking: true,
            goalSetting: true,
            benchmarking: true,
            trendAnalysis: true,
            recommendations: true,
            progressMonitoring: true
        };
    }

    /**
     * Initialisation du contrôleur entreprise personnalisé
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('🔄 Initialisation du contrôleur entreprise personnalisé...');
            
            await this.ragService.initialize();
            await this.conversationMemory.initialize();
            
            this.isInitialized = true;
            console.log('✅ Contrôleur entreprise personnalisé initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation contrôleur entreprise:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Traitement de question entreprise avec personnalisation
     */
    async processEnterpriseQuestion(req, res) {
        const startTime = Date.now();

        try {
            // Vérification de l'initialisation
            if (!this.isInitialized) {
                await this.initialize();
                if (!this.isInitialized) {
                    return res.status(503).json({ 
                        success: false,
                        error: 'Service entreprise non disponible' 
                    });
                }
            }

            // Vérification des droits entreprise
            if (req.user?.typeCompte !== 'entreprise') {
                return res.status(403).json({ 
                    success: false,
                    error: 'Accès entreprise requis' 
                });
            }

            const { question, sessionId, context } = req.body;
            const userId = req.user.id;
            const enterpriseId = req.user.entrepriseId;

            console.log(`🏢 Question entreprise: "${question}" (User: ${req.user.email}, Enterprise: ${enterpriseId})`);

            // Analyse de la question pour déterminer les capacités nécessaires
            const questionAnalysis = await this.analyzeEnterpriseQuestion(question, enterpriseId);
            
            // Récupération du profil utilisateur personnalisé
            const userProfile = await this.getUserProfile(userId, enterpriseId);
            
            // Traitement selon le type de question
            let response;
            switch (questionAnalysis.type) {
                case 'kpi_analysis':
                    response = await this.handleKPIAnalysis(question, questionAnalysis, enterpriseId, userProfile);
                    break;
                case 'report_generation':
                    response = await this.handleReportGeneration(question, questionAnalysis, enterpriseId, userProfile);
                    break;
                case 'performance_tracking':
                    response = await this.handlePerformanceTracking(question, questionAnalysis, enterpriseId, userProfile);
                    break;
                case 'goal_setting':
                    response = await this.handleGoalSetting(question, questionAnalysis, enterpriseId, userProfile);
                    break;
                case 'benchmarking':
                    response = await this.handleBenchmarking(question, questionAnalysis, enterpriseId, userProfile);
                    break;
                case 'trend_analysis':
                    response = await this.handleTrendAnalysis(question, questionAnalysis, enterpriseId, userProfile);
                    break;
                case 'recommendations':
                    response = await this.handleRecommendations(question, questionAnalysis, enterpriseId, userProfile);
                    break;
                default:
                    // Utilisation du service RAG pour les questions générales
                    response = await this.ragService.generateRAGResponse(
                        question, 'enterprise', enterpriseId, userId, sessionId
                    );
            }

            // Personnalisation de la réponse
            response = await this.personalizeResponse(response, userProfile, enterpriseId);

            // Enrichissement avec le contexte conversationnel
            if (sessionId) {
                await this.conversationMemory.addConversation(
                    sessionId, userId, 'enterprise', enterpriseId, [{
                        id: `q_${Date.now()}`,
                        content: question,
                        isUser: true,
                        timestamp: new Date()
                    }, {
                        id: `a_${Date.now()}`,
                        content: response.answer,
                        isUser: false,
                        timestamp: new Date(),
                        confidence: response.confidence,
                        approach: response.approach
                    }]
                );
            }

            // Ajout de métadonnées entreprise spécifiques
            response.metadata = {
                ...response.metadata,
                enterpriseCapabilities: questionAnalysis.requiredCapabilities,
                processingTime: Date.now() - startTime,
                enterpriseLevel: 'personalized',
                userProfile: {
                    experience: userProfile.experience,
                    preferences: userProfile.preferences,
                    goals: userProfile.goals
                },
                enterpriseContext: {
                    sector: userProfile.enterprise?.secteur,
                    size: userProfile.enterprise?.taille,
                    maturity: userProfile.enterprise?.maturity
                }
            };

            res.json(response);

        } catch (error) {
            console.error('Erreur traitement question entreprise:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erreur lors du traitement de la question entreprise',
                details: error.message
            });
        }
    }

    /**
     * Analyse spécialisée des questions entreprise
     */
    async analyzeEnterpriseQuestion(question, enterpriseId) {
        const questionLower = question.toLowerCase();
        
        const analysis = {
            type: 'general',
            requiredCapabilities: [],
            dataRequirements: [],
            complexity: 'medium',
            personalizationLevel: 'basic',
            urgency: 'normal'
        };

        // Analyse des types de questions entreprise
        if (questionLower.includes('kpi') || questionLower.includes('indicateur') || questionLower.includes('métrique')) {
            analysis.type = 'kpi_analysis';
            analysis.requiredCapabilities.push('kpiAnalysis', 'performanceTracking');
            analysis.dataRequirements.push('kpiData', 'performanceMetrics');
            analysis.personalizationLevel = 'high';
        }

        if (questionLower.includes('rapport') || questionLower.includes('report') || questionLower.includes('bilan')) {
            analysis.type = 'report_generation';
            analysis.requiredCapabilities.push('reportGeneration');
            analysis.dataRequirements.push('reportData', 'historicalData');
            analysis.complexity = 'high';
        }

        if (questionLower.includes('performance') || questionLower.includes('suivi') || questionLower.includes('évolution')) {
            analysis.type = 'performance_tracking';
            analysis.requiredCapabilities.push('performanceTracking', 'trendAnalysis');
            analysis.dataRequirements.push('performanceData', 'trendData');
        }

        if (questionLower.includes('objectif') || questionLower.includes('but') || questionLower.includes('cible')) {
            analysis.type = 'goal_setting';
            analysis.requiredCapabilities.push('goalSetting');
            analysis.dataRequirements.push('currentGoals', 'historicalPerformance');
            analysis.personalizationLevel = 'high';
        }

        if (questionLower.includes('comparer') || questionLower.includes('benchmark') || questionLower.includes('secteur')) {
            analysis.type = 'benchmarking';
            analysis.requiredCapabilities.push('benchmarking');
            analysis.dataRequirements.push('sectorData', 'competitorData');
            analysis.complexity = 'high';
        }

        if (questionLower.includes('tendance') || questionLower.includes('prédiction') || questionLower.includes('forecast')) {
            analysis.type = 'trend_analysis';
            analysis.requiredCapabilities.push('trendAnalysis');
            analysis.dataRequirements.push('historicalData', 'trendData');
            analysis.complexity = 'high';
        }

        if (questionLower.includes('recommandation') || questionLower.includes('conseil') || questionLower.includes('améliorer')) {
            analysis.type = 'recommendations';
            analysis.requiredCapabilities.push('recommendations');
            analysis.dataRequirements.push('performanceData', 'bestPractices');
            analysis.personalizationLevel = 'high';
        }

        return analysis;
    }

    /**
     * Récupération du profil utilisateur personnalisé
     */
    async getUserProfile(userId, enterpriseId) {
        try {
            // Récupération des données de base
            const user = await User.findById(userId);
            const enterprise = await Enterprise.findById(enterpriseId);
            
            // Récupération des préférences conversationnelles
            const preferences = await this.conversationMemory.getUserPreferences(userId);
            
            // Récupération de l'historique utilisateur
            const history = await this.conversationMemory.getUserHistory(userId, 10);
            
            // Analyse des patterns d'utilisation
            const usagePatterns = this.analyzeUsagePatterns(history);
            
            // Récupération des KPIs de l'entreprise
            const kpis = await KPI.find({ entrepriseId }).sort({ createdAt: -1 }).limit(20);
            
            // Calcul de l'expérience utilisateur
            const experience = this.calculateUserExperience(history, kpis);
            
            return {
                user: {
                    id: userId,
                    name: user?.nom,
                    email: user?.email,
                    joinDate: user?.createdAt
                },
                enterprise: {
                    id: enterpriseId,
                    name: enterprise?.nom,
                    secteur: enterprise?.secteur,
                    taille: enterprise?.taille,
                    maturity: this.assessEnterpriseMaturity(enterprise, kpis)
                },
                preferences,
                usagePatterns,
                experience,
                goals: this.extractUserGoals(history, kpis),
                strengths: this.identifyStrengths(kpis),
                areasForImprovement: this.identifyImprovementAreas(kpis)
            };

        } catch (error) {
            console.error('Erreur récupération profil utilisateur:', error);
            return {
                user: { id: userId },
                enterprise: { id: enterpriseId },
                preferences: {},
                usagePatterns: {},
                experience: 'beginner',
                goals: [],
                strengths: [],
                areasForImprovement: []
            };
        }
    }

    /**
     * Gestion de l'analyse des KPIs
     */
    async handleKPIAnalysis(question, analysis, enterpriseId, userProfile) {
        try {
            // Récupération des KPIs de l'entreprise
            const kpis = await KPI.find({ entrepriseId }).sort({ createdAt: -1 });
            
            // Analyse des performances
            const performanceAnalysis = await this.analyzeKPIPerformance(kpis);
            
            // Génération de recommandations personnalisées
            const recommendations = await this.generateKPRecommendations(kpis, userProfile);
            
            // Génération de la réponse
            const response = this.generateKPIAnalysisResponse(
                question, kpis, performanceAnalysis, recommendations, userProfile
            );
            
            return {
                success: true,
                question: question,
                answer: response,
                approach: 'kpi_analysis',
                confidence: 0.9,
                responseTime: 0,
                metadata: {
                    kpiCount: kpis.length,
                    performanceScore: performanceAnalysis.overallScore,
                    recommendationsCount: recommendations.length
                }
            };

        } catch (error) {
            console.error('Erreur analyse KPIs:', error);
            return {
                success: false,
                error: 'Erreur lors de l\'analyse des KPIs',
                approach: 'error',
                confidence: 0
            };
        }
    }

    /**
     * Gestion de la génération de rapports
     */
    async handleReportGeneration(question, analysis, enterpriseId, userProfile) {
        try {
            // Récupération des données nécessaires
            const kpis = await KPI.find({ entrepriseId }).sort({ createdAt: -1 });
            const reports = await Report.find({ entrepriseId }).sort({ createdAt: -1 }).limit(5);
            
            // Génération du rapport personnalisé
            const report = await this.generatePersonalizedReport(kpis, reports, userProfile);
            
            // Génération de la réponse
            const response = this.generateReportGenerationResponse(question, report, userProfile);
            
            return {
                success: true,
                question: question,
                answer: response,
                approach: 'report_generation',
                confidence: 0.85,
                responseTime: 0,
                metadata: {
                    reportType: report.type,
                    dataPoints: report.dataPoints,
                    insights: report.insights.length
                }
            };

        } catch (error) {
            console.error('Erreur génération rapport:', error);
            return {
                success: false,
                error: 'Erreur lors de la génération du rapport',
                approach: 'error',
                confidence: 0
            };
        }
    }

    /**
     * Gestion du suivi des performances
     */
    async handlePerformanceTracking(question, analysis, enterpriseId, userProfile) {
        try {
            // Récupération des données de performance
            const kpis = await KPI.find({ entrepriseId }).sort({ createdAt: -1 });
            const performanceData = await this.calculatePerformanceMetrics(kpis);
            
            // Analyse des tendances
            const trends = await this.analyzePerformanceTrends(kpis);
            
            // Génération de la réponse
            const response = this.generatePerformanceTrackingResponse(
                question, performanceData, trends, userProfile
            );
            
            return {
                success: true,
                question: question,
                answer: response,
                approach: 'performance_tracking',
                confidence: 0.9,
                responseTime: 0,
                metadata: {
                    metricsCount: performanceData.length,
                    trendCount: trends.length,
                    performanceScore: performanceData.overallScore
                }
            };

        } catch (error) {
            console.error('Erreur suivi performance:', error);
            return {
                success: false,
                error: 'Erreur lors du suivi des performances',
                approach: 'error',
                confidence: 0
            };
        }
    }

    /**
     * Génération de réponse pour l'analyse des KPIs
     */
    generateKPIAnalysisResponse(question, kpis, performanceAnalysis, recommendations, userProfile) {
        let response = `## 📊 Analyse de vos KPIs\n\n`;
        
        // Personnalisation selon l'expérience utilisateur
        const greeting = userProfile.experience === 'beginner' 
            ? `Bonjour ${userProfile.user.name || 'cher utilisateur'} ! Je vais vous expliquer vos KPIs de manière claire.`
            : `Voici une analyse détaillée de vos KPIs, ${userProfile.user.name || 'cher utilisateur'}.`;
        
        response += `${greeting}\n\n`;
        
        // Résumé des KPIs
        response += `### Résumé de vos KPIs\n`;
        response += `- **Total KPIs**: ${kpis.length}\n`;
        response += `- **Score global**: ${performanceAnalysis.overallScore}/100\n`;
        response += `- **Tendance**: ${performanceAnalysis.trend}\n\n`;
        
        // KPIs les plus performants
        if (performanceAnalysis.topPerformers.length > 0) {
            response += `### 🎯 Vos KPIs les plus performants\n`;
            performanceAnalysis.topPerformers.forEach(kpi => {
                response += `- **${kpi.nom}**: ${kpi.valeurActuelle} (objectif: ${kpi.valeurCible})\n`;
            });
            response += `\n`;
        }
        
        // Recommandations personnalisées
        if (recommendations.length > 0) {
            response += `### 💡 Recommandations personnalisées\n`;
            recommendations.forEach(rec => {
                response += `- ${rec.description}\n`;
            });
            response += `\n`;
        }
        
        // Conseils selon le secteur
        if (userProfile.enterprise.secteur) {
            response += `### 🏭 Conseils pour le secteur ${userProfile.enterprise.secteur}\n`;
            response += this.getSectorSpecificAdvice(userProfile.enterprise.secteur);
        }
        
        return response;
    }

    /**
     * Génération de réponse pour le suivi des performances
     */
    generatePerformanceTrackingResponse(question, performanceData, trends, userProfile) {
        let response = `## 📈 Suivi de vos Performances\n\n`;
        
        response += `### Performance Actuelle\n`;
        response += `- **Score global**: ${performanceData.overallScore}/100\n`;
        response += `- **Évolution**: ${performanceData.evolution}%\n`;
        response += `- **Statut**: ${performanceData.status}\n\n`;
        
        if (trends.length > 0) {
            response += `### Tendances Observées\n`;
            trends.forEach(trend => {
                response += `- **${trend.metric}**: ${trend.direction} (${trend.magnitude}%)\n`;
            });
            response += `\n`;
        }
        
        // Objectifs personnalisés
        if (userProfile.goals.length > 0) {
            response += `### Vos Objectifs\n`;
            userProfile.goals.forEach(goal => {
                const progress = this.calculateGoalProgress(goal, performanceData);
                response += `- **${goal.name}**: ${progress}% atteint\n`;
            });
        }
        
        return response;
    }

    /**
     * Personnalisation de la réponse
     */
    async personalizeResponse(response, userProfile, enterpriseId) {
        if (!response.success) return response;

        let personalizedAnswer = response.answer;
        
        // Personnalisation selon l'expérience
        if (userProfile.experience === 'beginner') {
            personalizedAnswer = this.addBeginnerGuidance(personalizedAnswer);
        } else if (userProfile.experience === 'expert') {
            personalizedAnswer = this.addExpertDetails(personalizedAnswer);
        }
        
        // Personnalisation selon les préférences
        if (userProfile.preferences.responseStyle === 'concise') {
            personalizedAnswer = this.makeConcise(personalizedAnswer);
        } else if (userProfile.preferences.responseStyle === 'detailed') {
            personalizedAnswer = this.addMoreDetails(personalizedAnswer);
        }
        
        // Ajout de suggestions personnalisées
        const personalizedSuggestions = await this.generatePersonalizedSuggestions(userProfile, enterpriseId);
        
        return {
            ...response,
            answer: personalizedAnswer,
            suggestions: personalizedSuggestions,
            metadata: {
                ...response.metadata,
                personalizationLevel: 'high',
                userExperience: userProfile.experience,
                customizationApplied: true
            }
        };
    }

    /**
     * Génération de suggestions personnalisées
     */
    async generatePersonalizedSuggestions(userProfile, enterpriseId) {
        const suggestions = [];
        
        // Suggestions basées sur l'expérience
        if (userProfile.experience === 'beginner') {
            suggestions.push('Explique-moi comment créer mon premier KPI');
            suggestions.push('Quels sont les KPIs essentiels pour mon secteur ?');
        } else {
            suggestions.push('Analyse avancée de mes performances');
            suggestions.push('Comparaison avec les benchmarks sectoriels');
        }
        
        // Suggestions basées sur les objectifs
        if (userProfile.goals.length > 0) {
            suggestions.push(`Comment atteindre mon objectif "${userProfile.goals[0].name}" ?`);
        }
        
        // Suggestions basées sur les points d'amélioration
        if (userProfile.areasForImprovement.length > 0) {
            suggestions.push(`Comment améliorer ${userProfile.areasForImprovement[0]} ?`);
        }
        
        return suggestions.slice(0, 4);
    }

    /**
     * Conseils spécifiques au secteur
     */
    getSectorSpecificAdvice(secteur) {
        const sectorAdvice = {
            'technologie': 'Focus sur l\'innovation et la R&D. Surveillez les KPIs de développement produit.',
            'finance': 'Priorisez la conformité réglementaire et la gestion des risques.',
            'santé': 'Concentrez-vous sur la qualité des soins et la satisfaction patient.',
            'éducation': 'Mesurez l\'impact pédagogique et l\'engagement étudiant.',
            'retail': 'Analysez les ventes, la satisfaction client et la gestion des stocks.',
            'manufacturing': 'Optimisez la production, la qualité et la maintenance.',
            'services': 'Mesurez la satisfaction client et l\'efficacité opérationnelle.'
        };
        
        return sectorAdvice[secteur.toLowerCase()] || 'Adaptez vos KPIs à votre secteur d\'activité spécifique.';
    }

    /**
     * Statistiques du contrôleur entreprise
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            enterpriseCapabilities: this.enterpriseCapabilities,
            cacheStats: this.enterpriseCache.getStats(),
            ragStats: this.ragService.getStats(),
            memoryStats: this.conversationMemory.getStats()
        };
    }

    /**
     * Nettoyage des ressources
     */
    async destroy() {
        this.enterpriseCache.destroy();
        await this.ragService.destroy();
        await this.conversationMemory.destroy();
        this.isInitialized = false;
    }
}

module.exports = PersonalizedEnterpriseAssistantController;

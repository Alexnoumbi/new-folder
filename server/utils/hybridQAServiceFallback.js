/**
 * Service hybride Q&A avec fallback (sans dépendances externes)
 * Utilise les services de fallback en attendant l'installation des dépendances
 */

const EmbeddingServiceFallback = require('./embeddingServiceFallback');
const VectorStoreFallback = require('./vectorStoreFallback');
const Enterprise = require('../models/Entreprise');
const KPI = require('../models/KPI');
const Report = require('../models/Report');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

class HybridQAServiceFallback {
    constructor() {
        this.embeddingService = new EmbeddingServiceFallback();
        this.vectorStore = new VectorStoreFallback();
        this.knowledgeBase = null;
        this.rulePatterns = this.initializeRulePatterns();
        this.isInitialized = false;
        
        // Seuils de confiance adaptés pour le fallback
        this.confidenceThresholds = {
            rules: 0.8,        
            embeddings: 0.6,   // Seuil plus bas pour le fallback
            fallback: 0.4      
        };

        // Métriques de performance
        this.metrics = {
            totalQuestions: 0,
            rulesSuccess: 0,
            embeddingsSuccess: 0,
            failures: 0,
            averageResponseTime: 0
        };
    }

    /**
     * Initialisation du service hybride fallback
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔄 Initialisation du service hybride Q&A (fallback)...');

            // Chargement de la base de connaissances
            await this.loadKnowledgeBase();

            // Initialisation des services fallback
            await this.embeddingService.initialize();
            await this.vectorStore.initialize();

            // Génération des embeddings si nécessaire
            await this.ensureEmbeddingsGenerated();

            this.isInitialized = true;
            console.log('✅ Service hybride Q&A (fallback) initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation service hybride fallback:', error);
            throw error;
        }
    }

    /**
     * Chargement de la base de connaissances
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
     * Patterns de règles (identiques)
     */
    initializeRulePatterns() {
        return {
            enterprise_count: {
                patterns: [
                    /combien d['\s]?entreprises?/i,
                    /nombre d['\s]?entreprises?/i,
                    /total.*entreprises?/i,
                    /quantité.*entreprises?/i
                ],
                handler: 'getEnterpriseCount',
                confidence: 0.95
            },
            kpi_stats: {
                patterns: [
                    /combien.*kpis?/i,
                    /nombre.*indicateurs?/i,
                    /total.*performances?/i,
                    /statistiques?.*kpis?/i
                ],
                handler: 'getKPIStats',
                confidence: 0.9
            },
            report_stats: {
                patterns: [
                    /combien.*rapports?/i,
                    /nombre.*documents?/i,
                    /statistiques?.*rapports?/i
                ],
                handler: 'getReportStats',
                confidence: 0.9
            },
            user_stats: {
                patterns: [
                    /combien.*utilisateurs?/i,
                    /nombre.*users?/i,
                    /total.*comptes?/i
                ],
                handler: 'getUserStats',
                confidence: 0.9
            }
        };
    }

    /**
     * Traitement principal d'une question
     */
    async processQuestion(question, userRole = 'enterprise', enterpriseId = null) {
        const startTime = Date.now();
        this.metrics.totalQuestions++;

        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log(`🤔 Question reçue (fallback): "${question}" (Role: ${userRole})`);

            // Préprocessing
            const processedQuestion = this.preprocessQuestion(question);

            // ÉTAPE 1: Approche A (Règles)
            const ruleResult = await this.tryRuleBasedApproach(processedQuestion, userRole, enterpriseId);
            
            if (ruleResult.success && ruleResult.confidence >= this.confidenceThresholds.rules) {
                this.metrics.rulesSuccess++;
                const responseTime = Date.now() - startTime;
                this.updateMetrics(responseTime);
                
                console.log(`✅ Réponse par règles (fallback) (${responseTime}ms)`);
                return {
                    ...ruleResult,
                    approach: 'rules',
                    responseTime,
                    service: 'fallback'
                };
            }

            // ÉTAPE 2: Approche B (Embeddings fallback)
            const embeddingResult = await this.tryEmbeddingBasedApproach(processedQuestion, userRole, enterpriseId);
            
            if (embeddingResult.success && embeddingResult.confidence >= this.confidenceThresholds.embeddings) {
                this.metrics.embeddingsSuccess++;
                const responseTime = Date.now() - startTime;
                this.updateMetrics(responseTime);
                
                console.log(`✅ Réponse par embeddings (fallback) (${responseTime}ms)`);
                return {
                    ...embeddingResult,
                    approach: 'embeddings',
                    responseTime,
                    service: 'fallback'
                };
            }

            // ÉTAPE 3: Fallback
            const fallbackResult = ruleResult.confidence > embeddingResult.confidence ? ruleResult : embeddingResult;
            
            if (fallbackResult.confidence >= this.confidenceThresholds.fallback) {
                const responseTime = Date.now() - startTime;
                this.updateMetrics(responseTime);
                
                return {
                    ...fallbackResult,
                    approach: 'fallback',
                    responseTime,
                    service: 'fallback',
                    warning: 'Réponse avec confiance limitée (service fallback)'
                };
            }

            // ÉTAPE 4: Aide
            this.metrics.failures++;
            return this.getHelpResponse(userRole);

        } catch (error) {
            console.error('Erreur traitement question (fallback):', error);
            this.metrics.failures++;
            return {
                success: false,
                error: 'Erreur lors du traitement de votre question (service fallback)',
                approach: 'error',
                service: 'fallback'
            };
        }
    }

    /**
     * Préprocessing (identique)
     */
    preprocessQuestion(question) {
        return question
            .toLowerCase()
            .trim()
            .replace(/[^\w\sàâäéèêëïîôöùûüÿç]/g, ' ')
            .replace(/\s+/g, ' ');
    }

    /**
     * Approche A (identique)
     */
    async tryRuleBasedApproach(question, userRole, enterpriseId) {
        try {
            for (const [patternName, config] of Object.entries(this.rulePatterns)) {
                for (const pattern of config.patterns) {
                    if (pattern.test(question)) {
                        console.log(`🔍 Pattern détecté (fallback): ${patternName}`);
                        
                        const result = await this[config.handler](question, userRole, enterpriseId);
                        
                        return {
                            success: true,
                            response: result,
                            confidence: config.confidence,
                            pattern: patternName,
                            method: 'rules'
                        };
                    }
                }
            }

            return { success: false, confidence: 0, method: 'rules' };
        } catch (error) {
            console.error('Erreur approche règles (fallback):', error);
            return { success: false, confidence: 0, method: 'rules' };
        }
    }

    /**
     * Approche B avec services fallback
     */
    async tryEmbeddingBasedApproach(question, userRole, enterpriseId) {
        try {
            // Génération de l'embedding avec le service fallback
            const questionEmbedding = await this.embeddingService.getEmbedding(question);
            if (!questionEmbedding) {
                return { success: false, confidence: 0, method: 'embeddings' };
            }

            // Recherche dans le store vectoriel fallback
            const searchResults = await this.vectorStore.searchWithFilter(
                questionEmbedding, 
                5, 
                { role: userRole }
            );

            if (searchResults.length === 0) {
                return { success: false, confidence: 0, method: 'embeddings' };
            }

            const bestMatch = searchResults[0];
            console.log(`🎯 Meilleur match (fallback): ${bestMatch.similarity.toFixed(3)}`);

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
            console.error('Erreur approche embeddings (fallback):', error);
            return { success: false, confidence: 0, method: 'embeddings' };
        }
    }

    /**
     * Handlers (identiques)
     */
    async getEnterpriseCount(question, userRole, enterpriseId) {
        const count = await Enterprise.countDocuments();
        return `Il y a actuellement ${count} entreprise(s) enregistrée(s) dans le système.`;
    }

    async getKPIStats(question, userRole, enterpriseId) {
        const filter = enterpriseId ? { entreprise: enterpriseId } : {};
        const count = await KPI.countDocuments(filter);
        const scope = enterpriseId ? 'pour votre entreprise' : 'au total';
        return `Il y a ${count} KPI(s) enregistré(s) ${scope}.`;
    }

    async getReportStats(question, userRole, enterpriseId) {
        const filter = enterpriseId ? { entreprise: enterpriseId } : {};
        const count = await Report.countDocuments(filter);
        const scope = enterpriseId ? 'pour votre entreprise' : 'au total';
        return `Il y a ${count} rapport(s) enregistré(s) ${scope}.`;
    }

    async getUserStats(question, userRole, enterpriseId) {
        if (userRole !== 'admin') {
            return 'Cette information n\'est disponible que pour les administrateurs.';
        }
        const count = await User.countDocuments();
        return `Il y a ${count} utilisateur(s) enregistré(s) dans le système.`;
    }

    /**
     * Génération des embeddings avec le service fallback
     */
    async ensureEmbeddingsGenerated() {
        const stats = this.vectorStore.getStats();
        const totalQuestions = this.knowledgeBase.enterprise_questions.length + this.knowledgeBase.admin_questions.length;

        if (stats.totalVectors < totalQuestions) {
            console.log('🔄 Génération des embeddings (fallback)...');
            await this.generateAndIndexEmbeddings();
        }
    }

    async generateAndIndexEmbeddings() {
        const allQuestions = [
            ...this.knowledgeBase.enterprise_questions.map(q => ({ ...q, role: 'enterprise' })),
            ...this.knowledgeBase.admin_questions.map(q => ({ ...q, role: 'admin' }))
        ];

        const embeddings = [];
        const metadata = [];

        // Génération séquentielle pour éviter la surcharge
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

        // Indexation
        await this.vectorStore.addVectors(embeddings, metadata);
        await this.vectorStore.save();

        console.log(`✅ ${embeddings.length} embeddings (fallback) générés et indexés`);
    }

    /**
     * Réponse d'aide (identique)
     */
    getHelpResponse(userRole) {
        const helpMessage = userRole === 'admin' 
            ? `Je peux vous aider avec (service fallback) :
📊 **Questions administratives :**
- "Combien d'entreprises sont enregistrées ?"
- "Statistiques du système"

🔧 **Gestion :**
- "Nombre d'utilisateurs"
- "Total des rapports"

Posez-moi une question spécifique !`
            : `Je peux vous aider avec (service fallback) :
💼 **Gestion d'entreprise :**
- "Comment améliorer ma rentabilité ?"
- "Conseils pour motiver mes employés"

📊 **Vos données :**
- "Combien de KPIs ai-je ?"
- "Mes statistiques"

Posez-moi une question !`;

        return {
            success: true,
            response: helpMessage,
            confidence: 1.0,
            approach: 'help',
            service: 'fallback'
        };
    }

    /**
     * Mise à jour des métriques
     */
    updateMetrics(responseTime) {
        const alpha = 0.1;
        this.metrics.averageResponseTime = 
            this.metrics.averageResponseTime * (1 - alpha) + responseTime * alpha;
    }

    /**
     * Statistiques du service
     */
    getServiceStats() {
        const total = this.metrics.totalQuestions;
        return {
            ...this.metrics,
            successRate: total > 0 ? ((this.metrics.rulesSuccess + this.metrics.embeddingsSuccess) / total * 100).toFixed(1) : 0,
            rulesSuccessRate: total > 0 ? (this.metrics.rulesSuccess / total * 100).toFixed(1) : 0,
            embeddingsSuccessRate: total > 0 ? (this.metrics.embeddingsSuccess / total * 100).toFixed(1) : 0,
            failureRate: total > 0 ? (this.metrics.failures / total * 100).toFixed(1) : 0,
            embeddingService: this.embeddingService.getStats(),
            vectorStore: this.vectorStore.getStats(),
            service: 'fallback'
        };
    }

    /**
     * Nettoyage
     */
    async cleanup() {
        await this.embeddingService.cleanup();
        await this.vectorStore.destroy();
        this.isInitialized = false;
    }
}

module.exports = HybridQAServiceFallback;

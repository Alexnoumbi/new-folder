/**
 * Service hybride Q&A combinant approches A (règles) et B (embeddings)
 * 
 * Approche A - Origine : Systèmes experts années 80
 * - Matching par expressions régulières
 * - Logique conditionnelle déterministe
 * - Rapide (< 10ms) et précis pour les cas prévus
 * 
 * Approche B - Origine : Word2Vec 2013, Transformers 2017
 * - Représentation vectorielle sémantique
 * - Similarité cosinus pour la compréhension
 * - Flexible pour les variations de formulation
 */

const EmbeddingService = require('./embeddingService');
const VectorStore = require('./vectorStore');
const Enterprise = require('../models/Entreprise');
const KPI = require('../models/KPI');
const Report = require('../models/Report');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');
const natural = require('natural');

class HybridQAService {
    constructor() {
        this.embeddingService = new EmbeddingService();
        this.vectorStore = new VectorStore();
        this.knowledgeBase = null;
        this.rulePatterns = this.initializeRulePatterns();
        this.isInitialized = false;
        
        // Seuils de confiance adaptatifs
        this.confidenceThresholds = {
            rules: 0.8,        // Seuil pour accepter une réponse par règles
            embeddings: 0.7,   // Seuil pour accepter une réponse par embeddings
            fallback: 0.5      // Seuil minimum pour toute réponse
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
     * Initialisation du service hybride
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔄 Initialisation du service hybride Q&A...');

            // Chargement de la base de connaissances
            await this.loadKnowledgeBase();

            // Initialisation des services d'embeddings et vectoriel
            await this.embeddingService.initialize();
            await this.vectorStore.initialize();

            // Vérification et génération des embeddings si nécessaire
            await this.ensureEmbeddingsGenerated();

            this.isInitialized = true;
            console.log('✅ Service hybride Q&A initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation service hybride:', error);
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
     * Patterns de règles pour l'Approche A
     * Système expert basé sur des expressions régulières
     */
    initializeRulePatterns() {
        return {
            // Questions sur les entreprises (données factuelles)
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

            // Questions sur les KPIs
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

            // Questions sur les rapports
            report_stats: {
                patterns: [
                    /combien.*rapports?/i,
                    /nombre.*documents?/i,
                    /statistiques?.*rapports?/i
                ],
                handler: 'getReportStats',
                confidence: 0.9
            },

            // Questions sur les utilisateurs (admin)
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
     * Traitement principal d'une question (Point d'entrée)
     */
    async processQuestion(question, userRole = 'enterprise', enterpriseId = null) {
        const startTime = Date.now();
        this.metrics.totalQuestions++;

        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log(`🤔 Question reçue: "${question}" (Role: ${userRole})`);

            // Préprocessing de la question
            const processedQuestion = this.preprocessQuestion(question);

            // ÉTAPE 1: Tentative avec l'Approche A (Règles)
            const ruleResult = await this.tryRuleBasedApproach(processedQuestion, userRole, enterpriseId);
            
            if (ruleResult.success && ruleResult.confidence >= this.confidenceThresholds.rules) {
                this.metrics.rulesSuccess++;
                const responseTime = Date.now() - startTime;
                this.updateMetrics(responseTime);
                
                console.log(`✅ Réponse par règles (${responseTime}ms, confiance: ${ruleResult.confidence})`);
                return {
                    ...ruleResult,
                    approach: 'rules',
                    responseTime
                };
            }

            // ÉTAPE 2: Tentative avec l'Approche B (Embeddings)
            const embeddingResult = await this.tryEmbeddingBasedApproach(processedQuestion, userRole, enterpriseId);
            
            if (embeddingResult.success && embeddingResult.confidence >= this.confidenceThresholds.embeddings) {
                this.metrics.embeddingsSuccess++;
                const responseTime = Date.now() - startTime;
                this.updateMetrics(responseTime);
                
                console.log(`✅ Réponse par embeddings (${responseTime}ms, confiance: ${embeddingResult.confidence})`);
                return {
                    ...embeddingResult,
                    approach: 'embeddings',
                    responseTime
                };
            }

            // ÉTAPE 3: Fallback - Meilleure réponse disponible
            const fallbackResult = ruleResult.confidence > embeddingResult.confidence ? ruleResult : embeddingResult;
            
            if (fallbackResult.confidence >= this.confidenceThresholds.fallback) {
                const responseTime = Date.now() - startTime;
                this.updateMetrics(responseTime);
                
                console.log(`⚠️ Réponse fallback (${responseTime}ms, confiance: ${fallbackResult.confidence})`);
                return {
                    ...fallbackResult,
                    approach: 'fallback',
                    responseTime,
                    warning: 'Réponse avec confiance limitée'
                };
            }

            // ÉTAPE 4: Échec - Aucune réponse satisfaisante
            this.metrics.failures++;
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);

            console.log(`❌ Aucune réponse trouvée (${responseTime}ms)`);
            return this.getHelpResponse(userRole);

        } catch (error) {
            console.error('Erreur traitement question:', error);
            this.metrics.failures++;
            return {
                success: false,
                error: 'Erreur lors du traitement de votre question',
                approach: 'error'
            };
        }
    }

    /**
     * Préprocessing intelligent de la question
     */
    preprocessQuestion(question) {
        return question
            .toLowerCase()
            .trim()
            .replace(/[^\w\sàâäéèêëïîôöùûüÿç]/g, ' ')
            .replace(/\s+/g, ' ');
    }

    /**
     * APPROCHE A : Traitement par règles (Système expert)
     * Origine : Systèmes experts MYCIN (1976), DENDRAL (1965)
     * Principe : IF-THEN rules avec pattern matching
     */
    async tryRuleBasedApproach(question, userRole, enterpriseId) {
        try {
            // Détection du pattern de question
            for (const [patternName, config] of Object.entries(this.rulePatterns)) {
                for (const pattern of config.patterns) {
                    if (pattern.test(question)) {
                        console.log(`🔍 Pattern détecté: ${patternName}`);
                        
                        // Exécution du handler correspondant
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
            console.error('Erreur approche règles:', error);
            return { success: false, confidence: 0, method: 'rules' };
        }
    }

    /**
     * APPROCHE B : Traitement par embeddings sémantiques
     * Origine : Word2Vec (Mikolov, 2013), Sentence-BERT (Reimers, 2019)
     * Principe : Représentation vectorielle + similarité cosinus
     */
    async tryEmbeddingBasedApproach(question, userRole, enterpriseId) {
        try {
            // Génération de l'embedding de la question
            const questionEmbedding = await this.embeddingService.getEmbedding(question);
            if (!questionEmbedding) {
                return { success: false, confidence: 0, method: 'embeddings' };
            }

            // Recherche dans la base vectorielle avec filtre par rôle
            const searchResults = await this.vectorStore.searchWithFilter(
                questionEmbedding, 
                5, 
                { role: userRole }
            );

            if (searchResults.length === 0) {
                return { success: false, confidence: 0, method: 'embeddings' };
            }

            const bestMatch = searchResults[0];
            console.log(`🎯 Meilleur match: ${bestMatch.similarity.toFixed(3)} - ${bestMatch.metadata.question.substring(0, 50)}...`);

            // Traitement de la réponse selon le type
            let response = bestMatch.metadata.answer;
            
            // Si la réponse nécessite des données dynamiques
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
            console.error('Erreur approche embeddings:', error);
            return { success: false, confidence: 0, method: 'embeddings' };
        }
    }

    /**
     * Handlers pour les questions factuelles (Approche A)
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
     * Génération et indexation des embeddings pour la base de connaissances
     */
    async ensureEmbeddingsGenerated() {
        const stats = this.vectorStore.getStats();
        const totalQuestions = this.knowledgeBase.enterprise_questions.length + this.knowledgeBase.admin_questions.length;

        if (stats.totalVectors < totalQuestions) {
            console.log('🔄 Génération des embeddings pour la base de connaissances...');
            await this.generateAndIndexEmbeddings();
        }
    }

    async generateAndIndexEmbeddings() {
        const allQuestions = [
            ...this.knowledgeBase.enterprise_questions.map(q => ({ ...q, role: 'enterprise' })),
            ...this.knowledgeBase.admin_questions.map(q => ({ ...q, role: 'admin' }))
        ];

        // Génération des embeddings par batch
        const questions = allQuestions.map(q => q.question);
        const embeddings = await this.embeddingService.getBatchEmbeddings(questions);

        // Préparation des métadonnées
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

        // Indexation dans FAISS
        await this.vectorStore.addVectors(embeddings, metadata);
        await this.vectorStore.save();

        console.log(`✅ ${embeddings.length} embeddings générés et indexés`);
    }

    /**
     * Réponse d'aide par défaut
     */
    getHelpResponse(userRole) {
        const helpMessage = userRole === 'admin' 
            ? `Je peux vous aider avec :
📊 **Questions administratives :**
- "Combien d'entreprises sont enregistrées ?"
- "Quels sont les indicateurs de sécurité ?"
- "Comment générer un rapport global ?"

🔧 **Configuration système :**
- "Comment configurer les notifications ?"
- "Comment gérer les rôles utilisateurs ?"

📈 **Monitoring :**
- "Comment analyser les performances ?"
- "Quels sont les KPIs système ?"

Posez-moi une question spécifique !`
            : `Je peux vous aider avec :
💼 **Gestion d'entreprise :**
- "Comment améliorer ma rentabilité ?"
- "Quels sont les KPIs essentiels ?"
- "Comment motiver mes employés ?"

📊 **Vos données :**
- "Combien de KPIs ai-je ?"
- "Quels sont mes derniers rapports ?"

💡 **Conseils business :**
- "Comment développer ma stratégie marketing ?"
- "Comment gérer une crise de trésorerie ?"

Posez-moi une question !`;

        return {
            success: true,
            response: helpMessage,
            confidence: 1.0,
            approach: 'help'
        };
    }

    /**
     * Mise à jour des métriques de performance
     */
    updateMetrics(responseTime) {
        const alpha = 0.1; // Facteur de lissage pour la moyenne mobile
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
            vectorStore: this.vectorStore.getStats()
        };
    }

    /**
     * Nettoyage des ressources
     */
    async cleanup() {
        await this.embeddingService.cleanup();
        await this.vectorStore.destroy();
        this.isInitialized = false;
    }
}

module.exports = HybridQAService;

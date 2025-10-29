/**
 * Système de mémoire conversationnelle
 * Gestion de l'historique, du contexte et de l'apprentissage
 */

const fs = require('fs').promises;
const path = require('path');
const NodeCache = require('node-cache');

class ConversationMemory {
    constructor() {
        this.memoryPath = path.join(__dirname, '../data/conversation_memory.json');
        this.contextPath = path.join(__dirname, '../data/conversation_context.json');
        this.preferencesPath = path.join(__dirname, '../data/user_preferences.json');
        
        // Cache en mémoire pour les sessions actives
        this.sessionCache = new NodeCache({ 
            stdTTL: 3600, // 1 heure
            checkperiod: 300 // 5 minutes
        });
        
        this.contextCache = new NodeCache({ 
            stdTTL: 1800, // 30 minutes
            checkperiod: 300
        });
        
        this.preferencesCache = new NodeCache({ 
            stdTTL: 7200, // 2 heures
            checkperiod: 600
        });
        
        this.isInitialized = false;
        this.memoryData = {
            conversations: {},
            userProfiles: {},
            contextPatterns: {},
            learningData: {}
        };
        
        this.contextData = {
            activeSessions: {},
            topicChains: {},
            userJourneys: {}
        };
        
        this.preferencesData = {
            userPreferences: {},
            globalSettings: {
                maxHistoryLength: 100,
                contextWindowSize: 10,
                learningEnabled: true,
                privacyMode: false
            }
        };
    }

    /**
     * Initialisation du système de mémoire
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔄 Initialisation du système de mémoire conversationnelle...');

            // Chargement des données persistantes
            await this.loadMemoryData();
            await this.loadContextData();
            await this.loadPreferencesData();

            this.isInitialized = true;
            console.log('✅ Système de mémoire conversationnelle initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation mémoire:', error);
            this.isInitialized = true; // Continuer avec des données vides
        }
    }

    /**
     * Chargement des données de mémoire
     */
    async loadMemoryData() {
        try {
            const data = await fs.readFile(this.memoryPath, 'utf8');
            this.memoryData = JSON.parse(data);
            console.log('📚 Données de mémoire chargées');
        } catch (error) {
            console.log('📚 Création de nouvelles données de mémoire');
            await this.saveMemoryData();
        }
    }

    /**
     * Chargement des données de contexte
     */
    async loadContextData() {
        try {
            const data = await fs.readFile(this.contextPath, 'utf8');
            this.contextData = JSON.parse(data);
            console.log('🧠 Données de contexte chargées');
        } catch (error) {
            console.log('🧠 Création de nouvelles données de contexte');
            await this.saveContextData();
        }
    }

    /**
     * Chargement des préférences utilisateur
     */
    async loadPreferencesData() {
        try {
            const data = await fs.readFile(this.preferencesPath, 'utf8');
            this.preferencesData = JSON.parse(data);
            console.log('⚙️ Préférences utilisateur chargées');
        } catch (error) {
            console.log('⚙️ Création de nouvelles préférences');
            await this.savePreferencesData();
        }
    }

    /**
     * Sauvegarde des données de mémoire
     */
    async saveMemoryData() {
        try {
            await fs.writeFile(
                this.memoryPath,
                JSON.stringify(this.memoryData, null, 2)
            );
        } catch (error) {
            console.error('Erreur sauvegarde mémoire:', error);
        }
    }

    /**
     * Sauvegarde des données de contexte
     */
    async saveContextData() {
        try {
            await fs.writeFile(
                this.contextPath,
                JSON.stringify(this.contextData, null, 2)
            );
        } catch (error) {
            console.error('Erreur sauvegarde contexte:', error);
        }
    }

    /**
     * Sauvegarde des préférences
     */
    async savePreferencesData() {
        try {
            await fs.writeFile(
                this.preferencesPath,
                JSON.stringify(this.preferencesData, null, 2)
            );
        } catch (error) {
            console.error('Erreur sauvegarde préférences:', error);
        }
    }

    /**
     * Ajout d'une conversation
     */
    async addConversation(sessionId, userId, userRole, enterpriseId, messages) {
        if (!this.isInitialized) await this.initialize();

        const conversation = {
            sessionId,
            userId,
            userRole,
            enterpriseId,
            startTime: new Date(),
            lastActivity: new Date(),
            messages: messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                isUser: msg.isUser,
                timestamp: msg.timestamp,
                confidence: msg.confidence,
                approach: msg.approach,
                metadata: msg.metadata
            })),
            summary: this.generateConversationSummary(messages),
            topics: this.extractTopics(messages),
            sentiment: this.analyzeSentiment(messages),
            satisfaction: this.calculateSatisfaction(messages)
        };

        // Mise à jour des données
        this.memoryData.conversations[sessionId] = conversation;
        
        // Mise à jour du profil utilisateur
        await this.updateUserProfile(userId, userRole, enterpriseId, conversation);
        
        // Mise à jour du contexte
        await this.updateContext(sessionId, userId, conversation);
        
        // Apprentissage des patterns
        await this.learnFromConversation(conversation);

        // Sauvegarde
        await this.saveMemoryData();
        await this.saveContextData();
    }

    /**
     * Récupération de l'historique utilisateur
     */
    async getUserHistory(userId, limit = 10) {
        if (!this.isInitialized) await this.initialize();

        const userConversations = Object.values(this.memoryData.conversations)
            .filter(conv => conv.userId === userId)
            .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
            .slice(0, limit);

        return userConversations;
    }

    /**
     * Récupération du contexte de session
     */
    async getSessionContext(sessionId) {
        if (!this.isInitialized) await this.initialize();

        // Vérification du cache
        const cachedContext = this.contextCache.get(sessionId);
        if (cachedContext) {
            return cachedContext;
        }

        const conversation = this.memoryData.conversations[sessionId];
        if (!conversation) {
            return null;
        }

        const context = {
            sessionId,
            userId: conversation.userId,
            userRole: conversation.userRole,
            enterpriseId: conversation.enterpriseId,
            currentTopic: this.getCurrentTopic(conversation),
            relatedTopics: this.getRelatedTopics(conversation),
            userPreferences: await this.getUserPreferences(conversation.userId),
            conversationSummary: conversation.summary,
            lastMessages: conversation.messages.slice(-5),
            suggestedActions: this.generateSuggestedActions(conversation)
        };

        // Mise en cache
        this.contextCache.set(sessionId, context);
        
        return context;
    }

    /**
     * Génération de suggestions personnalisées
     */
    async getPersonalizedSuggestions(userId, userRole, enterpriseId) {
        if (!this.isInitialized) await this.initialize();

        const userProfile = this.memoryData.userProfiles[userId];
        if (!userProfile) {
            return this.getDefaultSuggestions(userRole);
        }

        const suggestions = [];
        
        // Suggestions basées sur l'historique
        const frequentTopics = this.getFrequentTopics(userProfile);
        frequentTopics.forEach(topic => {
            suggestions.push({
                text: `En savoir plus sur ${topic}`,
                category: 'history',
                confidence: 0.8
            });
        });

        // Suggestions basées sur les préférences
        const preferences = await this.getUserPreferences(userId);
        if (preferences.responseStyle === 'detailed') {
            suggestions.push({
                text: 'Donne-moi des détails sur...',
                category: 'preferences',
                confidence: 0.7
            });
        }

        // Suggestions basées sur le rôle
        const roleSuggestions = this.getRoleBasedSuggestions(userRole, enterpriseId);
        suggestions.push(...roleSuggestions);

        // Suggestions basées sur les patterns d'apprentissage
        const learnedPatterns = this.getLearnedPatterns(userId);
        suggestions.push(...learnedPatterns);

        return suggestions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 8)
            .map(s => s.text);
    }

    /**
     * Mise à jour du profil utilisateur
     */
    async updateUserProfile(userId, userRole, enterpriseId, conversation) {
        if (!this.memoryData.userProfiles[userId]) {
            this.memoryData.userProfiles[userId] = {
                userId,
                userRole,
                enterpriseId,
                firstSeen: new Date(),
                lastSeen: new Date(),
                totalConversations: 0,
                totalMessages: 0,
                averageSatisfaction: 0,
                preferredTopics: [],
                interactionPatterns: {},
                learningData: {}
            };
        }

        const profile = this.memoryData.userProfiles[userId];
        
        profile.lastSeen = new Date();
        profile.totalConversations++;
        profile.totalMessages += conversation.messages.length;
        
        // Mise à jour de la satisfaction moyenne
        const totalSatisfaction = profile.averageSatisfaction * (profile.totalConversations - 1) + conversation.satisfaction;
        profile.averageSatisfaction = totalSatisfaction / profile.totalConversations;

        // Mise à jour des sujets préférés
        conversation.topics.forEach(topic => {
            if (!profile.preferredTopics.find(t => t.name === topic)) {
                profile.preferredTopics.push({
                    name: topic,
                    frequency: 1,
                    lastUsed: new Date()
                });
            } else {
                const existingTopic = profile.preferredTopics.find(t => t.name === topic);
                existingTopic.frequency++;
                existingTopic.lastUsed = new Date();
            }
        });

        // Tri par fréquence
        profile.preferredTopics.sort((a, b) => b.frequency - a.frequency);
        profile.preferredTopics = profile.preferredTopics.slice(0, 10);
    }

    /**
     * Génération d'un résumé de conversation
     */
    generateConversationSummary(messages) {
        const userMessages = messages.filter(m => m.isUser);
        const assistantMessages = messages.filter(m => !m.isUser);
        
        const topics = this.extractTopics(messages);
        const mainTopic = topics[0] || 'général';
        
        return {
            messageCount: messages.length,
            userQuestions: userMessages.length,
            assistantResponses: assistantMessages.length,
            mainTopic,
            topics,
            duration: this.calculateConversationDuration(messages),
            complexity: this.assessComplexity(messages)
        };
    }

    /**
     * Extraction des sujets
     */
    extractTopics(messages) {
        const topics = new Set();
        
        messages.forEach(message => {
            if (message.metadata?.category) {
                topics.add(message.metadata.category);
            }
            if (message.metadata?.keywords) {
                message.metadata.keywords.forEach(keyword => {
                    if (keyword.length > 3) {
                        topics.add(keyword);
                    }
                });
            }
        });

        return Array.from(topics);
    }

    /**
     * Analyse du sentiment
     */
    analyzeSentiment(messages) {
        const userMessages = messages.filter(m => m.isUser);
        const assistantMessages = messages.filter(m => !m.isUser);
        
        // Analyse simple basée sur les mots-clés
        const positiveWords = ['merci', 'parfait', 'excellent', 'super', 'génial'];
        const negativeWords = ['erreur', 'problème', 'difficile', 'confus', 'mauvais'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        userMessages.forEach(message => {
            const content = message.content.toLowerCase();
            positiveWords.forEach(word => {
                if (content.includes(word)) positiveCount++;
            });
            negativeWords.forEach(word => {
                if (content.includes(word)) negativeCount++;
            });
        });

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    /**
     * Calcul de la satisfaction
     */
    calculateSatisfaction(messages) {
        const feedbackMessages = messages.filter(m => m.feedback);
        if (feedbackMessages.length === 0) return 0.5; // Valeur par défaut

        const positiveFeedback = feedbackMessages.filter(m => m.feedback === 'positive').length;
        return positiveFeedback / feedbackMessages.length;
    }

    /**
     * Suggestions par défaut
     */
    getDefaultSuggestions(userRole) {
        return userRole === 'admin' 
            ? [
                'Affiche-moi les statistiques globales',
                'Comment gérer les utilisateurs ?',
                'Configuration du système',
                'Rapports de performance'
              ]
            : [
                'Affiche-moi mes KPIs',
                'Comment créer un rapport ?',
                'Améliorer mes performances',
                'Historique des activités'
              ];
    }

    /**
     * Suggestions basées sur le rôle
     */
    getRoleBasedSuggestions(userRole, enterpriseId) {
        const suggestions = [];
        
        if (userRole === 'admin') {
            suggestions.push(
                { text: 'Statistiques des entreprises', category: 'admin', confidence: 0.9 },
                { text: 'Gestion des utilisateurs', category: 'admin', confidence: 0.9 },
                { text: 'Configuration système', category: 'admin', confidence: 0.8 },
                { text: 'Rapports globaux', category: 'admin', confidence: 0.8 }
            );
        } else {
            suggestions.push(
                { text: 'Mes KPIs actuels', category: 'enterprise', confidence: 0.9 },
                { text: 'Créer un nouveau rapport', category: 'enterprise', confidence: 0.9 },
                { text: 'Améliorer mes performances', category: 'enterprise', confidence: 0.8 },
                { text: 'Comparaison avec le secteur', category: 'enterprise', confidence: 0.7 }
            );
        }

        return suggestions;
    }

    /**
     * Récupération des préférences utilisateur
     */
    async getUserPreferences(userId) {
        const cached = this.preferencesCache.get(userId);
        if (cached) return cached;

        const preferences = this.preferencesData.userPreferences[userId] || {
            language: 'fr',
            responseStyle: 'detailed',
            showConfidence: true,
            enableSuggestions: true,
            enableAdvancedFeatures: false,
            autoSaveConversations: true,
            theme: 'auto',
            notifications: {
                newSuggestions: true,
                serviceUpdates: true,
                performanceAlerts: true
            }
        };

        this.preferencesCache.set(userId, preferences);
        return preferences;
    }

    /**
     * Statistiques du système de mémoire
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            totalConversations: Object.keys(this.memoryData.conversations).length,
            totalUsers: Object.keys(this.memoryData.userProfiles).length,
            activeSessions: Object.keys(this.contextData.activeSessions).length,
            cacheStats: {
                sessionCache: this.sessionCache.getStats(),
                contextCache: this.contextCache.getStats(),
                preferencesCache: this.preferencesCache.getStats()
            },
            memorySize: JSON.stringify(this.memoryData).length,
            contextSize: JSON.stringify(this.contextData).length,
            preferencesSize: JSON.stringify(this.preferencesData).length
        };
    }

    /**
     * Nettoyage des données anciennes
     */
    async cleanup() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Nettoyage des conversations anciennes
        Object.keys(this.memoryData.conversations).forEach(sessionId => {
            const conversation = this.memoryData.conversations[sessionId];
            if (new Date(conversation.lastActivity) < thirtyDaysAgo) {
                delete this.memoryData.conversations[sessionId];
            }
        });

        // Nettoyage des sessions inactives
        Object.keys(this.contextData.activeSessions).forEach(sessionId => {
            const session = this.contextData.activeSessions[sessionId];
            if (new Date(session.lastActivity) < thirtyDaysAgo) {
                delete this.contextData.activeSessions[sessionId];
            }
        });

        await this.saveMemoryData();
        await this.saveContextData();
        
        console.log('🧹 Nettoyage des données anciennes terminé');
    }

    /**
     * Nettoyage des ressources
     */
    async destroy() {
        await this.saveMemoryData();
        await this.saveContextData();
        await this.savePreferencesData();
        
        this.sessionCache.destroy();
        this.contextCache.destroy();
        this.preferencesCache.destroy();
        
        this.isInitialized = false;
    }
}

module.exports = ConversationMemory;

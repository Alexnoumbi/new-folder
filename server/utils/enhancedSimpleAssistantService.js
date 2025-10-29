const KnowledgeBaseService = require('./knowledgeBaseService');

class EnhancedSimpleAssistantService {
  constructor() {
    this.knowledgeBase = new KnowledgeBaseService();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🚀 Initialisation du service assistant amélioré...');
      
      const kbInitialized = await this.knowledgeBase.initialize();
      if (!kbInitialized) {
        console.error('❌ Échec initialisation base de connaissances');
        return false;
      }

      this.isInitialized = true;
      console.log('✅ Service assistant amélioré initialisé');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation service assistant:', error);
      return false;
    }
  }

  /**
   * Traite une question en utilisant la base de connaissances
   * @param {string} question - Question posée
   * @param {string} userRole - Rôle de l'utilisateur
   * @param {string} enterpriseId - ID de l'entreprise (optionnel)
   * @returns {Object} Réponse enrichie
   */
  async processQuestion(question, userRole = 'admin', enterpriseId = null) {
    const startTime = Date.now();
    const questionId = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`🧠 [${questionId}] === TRAITEMENT QUESTION BASE DE CONNAISSANCES ===`);
      console.log(`🧠 [${questionId}] Question: "${question}"`);
      console.log(`🧠 [${questionId}] UserRole: ${userRole}`);

      if (!this.isInitialized) {
        console.log(`🔄 [${questionId}] Initialisation en cours...`);
        await this.initialize();
        if (!this.isInitialized) {
          console.log(`❌ [${questionId}] Échec initialisation`);
          return {
            success: false,
            error: 'Service non disponible',
            responseTime: Date.now() - startTime
          };
        }
      }

      // Rechercher dans la base de connaissances
      console.log(`🔍 [${questionId}] Recherche dans la base de connaissances...`);
      const knowledgeMatch = await this.knowledgeBase.searchKnowledge(question);
      
      if (knowledgeMatch && knowledgeMatch.score > 0.3) {
        console.log(`✅ [${questionId}] Correspondance trouvée (score: ${knowledgeMatch.score.toFixed(2)})`);
        
        const enrichedResponse = this.knowledgeBase.enrichResponse(knowledgeMatch, question);
        
        const responseTime = Date.now() - startTime;
        console.log(`📤 [${questionId}] Réponse générée en ${responseTime}ms`);
        
        return {
          success: true,
          question: question,
          answer: enrichedResponse.answer,
          approach: 'knowledge_base',
          confidence: enrichedResponse.confidence,
          responseTime: responseTime,
          service: 'enhanced',
          metadata: {
            category: enrichedResponse.category,
            source: 'knowledge_base',
            score: knowledgeMatch.score,
            hasDetails: !!enrichedResponse.details,
            hasSteps: !!enrichedResponse.steps,
            quickActions: enrichedResponse.quickActions
          },
          timestamp: new Date()
        };
      }

      // Si aucune correspondance dans la base de connaissances, utiliser les réponses de base
      console.log(`🔄 [${questionId}] Aucune correspondance KB, utilisation des réponses de base`);
      const fallbackResponse = this.getFallbackResponse(question);
      
      const responseTime = Date.now() - startTime;
      console.log(`📤 [${questionId}] Réponse fallback générée en ${responseTime}ms`);
      
      return {
        success: true,
        question: question,
        answer: fallbackResponse,
        approach: 'fallback',
        confidence: 0.6,
        responseTime: responseTime,
        service: 'enhanced',
        metadata: {
          source: 'fallback_responses',
          note: 'Réponse générique - base de connaissances en cours d\'enrichissement'
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error(`❌ [${questionId}] Erreur traitement question KB:`, {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5)
      });
      
      return {
        success: false,
        error: 'Erreur lors du traitement de votre question',
        approach: 'error',
        responseTime: Date.now() - startTime,
        service: 'enhanced',
        timestamp: new Date()
      };
    }
  }

  /**
   * Réponses de fallback pour les questions non trouvées dans la KB
   * @param {string} question - Question posée
   * @returns {string} Réponse de fallback
   */
  getFallbackResponse(question) {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('bonjour') || questionLower.includes('salut')) {
      return '👋 **Bonjour !** Je suis votre assistant IA administrateur.\n\nJe peux vous aider avec la gestion des utilisateurs, entreprises, rapports, configuration système et sécurité.\n\n**Posez-moi une question spécifique pour obtenir des informations détaillées !**';
    } else if (questionLower.includes('aide') || questionLower.includes('help')) {
      return '🆘 **Centre d\'Aide**\n\nJe peux vous aider avec :\n• **Statistiques** : Utilisateurs, entreprises, performance\n• **Gestion** : Création, modification, validation\n• **Rapports** : Génération et analyses\n• **Configuration** : Paramètres système\n• **Sécurité** : Audit et monitoring\n\n**Exemples de questions :**\n• "Combien d\'utilisateurs sont connectés ?"\n• "Comment créer un utilisateur ?"\n• "Quelles entreprises sont en attente ?"';
    } else if (questionLower.includes('merci')) {
      return '😊 **Je vous en prie !**\n\nN\'hésitez pas si vous avez d\'autres questions. Je suis là pour vous aider !';
    } else {
      return `🤔 **Question reçue :** "${question}"\n\nJe comprends votre demande. Voici ce que je peux vous aider à faire :\n\n📊 **Statistiques & Données**\n• Nombre d\'utilisateurs et entreprises\n• Métriques de performance\n• Analyses de tendances\n\n👥 **Gestion**\n• Utilisateurs et comptes\n• Entreprises et validations\n• Rôles et permissions\n\n📋 **Rapports**\n• Génération de rapports\n• Analyses détaillées\n• Exports de données\n\n⚙️ **Système**\n• Configuration\n• Monitoring\n• Sécurité\n\n**Pour une réponse plus précise, utilisez des mots-clés spécifiques !**`;
    }
  }

  /**
   * Obtient les statistiques du service
   * @returns {Object} Statistiques
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      knowledgeBase: this.knowledgeBase.getStats(),
      service: 'enhanced_simple_assistant',
      version: '1.0.0'
    };
  }

  /**
   * Recharge la base de connaissances
   * @returns {boolean} Succès du rechargement
   */
  async reloadKnowledge() {
    try {
      console.log('🔄 Rechargement de la base de connaissances...');
      const success = await this.knowledgeBase.reload();
      console.log(success ? '✅ Base de connaissances rechargée' : '❌ Échec rechargement');
      return success;
    } catch (error) {
      console.error('❌ Erreur rechargement KB:', error);
      return false;
    }
  }

  /**
   * Recherche dans la base de connaissances
   * @param {string} query - Requête de recherche
   * @param {string} category - Catégorie spécifique (optionnel)
   * @returns {Object} Résultats de recherche
   */
  async searchKnowledge(query, category = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isInitialized) {
      return null;
    }

    return await this.knowledgeBase.searchKnowledge(query, category);
  }
}

module.exports = EnhancedSimpleAssistantService;

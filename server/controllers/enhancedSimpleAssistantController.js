const EnhancedSimpleAssistantService = require('../utils/enhancedSimpleAssistantService');

class EnhancedSimpleAssistantController {
  constructor() {
    this.service = new EnhancedSimpleAssistantService();
    this.isInitialized = false;
  }

  async initializeServices() {
    if (this.isInitialized) {
      return true;
    }

    try {
      console.log('🚀 Initialisation du contrôleur assistant amélioré...');
      const success = await this.service.initialize();
      this.isInitialized = success;
      
      if (success) {
        console.log('✅ Contrôleur assistant amélioré initialisé');
      } else {
        console.log('❌ Échec initialisation contrôleur assistant');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erreur initialisation contrôleur:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Traite une question utilisateur
   */
  async askQuestion(req, res) {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`🚀 [${requestId}] === DÉBUT TRAITEMENT QUESTION AMÉLIORÉE ===`);
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

      // Vérifier l'initialisation
      if (!this.isInitialized) {
        console.log(`🔄 [${requestId}] Initialisation en cours...`);
        await this.initializeServices();
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
        userRole: userRole
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

      console.log(`🤖 [${requestId}] Appel au service amélioré...`);
      const response = await this.service.processQuestion(
        question, 
        userRole, 
        enterpriseId || req.user?.entrepriseId || req.user?.id
      );

      console.log(`📊 [${requestId}] Réponse du service:`, {
        success: response.success,
        hasAnswer: !!response.answer,
        approach: response.approach,
        confidence: response.confidence,
        responseTime: response.responseTime,
        error: response.error
      });

      if (!response.success) {
        console.log(`❌ [${requestId}] Échec du service:`, response.error);
        return res.status(500).json({ 
          success: false,
          error: response.error || 'Erreur lors du traitement'
        });
      }

      console.log(`✅ [${requestId}] Réponse générée en ${response.responseTime}ms (${response.approach})`);
      console.log(`📤 [${requestId}] Envoi de la réponse au client`);

      res.json(response);

    } catch (error) {
      console.error(`❌ [${requestId}] Erreur contrôleur assistant amélioré:`, {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5),
        name: error.name
      });
      
      const errorResponse = {
        success: false,
        error: 'Erreur lors du traitement de la question',
        responseTime: Date.now() - startTime,
        service: 'enhanced',
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
   * Obtient les statistiques du service
   */
  async getStats(req, res) {
    try {
      const stats = this.service.getStats();
      res.json({
        success: true,
        stats: stats,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  /**
   * Recharge la base de connaissances
   */
  async reloadKnowledge(req, res) {
    try {
      console.log('🔄 Demande de rechargement de la base de connaissances...');
      const success = await this.service.reloadKnowledge();
      
      res.json({
        success: success,
        message: success ? 'Base de connaissances rechargée' : 'Échec du rechargement',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('❌ Erreur rechargement KB:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du rechargement'
      });
    }
  }

  /**
   * Recherche dans la base de connaissances
   */
  async searchKnowledge(req, res) {
    try {
      const { query, category } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Paramètre query requis'
        });
      }

      const results = await this.service.searchKnowledge(query, category);
      
      res.json({
        success: true,
        query: query,
        category: category,
        results: results,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('❌ Erreur recherche KB:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la recherche'
      });
    }
  }

  /**
   * Health check du service
   */
  async healthCheck(req, res) {
    try {
      const stats = this.service.getStats();
      
      res.json({
        success: true,
        status: this.isInitialized ? 'healthy' : 'degraded',
        service: 'enhanced_simple_assistant',
        initialized: this.isInitialized,
        knowledgeBase: stats.knowledgeBase,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('❌ Erreur health check:', error);
      res.status(500).json({
        success: false,
        status: 'error',
        error: 'Service non disponible'
      });
    }
  }
}

module.exports = EnhancedSimpleAssistantController;

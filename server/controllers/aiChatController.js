const AIConversation = require('../models/AIConversation');
const SubmissionRequest = require('../models/SubmissionRequest');
const User = require('../models/User');
const Entreprise = require('../models/Entreprise');
const aiService = require('../utils/aiService');
const aiDatabaseQuery = require('../utils/aiDatabaseQuery');
const aiKnowledgeBase = require('../utils/aiKnowledgeBase');
const { validationResult } = require('express-validator');

// Envoyer un message à l'IA admin
const sendAdminMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { message, conversationId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.typeCompte;

    // Vérifier que l'utilisateur est admin
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Réservé aux administrateurs.'
      });
    }

    let conversation;
    
    // Récupérer ou créer la conversation
    if (conversationId) {
      conversation = await AIConversation.findOne({
        _id: conversationId,
        userId,
        role: 'admin'
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation non trouvée'
        });
      }
    } else {
      conversation = new AIConversation({
        userId,
        role: 'admin',
        messages: [],
        metadata: {}
      });
      await conversation.save();
    }

    // Ajouter le message utilisateur
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Préparer le contexte de base de données
    let dbContext = {};
    try {
      // Analyser la question pour déterminer si une requête DB est nécessaire
      if (aiService.analyzeIntent(message) === 'analytics' || 
          message.toLowerCase().includes('combien') ||
          message.toLowerCase().includes('statistique')) {
        
        const dbResults = await aiDatabaseQuery.executeQuery(message, 'admin');
        dbContext = {
          hasDatabaseAccess: true,
          queryResults: dbResults,
          timestamp: new Date()
        };
      }
    } catch (dbError) {
      console.warn('Erreur lors de la requête DB:', dbError.message);
      dbContext = {
        hasDatabaseAccess: false,
        error: 'Impossible d\'accéder aux données'
      };
    }

    // Générer la réponse IA
    const aiResponse = await aiService.generateAdminResponse(
      conversation.messages.slice(-5), // Derniers 5 messages pour le contexte
      dbContext
    );

    // Ajouter la réponse IA
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      metadata: { dbContext }
    });

    conversation.lastActivity = new Date();
    await conversation.save();

    res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        message: {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// Envoyer un message à l'IA entreprise
const sendEnterpriseMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { message, conversationId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.typeCompte;

    // Vérifier que l'utilisateur est entreprise
    if (userRole !== 'entreprise') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Réservé aux entreprises.'
      });
    }

    let conversation;
    
    // Récupérer ou créer la conversation
    if (conversationId) {
      conversation = await AIConversation.findOne({
        _id: conversationId,
        userId,
        role: 'entreprise'
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation non trouvée'
        });
      }
    } else {
      // Récupérer les informations de l'entreprise pour le contexte
      const user = await User.findById(userId).populate('entrepriseId');
      const entreprise = user.entrepriseId;
      
      conversation = new AIConversation({
        userId,
        role: 'entreprise',
        messages: [],
        metadata: {
          entrepriseId: entreprise?._id,
          context: {
            nomEntreprise: entreprise?.identification?.nomEntreprise,
            secteur: entreprise?.identification?.secteur,
            statut: entreprise?.statut
          }
        }
      });
      await conversation.save();
    }

    // Ajouter le message utilisateur
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Rechercher dans la base de connaissances d'abord
    let knowledgeResponse = null;
    try {
      knowledgeResponse = aiKnowledgeBase.getContextualResponse(
        message, 
        { 
          role: 'entreprise',
          entrepriseId: conversation.metadata.entrepriseId,
          context: conversation.metadata.context
        }
      );
    } catch (kbError) {
      console.warn('Erreur lors de la recherche dans la base de connaissances:', kbError.message);
    }

    // Générer la réponse IA
    const aiResponse = knowledgeResponse || await aiService.generateEnterpriseResponse(
      conversation.messages.slice(-5), // Derniers 5 messages pour le contexte
      conversation.metadata.context
    );

    // Ajouter la réponse IA
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      metadata: { 
        fromKnowledgeBase: !!knowledgeResponse,
        intent: aiService.analyzeIntent(message)
      }
    });

    conversation.lastActivity = new Date();
    await conversation.save();

    res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        message: {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        },
        canEscalate: aiService.analyzeIntent(message) === 'support'
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// Récupérer les conversations d'un utilisateur
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.typeCompte;
    const { page = 1, limit = 10, role } = req.query;

    const query = { userId };
    
    // Filtrer par rôle si spécifié et autorisé
    if (role && (userRole === 'admin' || role === userRole)) {
      query.role = role;
    } else if (userRole !== 'admin') {
      query.role = userRole; // Les non-admins ne voient que leurs conversations
    }

    const skip = (page - 1) * limit;
    
    const conversations = await AIConversation.find(query)
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'nom email')
      .populate('metadata.entrepriseId', 'identification.nomEntreprise')
      .select('-messages') // Exclure les messages pour la liste
      .lean();

    const total = await AIConversation.countDocuments(query);

    // Ajouter des métadonnées utiles
    const enrichedConversations = conversations.map(conv => ({
      ...conv,
      messageCount: conv.messages?.length || 0,
      lastMessage: conv.messages?.[conv.messages.length - 1]?.content?.substring(0, 100) + '...' || 'Aucun message',
      isActive: conv.isActive,
      canEscalate: conv.role === 'entreprise' && !conv.metadata.escalated
    }));

    res.json({
      success: true,
      data: {
        conversations: enrichedConversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// Récupérer les détails d'une conversation
const getConversationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.typeCompte;

    const conversation = await AIConversation.findOne({
      _id: id,
      userId: userRole === 'admin' ? { $exists: true } : userId // Les admins peuvent voir toutes les conversations
    })
      .populate('userId', 'nom email typeCompte')
      .populate('metadata.entrepriseId', 'identification.nomEntreprise identification.secteur')
      .populate('metadata.escalationId', 'status notes');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Vérifier les permissions
    if (userRole !== 'admin' && conversation.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    res.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails de conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// Escalader une conversation vers un administrateur
const escalateToAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { conversationId, details } = req.body;
    const userId = req.user.id;
    const userRole = req.user.typeCompte;

    // Vérifier que l'utilisateur est entreprise
    if (userRole !== 'entreprise') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Réservé aux entreprises.'
      });
    }

    // Récupérer la conversation
    const conversation = await AIConversation.findOne({
      _id: conversationId,
      userId,
      role: 'entreprise'
    }).populate('userId', 'email nom');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Vérifier si déjà escaladée
    if (conversation.metadata.escalated) {
      return res.status(400).json({
        success: false,
        message: 'Cette conversation a déjà été escaladée'
      });
    }

    // Créer une SubmissionRequest
    const submissionRequest = new SubmissionRequest({
      entreprise: conversation.userId.nom || 'Entreprise',
      email: conversation.userId.email,
      projet: 'Support IA - Escalade',
      description: `Demande d'escalade depuis l'assistant IA.\n\nContexte de la conversation:\n${details}\n\nHistorique des messages:\n${conversation.messages.map(m => `${m.role}: ${m.content}`).join('\n')}`,
      source: 'AI_ESCALATION',
      conversationId: conversation._id,
      aiContext: {
        conversationSummary: details,
        messageCount: conversation.messages.length,
        lastActivity: conversation.lastActivity,
        intent: aiService.analyzeIntent(conversation.messages[conversation.messages.length - 1]?.content || '')
      },
      status: 'NEW'
    });

    await submissionRequest.save();

    // Mettre à jour la conversation
    conversation.metadata.escalated = true;
    conversation.metadata.escalationId = submissionRequest._id;
    await conversation.save();

    // Ajouter un message de confirmation
    conversation.messages.push({
      role: 'assistant',
      content: `✅ Votre demande a été escaladée vers un administrateur.\n\n**Référence de la demande :** ${submissionRequest._id}\n**Statut :** En attente de traitement\n\nUn administrateur vous contactera dans les plus brefs délais. Vous pouvez suivre l'avancement de votre demande dans la section "Support IA" de votre tableau de bord.`,
      timestamp: new Date(),
      metadata: { 
        type: 'escalation_confirmation',
        submissionRequestId: submissionRequest._id
      }
    });

    await conversation.save();

    res.json({
      success: true,
      message: 'Demande escaladée avec succès',
      data: {
        submissionRequestId: submissionRequest._id,
        status: 'NEW'
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'escalade:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// Supprimer une conversation
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.typeCompte;

    const conversation = await AIConversation.findOne({
      _id: id,
      userId: userRole === 'admin' ? { $exists: true } : userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Vérifier les permissions
    if (userRole !== 'admin' && conversation.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    await AIConversation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Conversation supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// Obtenir les statistiques des conversations IA (admin seulement)
const getAIStats = async (req, res) => {
  try {
    const userRole = req.user.typeCompte;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé. Réservé aux administrateurs.'
      });
    }

    const [
      totalConversations,
      adminConversations,
      enterpriseConversations,
      escalatedConversations,
      recentConversations,
      popularIntents
    ] = await Promise.all([
      AIConversation.countDocuments(),
      AIConversation.countDocuments({ role: 'admin' }),
      AIConversation.countDocuments({ role: 'entreprise' }),
      AIConversation.countDocuments({ 'metadata.escalated': true }),
      AIConversation.countDocuments({ 
        lastActivity: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      }),
      AIConversation.aggregate([
        { $match: { 'messages.metadata.intent': { $exists: true } } },
        { $unwind: '$messages' },
        { $match: { 'messages.metadata.intent': { $exists: true } } },
        { $group: { _id: '$messages.metadata.intent', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalConversations,
        adminConversations,
        enterpriseConversations,
        escalatedConversations,
        recentConversations,
        popularIntents,
        escalationRate: enterpriseConversations > 0 ? 
          (escalatedConversations / enterpriseConversations * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques IA:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

module.exports = {
  sendAdminMessage,
  sendEnterpriseMessage,
  getConversations,
  getConversationDetails,
  escalateToAdmin,
  deleteConversation,
  getAIStats
};

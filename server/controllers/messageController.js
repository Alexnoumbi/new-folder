const Message = require('../models/Message');
const Entreprise = require('../models/Entreprise');
const User = require('../models/User');

// Obtenir toutes les conversations (groupées par entreprise)
exports.getConversations = async (req, res) => {
  try {
    console.log('GetConversations - Fetching all conversations...');

    // Obtenir toutes les entreprises avec des messages
    const conversations = await Message.aggregate([
      {
        $group: {
          _id: '$entrepriseId',
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
          },
          totalMessages: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'entreprises',
          localField: '_id',
          foreignField: '_id',
          as: 'entreprise'
        }
      },
      {
        $unwind: { path: '$entreprise', preserveNullAndEmptyArrays: true }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    console.log(`Found ${conversations.length} conversations`);

    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations',
      error: error.message
    });
  }
};

// Obtenir les messages d'une entreprise
exports.getMessagesByEntreprise = async (req, res) => {
  try {
    const { entrepriseId } = req.params;
    console.log(`GetMessages for entreprise: ${entrepriseId}`);

    const messages = await Message.find({ entrepriseId })
      .populate('sender', 'nom prenom email role')
      .populate('recipient', 'nom prenom email role')
      .sort({ createdAt: 1 }); // Ordre chronologique

    console.log(`Found ${messages.length} messages`);

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, entrepriseId, content, attachments } = req.body;

    console.log('SendMessage called:', { recipientId, entrepriseId, contentLength: content?.length, user: req.user });

    if (!entrepriseId || !content) {
      console.log('Validation failed: missing entrepriseId or content');
      return res.status(400).json({
        success: false,
        message: 'entrepriseId et content sont requis'
      });
    }

    // Vérifier que l'entreprise existe
    const entreprise = await Entreprise.findById(entrepriseId);
    if (!entreprise) {
      console.log('Entreprise not found:', entrepriseId);
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    // Créer un utilisateur par défaut si req.user n'existe pas
    let senderId = req.user?._id || req.user?.id || null;
    
    // Si toujours null, créer un ID par défaut (admin système)
    if (!senderId) {
      console.log('No user found, using default admin ID');
      // Chercher un utilisateur admin par défaut
      const adminUser = await User.findOne({ role: 'admin' }).limit(1);
      senderId = adminUser?._id || '000000000000000000000000';
    }

    console.log('Creating message with sender:', senderId);

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId || null,
      entrepriseId,
      content,
      attachments: attachments || [],
      read: false
    });

    console.log('Message created, populating...');

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'nom prenom email role')
      .populate('recipient', 'nom prenom email role')
      .populate('entrepriseId', 'identification.nomEntreprise nom name');

    console.log('Message created successfully:', message._id);

    res.status(201).json({
      success: true,
      data: populatedMessage,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Marquer un message comme lu
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du message',
      error: error.message
    });
  }
};

// Marquer tous les messages d'une conversation comme lus
exports.markConversationAsRead = async (req, res) => {
  try {
    const { entrepriseId } = req.params;

    const result = await Message.updateMany(
      { entrepriseId, read: false },
      { read: true }
    );

    console.log(`Marked ${result.modifiedCount} messages as read`);

    res.json({
      success: true,
      message: `${result.modifiedCount} message(s) marqué(s) comme lu(s)`
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// Supprimer un message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message',
      error: error.message
    });
  }
};

// Obtenir les statistiques des messages
exports.getMessageStats = async (req, res) => {
  try {
    const [total, unread, byEntreprise] = await Promise.all([
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Message.aggregate([
        {
          $group: {
            _id: '$entrepriseId',
            count: { $sum: 1 },
            unreadCount: {
              $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total,
        unread,
        read: total - unread,
        topEntreprises: byEntreprise
      }
    });
  } catch (error) {
    console.error('Error getting message stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Rechercher dans les messages
exports.searchMessages = async (req, res) => {
  try {
    const { query, entrepriseId } = req.query;

    const filter = {};
    if (entrepriseId) filter.entrepriseId = entrepriseId;
    if (query) {
      filter.$text = { $search: query };
    }

    const messages = await Message.find(filter)
      .populate('sender', 'nom prenom email')
      .populate('entrepriseId', 'identification.nomEntreprise nom name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
};


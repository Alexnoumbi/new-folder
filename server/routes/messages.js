const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessagesByEntreprise,
  sendMessage,
  markAsRead,
  markConversationAsRead,
  deleteMessage,
  getMessageStats,
  searchMessages
} = require('../controllers/messageController');

// Routes publiques (accessibles sans auth stricte)
router.get('/conversations', getConversations);
router.get('/stats', getMessageStats);
router.get('/search', searchMessages);

// Messages par entreprise
router.get('/entreprise/:entrepriseId', getMessagesByEntreprise);
router.put('/entreprise/:entrepriseId/mark-read', markConversationAsRead);

// Gestion des messages
router.post('/', sendMessage);
router.put('/:messageId/read', markAsRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;


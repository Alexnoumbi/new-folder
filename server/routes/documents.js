const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const documentController = require('../controllers/documentController');

// Protéger toutes les routes
router.use(auth);

// Routes des documents
router.post('/company/:companyId/upload', authorize(['admin', 'user']), documentController.uploadDocument);
router.get('/company/:companyId', documentController.getCompanyDocuments);
router.get('/:id', documentController.getDocument);
router.put('/:id/validate', authorize('admin'), documentController.validateDocument);
router.delete('/:id', authorize(['admin']), documentController.deleteDocument);

// Route pour les types de documents
router.get('/types', documentController.getDocumentTypes);

module.exports = router;

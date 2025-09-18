const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const conventionController = require('../controllers/conventionController');

// Routes de base pour les conventions
router.post('/', auth, conventionController.createConvention);
router.get('/', auth, conventionController.getConventions);
router.get('/:id', auth, conventionController.getConvention);
router.put('/:id', auth, conventionController.updateConvention);
router.patch('/:id/status', auth, conventionController.updateStatus);

// Routes spécifiques aux entreprises
router.get('/enterprise/:enterpriseId', auth, conventionController.getEnterpriseConventions);
router.get('/enterprise/:enterpriseId/active', auth, conventionController.getActiveConventions);

// Routes des documents
router.post('/:id/documents', auth, conventionController.addDocument);

module.exports = router;

const express = require('express');
const router = express.Router();
const conventionController = require('../controllers/conventionController');

// Routes de base pour les conventions (accessibles sans authentification)
router.post('/', conventionController.createConvention);
router.get('/', conventionController.getConventions);
router.get('/:id', conventionController.getConvention);
router.put('/:id', conventionController.updateConvention);
router.patch('/:id/status', conventionController.updateStatus);

// Routes spécifiques aux entreprises
router.get('/enterprise/:enterpriseId', conventionController.getEnterpriseConventions);
router.get('/enterprise/:enterpriseId/active', conventionController.getActiveConventions);

// Routes des documents
router.post('/:id/documents', conventionController.addDocument);

module.exports = router;

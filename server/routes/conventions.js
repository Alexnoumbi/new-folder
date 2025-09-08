const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const conventionController = require('../controllers/conventionController');

// Protect all routes
router.use(auth);

// Convention routes
router.post('/', authorize('admin'), conventionController.createConvention);
router.get('/', authorize(['admin', 'user']), conventionController.getConventions);
router.get('/:id', conventionController.getConvention);
router.put('/:id', authorize('admin'), conventionController.updateConvention);
router.patch('/:id/status', authorize('admin'), conventionController.updateStatus);

// Enterprise-specific routes
router.get('/enterprise/:enterpriseId', conventionController.getEnterpriseConventions);
router.get('/enterprise/:enterpriseId/active', conventionController.getActiveConventions);

// Document routes
router.post('/:id/documents', conventionController.addDocument);

module.exports = router;

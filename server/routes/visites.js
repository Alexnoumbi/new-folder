const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const visitController = require('../controllers/visitController');

// Protéger toutes les routes
router.use(auth);

// Routes de base
router.post('/request', visitController.requestVisit);
router.get('/enterprise/:enterpriseId', visitController.getEnterpriseVisits);

// Routes avec autorisations spécifiques
router.put('/:id/cancel', authorize(['admin', 'inspector']), visitController.cancelVisit);
router.put('/:id/assign-inspector', authorize('admin'), visitController.assignInspector);
router.put('/:id/status', authorize('inspector'), visitController.updateVisitStatus);

// Routes de rapports
router.post('/:id/report', authorize('inspector'), visitController.submitVisitReport);
router.get('/:id/report/download', authorize(['admin', 'inspector']), visitController.downloadReport);

// Routes pour les inspecteurs
router.get('/inspector/my-visits', authorize('inspector'), visitController.getInspectorVisits);

module.exports = router;

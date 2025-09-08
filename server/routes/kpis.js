const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const kpiController = require('../controllers/kpiController');

// Protéger toutes les routes
router.use(auth);

// Routes des KPIs
router.post('/', authorize('admin'), kpiController.createKPI);
router.get('/', kpiController.getKPIs);
router.get('/:id', kpiController.getKPI);
router.put('/:id', authorize('admin'), kpiController.updateKPI);
router.delete('/:id', authorize('admin'), kpiController.deleteKPI);

// Routes spéciales
router.get('/enterprise/:enterpriseId', kpiController.getEnterpriseKPIs);
router.post('/:kpiId/submit', kpiController.submitKPIValue);
router.get('/:kpiId/history', kpiController.getKPIHistory);

module.exports = router;

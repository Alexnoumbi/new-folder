const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    requestVisit,
    getEnterpriseVisits,
    getAllVisits,
    cancelVisit,
    assignInspector,
    updateVisitStatus,
    submitVisitReport,
    downloadReport
} = require('../controllers/visitController');

// Routes visites (accessibles sans authentification)
router.get('/all', getAllVisits);
router.post('/request', requestVisit);
router.get('/enterprise/:enterpriseId', getEnterpriseVisits);

// Routes de gestion (avec authentification)
router.put('/:id/cancel', protect, cancelVisit);
router.put('/:id/assign-inspector', protect, assignInspector);
router.put('/:id/status', protect, updateVisitStatus);

// Routes des rapports (avec authentification)
router.post('/:id/report', protect, submitVisitReport);
router.get('/:id/report/download', protect, downloadReport);

module.exports = router;

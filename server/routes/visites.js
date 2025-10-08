const express = require('express');
const router = express.Router();
const {
    requestVisit,
    getEnterpriseVisits,
    cancelVisit,
    assignInspector,
    updateVisitStatus,
    submitVisitReport,
    downloadReport
} = require('../controllers/visitController');

// Routes visites (accessibles sans authentification)
router.post('/request', requestVisit);
router.get('/enterprise/:enterpriseId', getEnterpriseVisits);

// Routes de gestion
router.put('/:id/cancel', cancelVisit);
router.put('/:id/assign-inspector', assignInspector);
router.put('/:id/status', updateVisitStatus);

// Routes des rapports
router.post('/:id/report', submitVisitReport);
router.get('/:id/report/download', downloadReport);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    requestVisit,
    getEnterpriseVisits,
    cancelVisit,
    assignInspector,
    updateVisitStatus,
    submitVisitReport,
    downloadReport
} = require('../controllers/visitController');

// Routes de base
router.post('/request', auth, requestVisit);
router.get('/enterprise/:enterpriseId', auth, getEnterpriseVisits);

// Routes pour la gestion des visites
router.put('/:id/cancel', auth, cancelVisit);
router.put('/:id/assign-inspector', auth, assignInspector);
router.put('/:id/status', auth, updateVisitStatus);

// Routes de rapports
router.post('/:id/report', auth, submitVisitReport);
router.get('/:id/report/download', auth, downloadReport);

module.exports = router;

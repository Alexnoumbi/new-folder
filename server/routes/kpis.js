const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getKPIs,
    createKPI,
    getKPI,
    updateKPI,
    deleteKPI,
    getEnterpriseKPIs,
    submitKPIValue,
    getKPIHistory
} = require('../controllers/kpiController');

// Routes de base des KPIs
router.get('/', auth, getKPIs);
router.post('/', auth, createKPI);
router.get('/:id', auth, getKPI);
router.put('/:id', auth, updateKPI);
router.delete('/:id', auth, deleteKPI);

// Routes spécifiques à l'entreprise
router.get('/enterprise/:enterpriseId', auth, getEnterpriseKPIs);
router.post('/:kpiId/submit', auth, submitKPIValue);
router.get('/:kpiId/history', auth, getKPIHistory);

module.exports = router;
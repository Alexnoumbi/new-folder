const express = require('express');
const router = express.Router();
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

// Routes KPI (accessibles sans authentification)
router.get('/', getKPIs);
router.post('/', createKPI);
router.get('/:id', getKPI);
router.put('/:id', updateKPI);
router.delete('/:id', deleteKPI);

// Routes par entreprise
router.get('/enterprise/:enterpriseId', getEnterpriseKPIs);
router.post('/:kpiId/submit', submitKPIValue);
router.get('/:kpiId/history', getKPIHistory);

module.exports = router;

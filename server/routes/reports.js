const express = require('express');
const {
    generateReport,
    getReports,
    downloadReport,
    deleteReport
} = require('../controllers/reportController');

const router = express.Router();

// Routes des rapports (accessibles sans authentification)
router.get('/', getReports);
router.post('/generate', generateReport);
router.get('/:id/download', downloadReport);
router.delete('/:id', deleteReport);

// Routes pour les entreprises (accessible sans authentification)
router.get('/entreprise/types', (req, res) => {
    const types = [
        { id: 'performance', name: 'Rapport de Performance' },
        { id: 'audit', name: 'Rapport d\'Audit' },
        { id: 'compliance', name: 'Rapport de Conformité' },
        { id: 'visit', name: 'Rapport de Visite' }
    ];
    res.json(types);
});

module.exports = router;

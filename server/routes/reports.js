const express = require('express');
const {
    generateReport,
    getReports,
    downloadReport,
    deleteReport
} = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

// Routes des rapports
router.get('/', auth, getReports);
router.post('/generate', auth, generateReport);
router.get('/:id/download', auth, downloadReport);
router.delete('/:id', auth, deleteReport);

// Routes pour les entreprises
router.get('/entreprise/types', auth, (req, res) => {
    const types = [
        { id: 'performance', name: 'Rapport de Performance' },
        { id: 'audit', name: 'Rapport d\'Audit' },
        { id: 'compliance', name: 'Rapport de Conformité' },
        { id: 'visit', name: 'Rapport de Visite' }
    ];
    res.json(types);
});

module.exports = router;

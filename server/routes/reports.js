const express = require('express');
const { generateReport, getReportTypes } = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Protéger toutes les routes
router.use(auth);

// Routes des rapports
router.post('/', authorize('admin'), generateReport);
router.get('/types', getReportTypes);

// Routes pour les entreprises
router.get('/entreprise/types', authorize('entreprise'), (req, res) => {
  const types = [
    {
      id: 'kpis',
      name: 'Rapport des KPIs',
      formats: ['pdf', 'excel']
    },
    {
      id: 'documents',
      name: 'Rapport des documents',
      formats: ['pdf', 'excel']
    },
    {
      id: 'visites',
      name: 'Rapport des visites',
      formats: ['pdf', 'excel']
    }
  ];

  res.json({
    success: true,
    data: types
  });
});

router.post('/entreprise/generate', authorize('entreprise'), async (req, res) => {
  try {
    const { type, format, dateDebut, dateFin } = req.body;
    const userId = req.user.id;
    
    // Générer le rapport pour l'entreprise de l'utilisateur
    const report = await generateReport(type, format, dateDebut, dateFin, userId);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport'
    });
  }
});

module.exports = router;

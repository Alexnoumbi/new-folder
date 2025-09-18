const express = require('express');
const router = express.Router();
const {
  getEntreprises,
  getEntreprise,
  getEntrepriseStats,
  getEntrepriseInfo,
  updateEntrepriseProfile,
  getEntrepriseDocuments,
  getEntrepriseControls,
  getEntrepriseAffiliations,
  getEntrepriseKPIHistory,
  getEntrepriseMessages,
  getEntrepriseReports
} = require('../controllers/entrepriseController');

// Liste et détail des entreprises
router.get('/', getEntreprises);
router.get('/:id', getEntreprise);

// Routes pour les statistiques et informations
router.get('/stats', getEntrepriseStats);
router.get('/me', getEntrepriseInfo);
router.put('/profile', updateEntrepriseProfile);

// Routes pour les ressources liées
router.get('/:id/documents', getEntrepriseDocuments);
router.get('/:id/controls', getEntrepriseControls);
router.get('/:id/affiliations', getEntrepriseAffiliations);
router.get('/:id/kpi-history', getEntrepriseKPIHistory);
router.get('/:id/messages', getEntrepriseMessages);
router.get('/:id/reports', getEntrepriseReports);

module.exports = router;

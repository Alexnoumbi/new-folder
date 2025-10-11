const express = require('express');
const router = express.Router();
const {
  getEntreprises,
  getEntreprise,
  createEntreprise,
  updateEntreprise,
  deleteEntreprise,
  getEntrepriseStats,
  getEntrepriseInfo,
  updateEntrepriseProfile,
  getEntrepriseDocuments,
  getEntrepriseControls,
  getEntrepriseAffiliations,
  getEntrepriseKPIHistory,
  getEntrepriseMessages,
  getEntrepriseReports,
  getGlobalStats,
  getEntreprisesAgrees,
  updateEntrepriseStatut,
  getEntreprisesEvolution,
  getEntrepriseComplete,
  updateEntrepriseConformite,
  getEntrepriseEvolutionData,
  getEntrepriseSnapshots,
  getEntrepriseActivityLog
} = require('../controllers/entrepriseController');

// Routes publiques et générales
router.get('/', getEntreprises);

// Routes admin (accessibles sans authentification)
router.get('/admin/stats', getGlobalStats);
router.get('/admin/agrees', getEntreprisesAgrees);
router.get('/admin/evolution', getEntreprisesEvolution);
router.get('/:id/complete', getEntrepriseComplete);
router.post('/', createEntreprise);
router.delete('/:id', deleteEntreprise);
router.patch('/:id/statut', updateEntrepriseStatut);
router.patch('/:id/conformite', updateEntrepriseConformite);

// Routes pour les statistiques et informations
router.get('/stats', getEntrepriseStats);
router.get('/me', getEntrepriseInfo);
router.put('/profile', updateEntrepriseProfile);

// Détail et mise à jour d'une entreprise
router.get('/:id', getEntreprise);
router.put('/:id', updateEntreprise);

// Routes pour les ressources liées
router.get('/:id/documents', getEntrepriseDocuments);
router.get('/:id/controls', getEntrepriseControls);
router.get('/:id/affiliations', getEntrepriseAffiliations);
router.get('/:id/kpi-history', getEntrepriseKPIHistory);
router.get('/:id/messages', getEntrepriseMessages);
router.get('/:id/reports', getEntrepriseReports);

// Routes pour évolution et traçabilité
router.get('/:id/evolution', getEntrepriseEvolutionData);
router.get('/:id/snapshots', getEntrepriseSnapshots);
router.get('/:id/activity-log', getEntrepriseActivityLog);

module.exports = router;

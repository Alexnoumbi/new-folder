const express = require('express');
const router = express.Router();
const {
  getAllIndicators,
  getIndicatorById,
  createIndicator,
  updateIndicator,
  deleteIndicator,
  addIndicatorValue,
  getIndicatorsByFramework,
  getIndicatorsLinkedToKPI,
  linkToKPI,
  unlinkFromKPI,
  getIndicatorStats
} = require('../controllers/indicatorController');

// Routes statistiques
router.get('/stats', getIndicatorStats);

// Routes de base CRUD (accessibles sans authentification pour l'instant)
router.get('/', getAllIndicators);
router.post('/', createIndicator);

// Routes par framework et KPI
router.get('/framework/:frameworkId', getIndicatorsByFramework);
router.get('/kpi/:kpiId/linked', getIndicatorsLinkedToKPI);

// Routes spécifiques (doivent être avant /:id)
router.get('/:id', getIndicatorById);
router.put('/:id', updateIndicator);
router.delete('/:id', deleteIndicator);

// Routes d'ajout de valeurs
router.post('/:id/values', addIndicatorValue);

// Routes de liaison KPI
router.post('/:id/link-kpi', linkToKPI);
router.post('/:id/unlink-kpi', unlinkFromKPI);

module.exports = router;

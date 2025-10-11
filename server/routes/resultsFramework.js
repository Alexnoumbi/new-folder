const express = require('express');
const router = express.Router();
const {
  getAllFrameworks,
  createFramework,
  getFrameworksByProject,
  getFrameworkById,
  updateFramework,
  addOutcome,
  addOutput,
  addActivity,
  updateActivityStatus,
  linkIndicator,
  generateLogframeReport,
  updateTheoryOfChange,
  addRisk,
  getFrameworkStats,
  deleteFramework
} = require('../controllers/resultsFrameworkController');

// Routes de base
router.get('/', getAllFrameworks);
router.post('/', createFramework);
router.get('/project/:projectId', getFrameworksByProject);
router.get('/:id', getFrameworkById);
router.put('/:id', updateFramework);
router.delete('/:id', deleteFramework);

// Routes pour les éléments du cadre
router.post('/:id/outcomes', addOutcome);
router.post('/:id/outputs', addOutput);
router.post('/:id/activities', addActivity);
router.put('/:id/activities/:activityId/status', updateActivityStatus);

// Routes pour les indicateurs
router.post('/link-indicator', linkIndicator);

// Routes pour les rapports et statistiques
router.get('/:id/report', generateLogframeReport);
router.get('/:id/stats', getFrameworkStats);

// Routes pour la théorie du changement
router.put('/:id/theory-of-change', updateTheoryOfChange);

// Routes pour les risques
router.post('/:id/risks', addRisk);

module.exports = router;


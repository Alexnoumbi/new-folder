const express = require('express');
const router = express.Router();
const {
  createPortfolio,
  getPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio,
  addProject,
  removeProject,
  calculateAggregatedIndicators,
  calculatePerformanceScore,
  generateSummaryReport,
  getPortfolioStats,
  getGlobalPortfolioStats,
  addRisk,
  addLessonLearned,
  getProjectsComparison
} = require('../controllers/portfolioController');

// Stats globales (avant les routes avec :id)
router.get('/stats', getGlobalPortfolioStats);

// Routes de base
router.post('/', createPortfolio);
router.get('/', getPortfolios);
router.get('/:id', getPortfolioById);
router.put('/:id', updatePortfolio);
router.delete('/:id', deletePortfolio);

// Gestion des projets
router.post('/:id/projects', addProject);
router.delete('/:id/projects/:projectId', removeProject);
router.get('/:id/projects/comparison', getProjectsComparison);

// Calculs et analyses
router.post('/:id/calculate-indicators', calculateAggregatedIndicators);
router.post('/:id/calculate-performance', calculatePerformanceScore);

// Rapports et statistiques
router.get('/:id/summary-report', generateSummaryReport);
router.get('/:id/stats', getPortfolioStats);

// Risques et leçons apprises
router.post('/:id/risks', addRisk);
router.post('/:id/lessons', addLessonLearned);

module.exports = router;


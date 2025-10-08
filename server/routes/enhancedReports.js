const express = require('express');
const router = express.Router();
const {
  generatePortfolioPDFReport,
  generatePortfolioExcelReport,
  generateFrameworkPDFReport,
  generateFormSubmissionsExcelReport,
  generateConsolidatedReport
} = require('../controllers/enhancedReportController');

// Rapports de portfolio
router.get('/portfolio/:portfolioId/pdf', generatePortfolioPDFReport);
router.get('/portfolio/:portfolioId/excel', generatePortfolioExcelReport);

// Rapports de cadre de résultats
router.get('/framework/:frameworkId/pdf', generateFrameworkPDFReport);

// Rapports de formulaires
router.get('/form/:formId/submissions/excel', generateFormSubmissionsExcelReport);

// Rapport consolidé personnalisé
router.post('/consolidated', generateConsolidatedReport);

module.exports = router;


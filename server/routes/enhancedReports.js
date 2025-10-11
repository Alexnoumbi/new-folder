const express = require('express');
const router = express.Router();
const {
  generatePortfolioPDFReport,
  generatePortfolioExcelReport,
  generateFrameworkPDFReport,
  generateFormSubmissionsExcelReport,
  generateConsolidatedReport
} = require('../controllers/enhancedReportController');

const {
  getScheduledExports,
  createScheduledExport,
  updateScheduledExport,
  deleteScheduledExport,
  runScheduledExport,
  toggleScheduledExport
} = require('../controllers/scheduledExportController');

const {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  generateFromTemplate
} = require('../controllers/reportTemplateController');

// Rapports de portfolio
router.get('/portfolio/:portfolioId/pdf', generatePortfolioPDFReport);
router.get('/portfolio/:portfolioId/excel', generatePortfolioExcelReport);

// Rapports de cadre de résultats
router.get('/framework/:frameworkId/pdf', generateFrameworkPDFReport);

// Rapports de formulaires
router.get('/form/:formId/submissions/excel', generateFormSubmissionsExcelReport);

// Rapport consolidé personnalisé
router.post('/consolidated', generateConsolidatedReport);

// ============ EXPORTS PLANIFIÉS ============
router.get('/scheduled', getScheduledExports);
router.post('/scheduled', createScheduledExport);
router.put('/scheduled/:id', updateScheduledExport);
router.delete('/scheduled/:id', deleteScheduledExport);
router.post('/scheduled/:id/run', runScheduledExport);
router.post('/scheduled/:id/toggle', toggleScheduledExport);

// ============ TEMPLATES DE RAPPORTS ============
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);
router.post('/templates/:id/duplicate', duplicateTemplate);
router.post('/templates/:id/generate', generateFromTemplate);

module.exports = router;


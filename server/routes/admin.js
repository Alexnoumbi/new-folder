const express = require('express');
const {
    getAdminStats,
    getRecentActivity,
    getPortfolioStats,
    getSecurityAlerts,
    getSecurityStatus,
    createSecurityAlert,
    getComplianceStatus,
    getAuditLogs,
    getSystemInfo
} = require('../controllers/adminController');
const { getGlobalPortfolioStats } = require('../controllers/portfolioController');
const adminDashboardController = require('../controllers/adminDashboardController');

const router = express.Router();

// General admin routes
router.get('/stats', getAdminStats);
router.get('/activity', getRecentActivity);
router.get('/system-info', getSystemInfo);

// Evolution des entreprises
router.get('/entreprises/evolution', adminDashboardController.getEntreprisesEvolution);

// Portfolio routes - Stats globales
router.get('/portfolio/stats', getGlobalPortfolioStats);

// Security routes
router.get('/security/alerts', getSecurityAlerts);
router.get('/security/status', getSecurityStatus);
router.post('/security/alerts', createSecurityAlert);

// Audit routes
router.get('/audit/logs', getAuditLogs);
router.get('/audit/compliance', getComplianceStatus);

module.exports = router;

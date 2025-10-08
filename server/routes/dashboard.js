const express = require('express');
const router = express.Router();
const {
    getDashboardData,
    getStats,
    getEnterpriseDashboard,
    getKPISummary,
    getRecentActivity
} = require('../controllers/dashboardController');

// Routes dashboard (accessibles sans authentification)
router.get('/', getDashboardData);
router.get('/stats', getStats);
router.get('/enterprise/:enterpriseId', getEnterpriseDashboard);
router.get('/kpi-summary', getKPISummary);
router.get('/recent-activity', getRecentActivity);

module.exports = router;

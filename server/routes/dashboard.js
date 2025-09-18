const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getDashboardData,
    getStats,
    getEnterpriseDashboard,
    getKPISummary,
    getRecentActivity
} = require('../controllers/dashboardController');

// Routes du tableau de bord
router.get('/', auth, getDashboardData);
router.get('/stats', auth, getStats);
router.get('/enterprise/:enterpriseId', auth, getEnterpriseDashboard);
router.get('/kpi-summary', auth, getKPISummary);
router.get('/recent-activity', auth, getRecentActivity);

module.exports = router;

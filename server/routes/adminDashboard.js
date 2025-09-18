const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');

// Dashboard Overview
router.get('/stats', adminDashboardController.getDashboardStats);

// Evolution des entreprises
router.get('/entreprises/evolution', adminDashboardController.getEntreprisesEvolution);

// Users Management
router.get('/users/stats', adminDashboardController.getUsersStats);
router.get('/users/active', adminDashboardController.getActiveUsers);
router.get('/users/recent', adminDashboardController.getRecentUsers);

// KPIs
router.get('/kpis/summary', adminDashboardController.getKPIsSummary);
router.get('/kpis/trends', adminDashboardController.getKPIsTrends);

// Portfolio Management
router.get('/portfolio/stats', adminDashboardController.getPortfolioStats);
router.get('/portfolio/performance', adminDashboardController.getPortfolioPerformance);

module.exports = router;

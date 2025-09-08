const express = require('express');
const { getAdminStats, getRecentActivity, getPortfolioStats } = require('../controllers/adminController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Routes des statistiques
router.get('/stats', auth, getAdminStats);
router.get('/activity', auth, getRecentActivity);
router.get('/portfolio/stats', auth, getPortfolioStats);

module.exports = router;

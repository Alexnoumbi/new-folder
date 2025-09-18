const Entreprise = require('../models/Entreprise');
const User = require('../models/User');
const KPI = require('../models/KPI');
const AuditLog = require('../models/AuditLog');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalEntreprises: 0,
      utilisateursActifs: 0,
      kpiValides: 0,
      alertes: 0,
      evolutionEntreprises: [],
      repartitionStatus: [],
      dernieresActivites: []
    };

    // Get total entreprises
    stats.totalEntreprises = await Entreprise.countDocuments();

    // Get active users in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    stats.utilisateursActifs = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Get validated KPIs
    stats.kpiValides = await KPI.countDocuments({ status: 'VALIDATED' });

    // Get alerts count
    stats.alertes = await Entreprise.countDocuments({
      $or: [
        { status: 'warning' },
        { status: 'critical' }
      ]
    });

    // Get last activities
    stats.dernieresActivites = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'nom email');

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard statistics'
    });
  }
};

module.exports = {
  getDashboardStats
};

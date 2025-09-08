const Entreprise = require('../models/Entreprise');
const User = require('../models/User');
const KPI = require('../models/KPI');
const AuditLog = require('../models/AuditLog');
const Convention = require('../models/Convention');

// @desc    Obtenir les statistiques du tableau de bord admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    // Compter les entreprises
    const totalEntreprises = await Entreprise.countDocuments();
    
    // Compter les utilisateurs actifs
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const utilisateursActifs = await User.countDocuments({
      derniereConnexion: { $gte: thirtyDaysAgo }
    });
    
    // Compter les KPI validés
    const kpiValides = await KPI.countDocuments({
      statut: 'VALIDATED'
    });
    
    // Compter les alertes
    const alertes = await Entreprise.countDocuments({
      $or: [
        { statut: 'critique' },
        { 'kpis.statut': 'OVERDUE' }
      ]
    });

    // Évolution des entreprises sur les 6 derniers mois
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const evolutionEntreprises = await Entreprise.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEntreprises,
        utilisateursActifs,
        kpiValides,
        alertes,
        evolutionEntreprises
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// @desc    Obtenir l'activité récente
// @route   GET /api/admin/activity
// @access  Private (Admin)
const getRecentActivity = async (req, res) => {
  try {
    const activiteRecente = await AuditLog.find()
      .populate('userId', 'nom prenom')
      .populate('entrepriseId', 'nom')
      .sort({ timestamp: -1 })
      .limit(10)
      .select('action description timestamp userId entrepriseId');

    const formattedActivity = activiteRecente.map(log => ({
      id: log._id,
      type: log.action,
      description: log.description,
      timestamp: log.timestamp,
      user: log.userId ? `${log.userId.prenom} ${log.userId.nom}` : 'Système',
      entreprise: log.entrepriseId ? log.entrepriseId.nom : null
    }));

    res.status(200).json({
      success: true,
      data: formattedActivity
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité récente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'activité récente'
    });
  }
};

// @desc    Obtenir les statistiques du portfolio
// @route   GET /api/admin/portfolio/stats
// @access  Private (Admin)
const getPortfolioStats = async (req, res) => {
  try {
    // Récupérer le nombre total d'entreprises
    const totalEnterprises = await Entreprise.countDocuments();

    // Récupérer le nombre de conventions actives
    const activeConventions = await Convention.countDocuments({ status: 'ACTIVE' });

    // Récupérer les statistiques des KPIs
    const totalKPIs = await KPI.countDocuments();
    const kpisOnTrack = await KPI.countDocuments({
      $expr: { $gte: ["$currentValue", "$targetValue"] }
    });

    // Calculer les performances
    const performance = await KPI.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$currentValue" },
          growth: {
            $avg: {
              $cond: [
                { $and: [
                  { $gt: ["$currentValue", "$previousValue"] },
                  { $gt: ["$previousValue", 0] }
                ]},
                { $multiply: [
                  { $divide: [
                    { $subtract: ["$currentValue", "$previousValue"] },
                    "$previousValue"
                  ]},
                  100
                ]},
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = {
      totalEnterprises,
      activeConventions,
      kpisOnTrack,
      totalKPIs,
      totalValue: performance[0]?.totalValue || 0,
      growth: performance[0]?.growth || 0,
      assets: [],
      performance: []
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques du portfolio'
    });
  }
};

module.exports = {
  getAdminStats,
  getRecentActivity,
  getPortfolioStats
};

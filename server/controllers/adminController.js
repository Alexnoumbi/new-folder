const Entreprise = require('../models/Entreprise');
const User = require('../models/User');
const KPI = require('../models/KPI');
const AuditLog = require('../models/AuditLog');
const Convention = require('../models/Convention');
const SecurityAlert = require('../models/SecurityAlert');

// @desc    Obtenir les statistiques du tableau de bord admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    // Statistiques de base avec valeurs par défaut
    let stats = {
      totalEntreprises: 0,
      utilisateursActifs: 0,
      kpiValides: 0,
      alertes: 0,
      evolutionEntreprises: [],
      repartitionStatus: [],
      dernieresActivites: []
    };

    try {
      stats.totalEntreprises = await Entreprise.countDocuments() || 0;
    } catch (e) {
      console.error('Erreur comptage entreprises:', e);
    }

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      stats.utilisateursActifs = await User.countDocuments({
        derniereConnexion: { $gte: thirtyDaysAgo }
      }) || 0;
    } catch (e) {
      console.error('Erreur comptage utilisateurs actifs:', e);
    }

    try {
      stats.kpiValides = await KPI.countDocuments({
        statut: 'VALIDATED'
      }) || 0;
    } catch (e) {
      console.error('Erreur comptage KPIs:', e);
    }

    try {
      stats.alertes = await Entreprise.countDocuments({
        $or: [
          { statut: 'critique' },
          { 'kpis.statut': 'OVERDUE' }
        ]
      }) || 0;
    } catch (e) {
      console.error('Erreur comptage alertes:', e);
    }

    // Évolution des entreprises sur les 6 derniers mois
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const evolution = await Entreprise.aggregate([
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
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]);

      stats.evolutionEntreprises = evolution;
    } catch (e) {
      console.error('Erreur calcul évolution:', e);
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur globale stats admin:', error);
    // En cas d'erreur, on renvoie quand même une réponse avec des données vides
    res.status(200).json({
      success: true,
      data: {
        totalEntreprises: 0,
        utilisateursActifs: 0,
        kpiValides: 0,
        alertes: 0,
        evolutionEntreprises: [],
        repartitionStatus: [],
        dernieresActivites: []
      }
    });
  }
};

// @desc    Obtenir l'activité récente
// @route   GET /api/admin/activity
// @access  Private (Admin)
const getRecentActivity = async (req, res) => {
  try {
    const recentActivity = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('user', 'nom email');

    res.json({
      success: true,
      data: recentActivity
    });
  } catch (error) {
    console.error('Erreur récupération activité récente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'activité récente'
    });
  }
};

// @desc    Obtenir les logs d'audit
// @route   GET /api/admin/audit
// @access  Private (Admin)
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('user', 'nom email');

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Erreur récupération logs audit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des logs d\'audit'
    });
  }
};

// @desc    Obtenir les statistiques du portfolio
// @route   GET /api/admin/portfolio/stats
// @access  Private (Admin)
const getPortfolioStats = async (req, res) => {
  try {
    const stats = {
      totalConventions: await Convention.countDocuments(),
      conventionsActives: await Convention.countDocuments({ statut: 'active' }),
      totalKPIs: await KPI.countDocuments(),
      kpisEnCours: await KPI.countDocuments({ statut: 'IN_PROGRESS' })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur récupération stats portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques du portfolio'
    });
  }
};

// @desc    Obtenir le statut de conformité
// @route   GET /api/admin/compliance/status
// @access  Private (Admin)
const getComplianceStatus = async (req, res) => {
  try {
    const complianceData = {
      totalKPIs: await KPI.countDocuments(),
      kpisConformes: await KPI.countDocuments({ statut: 'VALIDATED' }),
      kpisNonConformes: await KPI.countDocuments({ statut: 'REJECTED' }),
      kpisEnAttente: await KPI.countDocuments({ statut: 'PENDING' })
    };

    const tauxConformite = (complianceData.kpisConformes / complianceData.totalKPIs) * 100 || 0;

    res.json({
      success: true,
      data: {
        ...complianceData,
        tauxConformite: Math.round(tauxConformite * 100) / 100
      }
    });
  } catch (error) {
    console.error('Erreur récupération statut conformité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut de conformité'
    });
  }
};

// @desc    Obtenir les alertes de sécurité
// @route   GET /api/admin/security/alerts
// @access  Private (Admin)
const getSecurityAlerts = async (req, res) => {
    try {
        const alerts = await SecurityAlert.find()
            .sort({ timestamp: -1, severity: 1 })
            .limit(50)
            .populate('userId', 'nom prenom email');

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des alertes de sécurité:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des alertes de sécurité'
        });
    }
};

// @desc    Obtenir le statut de sécurité
// @route   GET /api/admin/security/status
// @access  Private (Admin)
const getSecurityStatus = async (req, res) => {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Récupération des statistiques en parallèle
        const [
            totalAlerts,
            highSeverityAlerts,
            mediumSeverityAlerts,
            failedLogins,
            suspiciousActivities
        ] = await Promise.all([
            SecurityAlert.countDocuments(),
            SecurityAlert.countDocuments({ severity: 'high', resolved: false }),
            SecurityAlert.countDocuments({ severity: 'medium', resolved: false }),
            AuditLog.countDocuments({
                type: 'FAILED_LOGIN',
                timestamp: { $gte: oneDayAgo }
            }),
            SecurityAlert.countDocuments({
                type: 'SUSPICIOUS_ACTIVITY',
                timestamp: { $gte: oneDayAgo }
            })
        ]);

        // Calcul du score de sécurité
        let securityScore = 100;

        // Déductions basées sur les alertes
        if (highSeverityAlerts > 0) securityScore -= 30;
        if (mediumSeverityAlerts > 0) securityScore -= 15;

        // Déductions basées sur les tentatives de connexion échouées
        securityScore -= Math.min(failedLogins * 2, 20);

        // Déductions basées sur les activités suspectes
        securityScore -= Math.min(suspiciousActivities * 5, 25);

        // Assurer que le score reste entre 0 et 100
        securityScore = Math.max(0, Math.min(100, securityScore));

        // Déterminer le niveau de menace
        const threatLevel = securityScore >= 80 ? 'low' :
                          securityScore >= 60 ? 'medium' : 'high';

        // Préparer la réponse
        const securityStatus = {
            securityScore,
            threatLevel,
            metrics: {
                alerts: {
                    total: totalAlerts,
                    high: highSeverityAlerts,
                    medium: mediumSeverityAlerts,
                    low: totalAlerts - (highSeverityAlerts + mediumSeverityAlerts)
                },
                failedLogins24h: failedLogins,
                suspiciousActivities24h: suspiciousActivities
            },
            lastUpdate: now
        };

        res.json({
            success: true,
            data: securityStatus
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du statut de sécurité:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du statut de sécurité'
        });
    }
};

// @desc    Créer une alerte de sécurité
// @route   POST /api/admin/security/alerts
// @access  Private (Admin)
const createSecurityAlert = async (req, res) => {
    try {
        const { type, severity, description, userId, ipAddress, location, details } = req.body;

        const alert = await SecurityAlert.create({
            type,
            severity,
            description,
            userId,
            ipAddress,
            location,
            details
        });

        // Créer un log d'audit
        await AuditLog.create({
            action: 'SECURITY_ALERT_CREATED',
            description: `Nouvelle alerte de sécurité : ${type} (${severity})`,
            userId: req.user?._id,
            details: {
                alertId: alert._id,
                alertType: type,
                severity
            }
        });

        res.status(201).json({
            success: true,
            data: alert
        });
    } catch (error) {
        console.error('Erreur lors de la création de l\'alerte de sécurité:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de l\'alerte de sécurité'
        });
    }
};

// @desc    Obtenir des informations système
// @route   GET /api/system
// @access  Private (Admin)
const getSystemInfo = async (req, res) => {
  try {
    const os = require('os');
    const system = {
      cpu: Math.round(os.loadavg()[0] * 100), // CPU load average (1 min)
      memory: {
        total: Math.round(os.totalmem() / (1024 * 1024)), // Total memory in MB
        free: Math.round(os.freemem() / (1024 * 1024)),  // Free memory in MB
        used: Math.round((os.totalmem() - os.freemem()) / (1024 * 1024)) // Used memory in MB
      },
      disk: {
        total: 1000, // Placeholder - implement actual disk stats
        used: 400,
        free: 600
      },
      osInfo: {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        architecture: os.arch()
      }
    };

    const startTime = Date.now() - (os.uptime() * 1000);

    // Mock request statistics for demonstration
    const requests = {
      total: 1000,
      perMinute: 60,
      avgResponseTime: 250
    };

    res.json({
      success: true,
      system,
      startTime,
      requests,
      process: {
        uptime: os.uptime(),
        memory: process.memoryUsage()
      }
    });
  } catch (error) {
    console.error('Error getting system info:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving system information',
      error: error.message
    });
  }
};

// Export all functions
module.exports = {
  getAdminStats,
  getRecentActivity,
  getAuditLogs,
  getPortfolioStats,
  getSecurityAlerts,
  getSecurityStatus,
  createSecurityAlert,
  getComplianceStatus,
  getSystemInfo
};

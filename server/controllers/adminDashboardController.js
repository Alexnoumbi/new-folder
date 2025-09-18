const User = require('../models/User');
const Document = require('../models/Document');
const Visit = require('../models/Visit');
const Entreprise = require('../models/Entreprise');
const SecurityAlert = require('../models/SecurityAlert');
const AuditLog = require('../models/AuditLog');
const KPI = require('../models/KPI');
const Report = require('../models/Report');
const systemMonitor = require('../utils/systemMonitor');

// Dashboard Overview
exports.getDashboardStats = async (req, res) => {
    try {
        const [users, documents, visits, alerts] = await Promise.all([
            User.countDocuments(),
            Document.countDocuments(),
            Visit.countDocuments(),
            SecurityAlert.countDocuments({ severity: 'critical' })
        ]);

        res.json({
            success: true,
            data: {
                totalUsers: users,
                totalDocuments: documents,
                totalVisits: visits,
                criticalAlerts: alerts
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
};

// Evolution des entreprises (par mois, depuis une date de départ)
exports.getEntreprisesEvolution = async (req, res) => {
    try {
        const { start } = req.query; // format attendu: YYYY-MM

        const now = new Date();
        const defaultStart = new Date(now.getFullYear(), 4, 1, 0, 0, 0, 0); // 4 = mai (0-index)

        let since;
        if (typeof start === 'string' && /^\d{4}-\d{2}$/.test(start)) {
            const [y, m] = start.split('-').map(Number);
            since = new Date(y, m - 1, 1, 0, 0, 0, 0);
        } else {
            since = defaultStart;
        }

        // Préparer date de fin au début du mois courant suivant pour inclure le mois courant
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

        const pipeline = [
            // Utiliser createdAt si dispo, sinon dateCreation
            { $addFields: { dateRef: { $ifNull: ['$createdAt', '$dateCreation'] } } },
            { $match: { dateRef: { $gte: since, $lt: end } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$dateRef' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ];

        const raw = await Entreprise.aggregate(pipeline);

        // Construire la série complète mois par mois de since -> now (inclus)
        const series = [];
        const cursor = new Date(since.getFullYear(), since.getMonth(), 1);
        while (cursor < end) {
            const key = cursor.toISOString().slice(0, 7);
            const found = raw.find(r => r._id === key);
            series.push({ month: key, count: found ? found.count : 0 });
            cursor.setMonth(cursor.getMonth() + 1);
        }

        res.json({ success: true, data: series });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'évolution des entreprises:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'évolution des entreprises' });
    }
};

// Users Management
exports.getActiveUsers = async (req, res) => {
    try {
        const users = await User.find({ status: 'active' })
            .select('-password')
            .limit(10)
            .sort({ lastLoginDate: -1 });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs actifs'
        });
    }
};

exports.getRecentUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .limit(10)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs récents'
        });
    }
};

// KPIs
exports.getKPIsSummary = async (req, res) => {
    try {
        const kpis = await KPI.find()
            .sort({ updatedAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: kpis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du résumé des KPIs'
        });
    }
};

exports.getKPIsTrends = async (req, res) => {
    try {
        const trends = await KPI.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    average: { $avg: "$value" }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 12 }
        ]);

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des tendances KPI'
        });
    }
};

// Portfolio Management
exports.getPortfolioStats = async (req, res) => {
    try {
        const [total, active] = await Promise.all([
            Entreprise.countDocuments(),
            Entreprise.countDocuments({ status: 'active' })
        ]);

        res.json({
            success: true,
            data: {
                total,
                active,
                inactive: total - active
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques du portfolio'
        });
    }
};

exports.getPortfolioPerformance = async (req, res) => {
    try {
        const performance = await Entreprise.aggregate([
            {
                $group: {
                    _id: "$sector",
                    count: { $sum: 1 },
                    avgScore: { $avg: "$performanceScore" }
                }
            }
        ]);

        res.json({
            success: true,
            data: performance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des performances du portfolio'
        });
    }
};

// Compliance & Security
exports.getComplianceStatus = async (req, res) => {
    try {
        const [criticalAlerts, warningAlerts, lastAudit] = await Promise.all([
            SecurityAlert.countDocuments({ severity: 'critical' }),
            SecurityAlert.countDocuments({ severity: 'warning' }),
            AuditLog.findOne().sort({ createdAt: -1 })
        ]);

        const complianceScore = Math.max(0, 100 - (criticalAlerts * 10) - (warningAlerts * 5));

        res.json({
            success: true,
            data: {
                score: complianceScore,
                criticalAlerts,
                warningAlerts,
                lastAuditDate: lastAudit?.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du statut de conformité'
        });
    }
};

exports.getSecurityAlerts = async (req, res) => {
    try {
        const alerts = await SecurityAlert.find()
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des alertes de sécurité'
        });
    }
};

exports.getAuditTrail = async (req, res) => {
    try {
        const audits = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: audits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'audit trail'
        });
    }
};

// System Monitoring
exports.getSystemStats = async (req, res) => {
    try {
        const stats = await systemMonitor.getSystemStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques système'
        });
    }
};

exports.getStorageStatus = async (req, res) => {
    try {
        const status = await systemMonitor.getStorageStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du statut de stockage'
        });
    }
};

exports.getUsageStats = async (req, res) => {
    try {
        const usage = await systemMonitor.getUsageStats();
        res.json({
            success: true,
            data: usage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques d\'utilisation'
        });
    }
};

// Reports
exports.getReportsList = async (req, res) => {
    try {
        const reports = await Report.find()
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la liste des rapports'
        });
    }
};

exports.generateReport = async (req, res) => {
    try {
        const { type, parameters } = req.body;
        // Logic for report generation would go here
        const report = new Report({
            type,
            parameters,
            status: 'pending'
        });
        await report.save();

        // Start async report generation process
        // This would typically be handled by a queue system

        res.json({
            success: true,
            message: 'Génération du rapport initiée',
            data: { reportId: report._id }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la génération du rapport'
        });
    }
};

// Settings
exports.getSettings = async (req, res) => {
    try {
        // This would typically come from a settings collection or configuration
        const settings = {
            notifications: true,
            autoReports: true,
            maintenanceMode: false
        };

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des paramètres'
        });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        // Update settings logic would go here

        res.json({
            success: true,
            message: 'Paramètres mis à jour avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour des paramètres'
        });
    }
};

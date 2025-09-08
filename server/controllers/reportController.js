const reportService = require('../utils/reports/reportService');
const Entreprise = require('../models/Entreprise');
const User = require('../models/User');
const KPI = require('../models/KPI');
const Document = require('../models/Document');
const Visit = require('../models/Visit');

// @desc    Générer un rapport
// @route   POST /api/reports/generate
// @access  Private (Admin)
exports.generateReport = async (req, res) => {
    try {
        const { type, format, dateDebut, dateFin } = req.body;
        const report = await reportService.generateReport(type, format, dateDebut, dateFin);
        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Erreur génération rapport:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la génération du rapport'
        });
    }
};

// @desc    Obtenir les types de rapports
// @route   GET /api/reports/types
// @access  Private (Admin)
exports.getReportTypes = async (req, res) => {
    try {
        const types = [
            {
                id: 'entreprises',
                name: 'Rapport des entreprises',
                formats: ['pdf', 'excel'],
                description: 'Rapport complet des entreprises inscrites'
            },
            {
                id: 'utilisateurs',
                name: 'Rapport des utilisateurs',
                formats: ['pdf', 'excel'],
                description: 'Rapport des utilisateurs actifs'
            },
            {
                id: 'kpis',
                name: 'Rapport des KPIs',
                formats: ['pdf', 'excel'],
                description: 'Rapport des indicateurs de performance'
            },
            {
                id: 'visites',
                name: 'Rapport des visites',
                formats: ['pdf', 'excel'],
                description: 'Rapport des visites d\'inspection'
            }
        ];

        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        console.error('Erreur types rapports:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des types de rapports'
        });
    }
};

// @desc    Générer un rapport pour une entreprise
// @route   POST /api/reports/entreprise/generate
// @access  Private (Entreprise)
exports.generateEntrepriseReport = async (req, res) => {
    try {
        const { type, format, dateDebut, dateFin } = req.body;
        const userId = req.user.id;
        
        // Récupérer l'entreprise de l'utilisateur
        const user = await User.findById(userId).populate('entrepriseId');
        if (!user.entrepriseId) {
            return res.status(404).json({
                success: false,
                message: 'Aucune entreprise associée à cet utilisateur'
            });
        }

        const entrepriseId = user.entrepriseId._id;
        let data = {};

        // Générer les données selon le type de rapport
        switch (type) {
            case 'kpis':
                data = await generateKPIsReport(entrepriseId, dateDebut, dateFin);
                break;
            case 'documents':
                data = await generateDocumentsReport(entrepriseId, dateDebut, dateFin);
                break;
            case 'visites':
                data = await generateVisitesReport(entrepriseId, dateDebut, dateFin);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Type de rapport non supporté'
                });
        }

        // Générer le fichier selon le format
        const report = await reportService.generateFile(data, format, type, user.entrepriseId.nom);

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Erreur génération rapport entreprise:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la génération du rapport'
        });
    }
};

// Fonctions helper pour générer les données des rapports
async function generateKPIsReport(entrepriseId, dateDebut, dateFin) {
    const filter = { entrepriseId };
    if (dateDebut && dateFin) {
        filter.createdAt = {
            $gte: new Date(dateDebut),
            $lte: new Date(dateFin)
        };
    }

    const kpis = await KPI.find(filter)
        .populate('indicatorId', 'nom description unite')
        .sort({ createdAt: -1 });

    return {
        title: 'Rapport des KPIs',
        data: kpis,
        summary: {
            total: kpis.length,
            validated: kpis.filter(k => k.statut === 'VALIDATED').length,
            pending: kpis.filter(k => k.statut === 'PENDING').length,
            rejected: kpis.filter(k => k.statut === 'REJECTED').length
        }
    };
}

async function generateDocumentsReport(entrepriseId, dateDebut, dateFin) {
    const filter = { entrepriseId };
    if (dateDebut && dateFin) {
        filter.uploadedAt = {
            $gte: new Date(dateDebut),
            $lte: new Date(dateFin)
        };
    }

    const documents = await Document.find(filter)
        .sort({ uploadedAt: -1 });

    return {
        title: 'Rapport des Documents',
        data: documents,
        summary: {
            total: documents.length,
            received: documents.filter(d => d.status === 'RECEIVED').length,
            waiting: documents.filter(d => d.status === 'WAITING').length,
            expired: documents.filter(d => d.status === 'EXPIRED').length
        }
    };
}

async function generateVisitesReport(entrepriseId, dateDebut, dateFin) {
    const filter = { entrepriseId };
    if (dateDebut && dateFin) {
        filter.scheduledAt = {
            $gte: new Date(dateDebut),
            $lte: new Date(dateFin)
        };
    }

    const visites = await Visit.find(filter)
        .populate('inspectorId', 'nom prenom')
        .sort({ scheduledAt: -1 });

    return {
        title: 'Rapport des Visites',
        data: visites,
        summary: {
            total: visites.length,
            planned: visites.filter(v => v.status === 'PLANNED').length,
            completed: visites.filter(v => v.status === 'COMPLETED').length,
            cancelled: visites.filter(v => v.status === 'CANCELLED').length
        }
    };
}

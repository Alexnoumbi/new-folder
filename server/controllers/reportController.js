const Report = require('../models/Report');
const { generatePDF } = require('../utils/reports/pdfGenerator');
const { generateExcel } = require('../utils/reports/excelGenerator');
const fs = require('fs').promises;
const path = require('path');

// Récupérer tous les rapports
exports.getReports = async (req, res) => {
    try {
        console.log('[REPORT] Fetching all reports...');
        const reports = await Report.find()
            .sort({ createdAt: -1 })
            .populate('author', 'nom prenom email');
        console.log(`[REPORT] Found ${reports.length} reports`);
        res.json(reports);
    } catch (error) {
        console.error('[REPORT] Error fetching reports:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des rapports' });
    }
};

// Générer un nouveau rapport
exports.generateReport = async (req, res) => {
    try {
        console.log('[REPORT] Generating new report...');
        const { type, startDate, endDate, format, includeCharts, title } = req.body;

        // Créer le rapport dans la base de données
        const report = new Report({
            title: title || `Rapport ${type} - ${new Date().toLocaleDateString()}`,
            type,
            format,
            author: req.user?._id || null,
            startDate,
            endDate,
            status: 'in-progress'
        });

        await report.save();
        console.log('[REPORT] Report created:', report._id);

        // Démarrer la génération en arrière-plan
        generateReportInBackground(report._id, format, includeCharts)
            .catch(error => console.error('[REPORT] Error generating report:', error));

        res.status(201).json(report);
    } catch (error) {
        console.error('[REPORT] Error creating report:', error);
        res.status(500).json({ message: 'Erreur lors de la création du rapport' });
    }
};

// Télécharger un rapport
exports.downloadReport = async (req, res) => {
    try {
        console.log('Downloading report with id:', req.params.id);

        const report = await Report.findById(req.params.id);
        if (!report) {
            console.error('Report not found:', req.params.id);
            return res.status(404).json({ message: 'Rapport non trouvé' });
        }

        // Vérifier le statut du rapport
        if (report.status !== 'completed') {
            console.error('Report not ready:', report.status);
            return res.status(400).json({ message: 'Le rapport n\'est pas encore prêt' });
        }

        // Vérifier que le fichier existe
        const filePath = path.join(__dirname, '..', 'uploads', 'reports', report.filePath);
        try {
            await fs.access(filePath);
        } catch (error) {
            console.error('File not found:', filePath);
            return res.status(404).json({ message: 'Fichier non trouvé' });
        }

        // Envoyer le fichier
        res.download(filePath, `${report.title}.${report.format}`, (err) => {
            if (err) {
                console.error('Download error:', err);
                // Ne pas envoyer d'erreur si la réponse a déjà été envoyée
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
                }
            }
        });
    } catch (error) {
        console.error('Error in downloadReport:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Erreur lors du téléchargement du rapport' });
        }
    }
};

// Supprimer un rapport
exports.deleteReport = async (req, res) => {
    try {
        console.log('[REPORT] Deleting report:', req.params.id);
        
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Rapport non trouvé' });
        }

        // Supprimer le fichier physique si existant
        if (report.filePath) {
            try {
                await fs.unlink(path.join(__dirname, '..', 'uploads', 'reports', report.filePath));
                console.log('[REPORT] File deleted:', report.filePath);
            } catch (error) {
                console.error('[REPORT] Error deleting report file:', error);
            }
        }

        await report.deleteOne();
        console.log('[REPORT] ✅ Report deleted successfully');
        res.json({ message: 'Rapport supprimé avec succès' });
    } catch (error) {
        console.error('[REPORT] Error deleting report:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du rapport' });
    }
};

// Fonction utilitaire pour générer le rapport en arrière-plan
async function generateReportInBackground(reportId, format, includeCharts) {
    try {
        const Entreprise = require('../models/Entreprise');
        const Indicator = require('../models/Indicator');
        const KPI = require('../models/KPI');
        const Visit = require('../models/Visit');
        
        const report = await Report.findById(reportId);
        if (!report) {
            console.error('[REPORT] Report not found:', reportId);
            return;
        }

        console.log('[REPORT] Fetching data from database...');

        // Mettre à jour le statut et le progrès
        report.status = 'in-progress';
        report.progress = 10;
        await report.save();

        // Récupérer les données de la base de données
        const [entreprises, indicators, kpis, visits] = await Promise.all([
            Entreprise.find({
                createdAt: { $gte: report.startDate, $lte: report.endDate }
            }).limit(50).lean(),
            Indicator.find({
                createdAt: { $gte: report.startDate, $lte: report.endDate }
            }).limit(50).lean(),
            KPI.find({
                createdAt: { $gte: report.startDate, $lte: report.endDate }
            }).limit(50).lean(),
            Visit.find({
                scheduledAt: { $gte: report.startDate, $lte: report.endDate }
            }).limit(20).lean()
        ]);

        console.log(`[REPORT] Data fetched: ${entreprises.length} entreprises, ${indicators.length} indicators, ${kpis.length} KPIs, ${visits.length} visits`);

        // Ajouter les données au rapport
        report.data = {
            entreprises,
            indicators,
            kpis,
            visits
        };

        report.progress = 30;
        await report.save();

        // Créer le nom du fichier
        const fileName = `report-${reportId}-${Date.now()}.${format}`;
        const filePath = path.join(__dirname, '..', 'uploads', 'reports', fileName);

        console.log('[REPORT] Generating file:', fileName);

        // Générer le contenu selon le format
        try {
            if (format === 'pdf') {
                await generatePDF(report, filePath, includeCharts);
            } else if (format === 'excel') {
                await generateExcel(report, filePath, includeCharts);
            }

            // Mettre à jour le rapport avec le chemin du fichier et le statut
            report.filePath = fileName;
            report.status = 'completed';
            report.progress = 100;
            await report.save();

            console.log('[REPORT] ✅ Report generated successfully');

        } catch (genError) {
            console.error('[REPORT] Error generating file:', genError);
            report.status = 'failed';
            report.error = genError.message;
            await report.save();
        }

    } catch (error) {
        console.error('[REPORT] Error in background generation:', error);
        // Tenter de mettre à jour le statut en cas d'erreur
        try {
            const report = await Report.findById(reportId);
            if (report) {
                report.status = 'failed';
                report.error = error.message;
                await report.save();
            }
        } catch (updateError) {
            console.error('[REPORT] Error updating report status:', updateError);
        }
    }
}

// Fonction exportée pour générer un rapport avec un template
exports.generateReportWithTemplate = async function(reportId, template, includeCharts) {
    return generateReportInBackground(reportId, template.format.toLowerCase(), includeCharts);
};

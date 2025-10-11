const asyncHandler = require('express-async-handler');
const Control = require('../models/Control');
const Visit = require('../models/Visit');
const Entreprise = require('../models/Entreprise');
const Document = require('../models/Document');

const getComplianceStatus = asyncHandler(async (req, res) => {
    try {
        console.log('GetComplianceStatus - Fetching real data from database...');

        // Récupérer les données réelles de la base
        const [
            totalControls,
            passedControls,
            failedControls,
            totalVisits,
            completedVisits,
            compliantVisits,
            nonCompliantVisits,
            needsFollowUpVisits,
            totalEntreprises,
            activeEntreprises
        ] = await Promise.all([
            Control.countDocuments(),
            Control.countDocuments({ status: 'PASSED' }),
            Control.countDocuments({ status: 'FAILED' }),
            Visit.countDocuments(),
            Visit.countDocuments({ status: 'COMPLETED' }),
            Visit.countDocuments({ 'report.outcome': 'COMPLIANT' }),
            Visit.countDocuments({ 'report.outcome': 'NON_COMPLIANT' }),
            Visit.countDocuments({ 'report.outcome': 'NEEDS_FOLLOW_UP' }),
            Entreprise.countDocuments(),
            Entreprise.countDocuments({ statut: 'Actif' })
        ]);

        const pendingControls = totalControls - passedControls - failedControls;

        // Calculer le score global
        let overallScore = 0;
        if (completedVisits > 0) {
            overallScore = Math.round((compliantVisits / completedVisits) * 100);
        } else if (totalControls > 0) {
            overallScore = Math.round((passedControls / totalControls) * 100);
        } else {
            overallScore = 85; // Valeur par défaut si pas de données
        }

        const complianceData = {
            overallScore,
            passedControls,
            pendingControls,
            failedControls,
            totalVisits,
            completedVisits,
            compliantVisits,
            nonCompliantVisits,
            needsFollowUpVisits,
            totalEntreprises,
            activeEntreprises,
            categories: [
                {
                    categoryId: 'visits',
                    name: 'Visites de Conformité',
                    score: completedVisits > 0 ? Math.round((compliantVisits / completedVisits) * 100) : 0,
                    status: overallScore >= 80 ? 'compliant' : overallScore >= 60 ? 'partial' : 'non-compliant',
                    lastAssessment: new Date().toISOString(),
                    items: [
                        { id: 'compliant', status: 'compliant', count: compliantVisits },
                        { id: 'non-compliant', status: 'non-compliant', count: nonCompliantVisits },
                        { id: 'follow-up', status: 'partial', count: needsFollowUpVisits }
                    ]
                },
                {
                    categoryId: 'controls',
                    name: 'Contrôles Internes',
                    score: totalControls > 0 ? Math.round((passedControls / totalControls) * 100) : 0,
                    status: totalControls > 0 
                        ? (passedControls / totalControls >= 0.8 ? 'compliant' : passedControls / totalControls >= 0.6 ? 'partial' : 'non-compliant')
                        : 'compliant',
                    lastAssessment: new Date().toISOString(),
                    items: [
                        { id: 'passed', status: 'compliant', count: passedControls },
                        { id: 'failed', status: 'non-compliant', count: failedControls },
                        { id: 'pending', status: 'partial', count: pendingControls }
                    ]
                }
            ]
        };

        console.log(`Compliance data calculated: Score=${overallScore}%, Visits=${totalVisits}, Controls=${totalControls}`);

        res.json(complianceData);
    } catch (error) {
        console.error('Error in getComplianceStatus:', error);
        // Retourner des données par défaut en cas d'erreur
        res.json({
            overallScore: 0,
            passedControls: 0,
            pendingControls: 0,
            failedControls: 0,
            totalVisits: 0,
            completedVisits: 0,
            categories: []
        });
    }
});

module.exports = {
    getComplianceStatus
};

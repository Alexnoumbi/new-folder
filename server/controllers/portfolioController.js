const Entreprise = require('../models/Entreprise');
const Convention = require('../models/Convention');
const KPI = require('../models/KPI');

const getPortfolioStats = async (req, res) => {
    try {
        // Get total number of enterprises
        const totalEnterprises = await Entreprise.countDocuments();

        // Get number of active conventions
        const activeConventions = await Convention.countDocuments({ status: 'active' });

        // Get KPIs statistics
        const totalKPIs = await KPI.countDocuments();
        const kpisOnTrack = await KPI.countDocuments({ status: 'on_track' });

        res.status(200).json({
            success: true,
            data: {
                totalEnterprises,
                activeConventions,
                totalKPIs,
                kpisOnTrack
            }
        });
    } catch (error) {
        console.error('Error getting portfolio stats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques du portfolio'
        });
    }
};

module.exports = {
    getPortfolioStats
};

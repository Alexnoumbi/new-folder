const KPI = require('../models/KPI');

// @desc    Obtenir tous les KPIs
// @route   GET /api/kpis
exports.getKPIs = async (req, res) => {
    try {
        const kpis = await KPI.find();
        res.json({
            success: true,
            data: kpis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des KPIs'
        });
    }
};

// @desc    Créer un nouveau KPI
// @route   POST /api/kpis
exports.createKPI = async (req, res) => {
    try {
        const kpi = await KPI.create(req.body);
        res.status(201).json({
            success: true,
            data: kpi
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du KPI'
        });
    }
};

// @desc    Obtenir un KPI spécifique
// @route   GET /api/kpis/:id
exports.getKPI = async (req, res) => {
    try {
        const kpi = await KPI.findById(req.params.id);
        if (!kpi) {
            return res.status(404).json({
                success: false,
                message: 'KPI non trouvé'
            });
        }
        res.json({
            success: true,
            data: kpi
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du KPI'
        });
    }
};

// @desc    Mettre à jour un KPI
// @route   PUT /api/kpis/:id
exports.updateKPI = async (req, res) => {
    try {
        const kpi = await KPI.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!kpi) {
            return res.status(404).json({
                success: false,
                message: 'KPI non trouvé'
            });
        }
        res.json({
            success: true,
            data: kpi
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du KPI'
        });
    }
};

// @desc    Supprimer un KPI
// @route   DELETE /api/kpis/:id
exports.deleteKPI = async (req, res) => {
    try {
        const kpi = await KPI.findByIdAndDelete(req.params.id);
        if (!kpi) {
            return res.status(404).json({
                success: false,
                message: 'KPI non trouvé'
            });
        }
        res.json({
            success: true,
            message: 'KPI supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du KPI'
        });
    }
};

// @desc    Obtenir les KPIs d'une entreprise
// @route   GET /api/kpis/enterprise/:enterpriseId
exports.getEnterpriseKPIs = async (req, res) => {
    try {
        const kpis = await KPI.find({ entreprise: req.params.enterpriseId });
        res.json({
            success: true,
            data: kpis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des KPIs'
        });
    }
};

// @desc    Soumettre une valeur de KPI
// @route   POST /api/kpis/:kpiId/submit
exports.submitKPIValue = async (req, res) => {
    try {
        const kpi = await KPI.findById(req.params.kpiId);
        if (!kpi) {
            return res.status(404).json({
                success: false,
                message: 'KPI non trouvé'
            });
        }

        kpi.historique.push({
            valeur: req.body.valeur,
            date: new Date(),
            utilisateur: req.user._id
        });

        await kpi.save();

        res.json({
            success: true,
            data: kpi
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la soumission de la valeur'
        });
    }
};

// @desc    Obtenir l'historique d'un KPI
// @route   GET /api/kpis/:kpiId/history
exports.getKPIHistory = async (req, res) => {
    try {
        const kpi = await KPI.findById(req.params.kpiId)
            .populate('historique.utilisateur', 'nom email');

        if (!kpi) {
            return res.status(404).json({
                success: false,
                message: 'KPI non trouvé'
            });
        }

        res.json({
            success: true,
            data: kpi.historique
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'historique'
        });
    }
};

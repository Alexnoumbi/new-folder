const KPI = require('../models/KPI');

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
      data: {}
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
    const kpis = await KPI.find({ enterpriseId: req.params.enterpriseId })
      .populate('history.submittedBy', 'nom prenom');
    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des KPIs de l\'entreprise'
    });
  }
};

// @desc    Soumettre une valeur pour un KPI
// @route   POST /api/kpis/:kpiId/submit
exports.submitKPIValue = async (req, res) => {
  try {
    const { value, comment } = req.body;
    const kpi = await KPI.findById(req.params.kpiId);

    if (!kpi) {
      return res.status(404).json({
        success: false,
        message: 'KPI non trouvé'
      });
    }

    kpi.history.push({
      value,
      comment,
      submittedBy: req.user.id,
      date: new Date(),
      status: 'pending'
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
      .populate('history.submittedBy', 'nom prenom');

    if (!kpi) {
      return res.status(404).json({
        success: false,
        message: 'KPI non trouvé'
      });
    }

    res.json({
      success: true,
      data: kpi.history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

// @desc    Valider une soumission de KPI
// @route   POST /api/kpis/:kpiId/validate/:submissionId
exports.validateKPISubmission = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const kpi = await KPI.findById(req.params.kpiId);

    if (!kpi) {
      return res.status(404).json({ message: 'KPI non trouvé' });
    }

    const submission = kpi.history.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Soumission non trouvée' });
    }

    submission.status = status;
    if (comment) {
      submission.comment = comment;
    }

    await kpi.save();
    res.json(kpi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtenir un aperçu des KPIs d'une entreprise
// @route   GET /api/kpis/overview/enterprise/:enterpriseId
exports.getKPIOverview = async (req, res) => {
  try {
    const kpis = await KPI.find({
      enterpriseId: req.params.enterpriseId,
      'history.status': 'validated'
    }).sort({ 'history.date': -1 });

    const overview = kpis.map(kpi => {
      const latestValue = kpi.history
        .filter(h => h.status === 'validated')
        .sort((a, b) => b.date - a.date)[0];

      return {
        name: kpi.name,
        currentValue: latestValue?.value || 0,
        targetValue: kpi.targetValue,
        unit: kpi.unit,
        status: latestValue?.value >= kpi.targetValue ? 'atteint' : 'en attente'
      };
    });

    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

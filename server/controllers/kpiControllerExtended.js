﻿const KPI = require('../models/KPI');

// Routes publiques pour les KPIs
exports.getAllKPIs = async (req, res) => {
  try {
    const kpis = await KPI.find().populate('enterpriseId', 'nomEntreprise');
    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des KPIs',
      error: error.message
    });
  }
};

exports.getKPI = async (req, res) => {
  try {
    const kpi = await KPI.findById(req.params.id).populate('enterpriseId', 'nomEntreprise');
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
      message: 'Erreur lors de la récupération du KPI',
      error: error.message
    });
  }
};

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
      message: 'Erreur lors de la création du KPI',
      error: error.message
    });
  }
};

exports.updateKPI = async (req, res) => {
  try {
    const kpi = await KPI.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
      message: 'Erreur lors de la mise à jour du KPI',
      error: error.message
    });
  }
};

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
      message: 'Erreur lors de la suppression du KPI',
      error: error.message
    });
  }
};

// Routes existantes (gardées pour compatibilité)
exports.getKPIsByEnterprise = async (req, res) => {
  try {
    const kpis = await KPI.find({ enterpriseId: req.params.enterpriseId })
      .populate('history.submittedBy', 'name');
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitKPIValue = async (req, res) => {
  try {
    const { value, comment } = req.body;
    const kpi = await KPI.findById(req.params.kpiId);

    if (!kpi) {
      return res.status(404).json({ message: 'KPI not found' });
    }

    kpi.history.push({
      value,
      comment,
      submittedBy: req.user?.id || 'anonymous',
      date: new Date(),
      status: 'pending'
    });

    await kpi.save();
    res.json(kpi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateKPISubmission = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const kpi = await KPI.findById(req.params.kpiId);

    if (!kpi) {
      return res.status(404).json({ message: 'KPI not found' });
    }

    const submission = kpi.history.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
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

exports.getKPIHistory = async (req, res) => {
  try {
    const { period } = req.query;
    const kpi = await KPI.findById(req.params.kpiId)
      .populate('history.submittedBy', 'name');

    if (!kpi) {
      return res.status(404).json({ message: 'KPI not found' });
    }

    let history = kpi.history;

    if (period) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(period));
      history = history.filter(entry => entry.date >= startDate);
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
        status: latestValue?.value >= kpi.targetValue ? 'achieved' : 'pending'
      };
    });

    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

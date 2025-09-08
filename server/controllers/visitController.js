const Visit = require('../models/Visit');
const { uploadToS3 } = require('../utils/s3');

// @desc    Obtenir les visites d'une entreprise
// @route   GET /api/visites/enterprise/:enterpriseId
exports.getEnterpriseVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ enterpriseId: req.params.enterpriseId })
      .populate('inspectorId', 'nom prenom')
      .sort({ scheduledAt: -1 });
    res.json({
      success: true,
      data: visits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des visites'
    });
  }
};

// @desc    Demander une visite
// @route   POST /api/visites/request
exports.requestVisit = async (req, res) => {
  try {
    const { scheduledAt, type, comment } = req.body;

    const visit = await Visit.create({
      enterpriseId: req.params.enterpriseId,
      requestedBy: req.user.id,
      scheduledAt,
      type,
      comment,
      status: 'SCHEDULED'
    });

    res.status(201).json({
      success: true,
      data: visit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la visite'
    });
  }
};

// @desc    Annuler une visite
// @route   PUT /api/visites/:id/cancel
exports.cancelVisit = async (req, res) => {
  try {
    const { reason } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visite non trouvée'
      });
    }

    if (visit.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'annuler une visite terminée'
      });
    }

    visit.status = 'CANCELLED';
    visit.cancellationReason = reason;
    visit.cancelledBy = req.user.id;
    visit.cancelledAt = new Date();

    await visit.save();

    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation de la visite'
    });
  }
};

// @desc    Assigner un inspecteur à une visite
// @route   PUT /api/visites/:id/assign-inspector
exports.assignInspector = async (req, res) => {
  try {
    const { inspectorId } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visite non trouvée'
      });
    }

    visit.inspectorId = inspectorId;
    visit.assignedAt = new Date();
    visit.status = 'ASSIGNED';

    await visit.save();

    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'assignation de l\'inspecteur'
    });
  }
};

// @desc    Mettre à jour le statut d'une visite
// @route   PUT /api/visites/:id/status
exports.updateVisitStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visite non trouvée'
      });
    }

    visit.status = status;
    visit.statusComment = comment;
    visit.lastUpdatedBy = req.user.id;
    visit.lastUpdatedAt = new Date();

    await visit.save();

    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
};

// @desc    Soumettre un rapport de visite
// @route   POST /api/visites/:id/report
exports.submitVisitReport = async (req, res) => {
  try {
    const { observations, recommendations } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visite non trouvée'
      });
    }

    const files = req.files;
    const uploadedFiles = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await uploadToS3(file);
        uploadedFiles.push({
          name: file.originalname,
          url: uploadResult.Location,
          type: file.mimetype
        });
      }
    }

    visit.report = {
      observations,
      recommendations,
      files: uploadedFiles,
      submittedBy: req.user.id,
      submittedAt: new Date()
    };

    visit.status = 'COMPLETED';
    await visit.save();

    res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la soumission du rapport'
    });
  }
};

// @desc    Télécharger un rapport de visite
// @route   GET /api/visites/:id/report/download
exports.downloadReport = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('inspectorId', 'nom prenom')
      .populate('enterpriseId', 'nom');

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visite non trouvée'
      });
    }

    if (!visit.report) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non disponible'
      });
    }

    // TODO: Générer le PDF du rapport
    res.json({
      success: true,
      data: {
        downloadUrl: visit.report.files[0]?.url || null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du rapport'
    });
  }
};

// @desc    Obtenir les visites assignées à un inspecteur
// @route   GET /api/visites/inspector/my-visits
exports.getInspectorVisits = async (req, res) => {
  try {
    const visits = await Visit.find({
      inspectorId: req.user.id,
      status: { $nin: ['CANCELLED'] }
    })
    .populate('enterpriseId', 'nom')
    .sort({ scheduledAt: 1 });

    res.json({
      success: true,
      data: visits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des visites'
    });
  }
};

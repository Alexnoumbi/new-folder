const Visit = require('../models/Visit');
const Entreprise = require('../models/Entreprise');
const path = require('path');
const fs = require('fs');
const { generatePDF } = require('../utils/reports/pdfGenerator');
const { uploadToS3 } = require('../utils/s3');

// @desc    Obtenir les visites d'une entreprise
// @route   GET /api/visites/enterprise/:enterpriseId
exports.getEnterpriseVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ enterpriseId: req.params.enterpriseId })
      .populate('inspectorId', 'nom prenom')
      .populate('enterpriseId')
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
    const { enterpriseId, scheduledAt, type, comment } = req.body;

    if (!enterpriseId || !scheduledAt || !type) {
      return res.status(400).json({ success: false, message: 'enterpriseId, scheduledAt et type sont requis' });
    }

    const visit = await Visit.create({
      enterpriseId,
      requestedBy: req.user.id,
      scheduledAt: new Date(scheduledAt),
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
    const { content, outcome, reporterName, enterpriseData } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visite non trouvée'
      });
    }

    if (visit.report && visit.report.submittedAt) {
      return res.status(400).json({ success: false, message: 'Le rapport existe déjà et ne peut pas être modifié' });
    }

    // Snapshot des données de l'entreprise au moment du rapport
    let enterpriseSnapshot = enterpriseData || null;
    if (!enterpriseSnapshot && visit.enterpriseId) {
      const ent = await Entreprise.findById(visit.enterpriseId).lean();
      if (ent) enterpriseSnapshot = ent;
    }

    visit.report = {
      content: content || '',
      outcome: outcome || 'COMPLIANT',
      reporterName: reporterName || (req.user?.nom || req.user?.email || 'Inspecteur'),
      enterpriseSnapshot,
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
      .populate('inspectorId', 'nom prenom email')
      .populate('enterpriseId');

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

    // Génération et streaming du PDF
    const tmpDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const filename = `rapport_visite_${visit._id}.pdf`;
    const filePath = path.join(tmpDir, filename);

    // Construire un objet "report" attendu par generatePDF
    const reportData = {
      type: 'visit',
      createdAt: new Date().toISOString(),
      startDate: visit.scheduledAt || new Date(),
      endDate: visit.submittedAt || new Date(),
      visit,
    };

    await generatePDF(reportData, filePath, false);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('close', () => {
      // Optionnel: supprimer le fichier temporaire
      fs.unlink(filePath, () => {});
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

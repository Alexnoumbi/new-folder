const Visit = require('../models/Visit');
const Entreprise = require('../models/Entreprise');
const path = require('path');
const fs = require('fs');
const { generatePDF } = require('../utils/reports/pdfGenerator');
const { uploadToS3 } = require('../utils/s3');

// @desc    Obtenir TOUTES les visites (pour stats globales)
// @route   GET /api/visites/all
exports.getAllVisits = async (req, res) => {
  try {
    console.log('GetAllVisits - Fetching all visits...');
    
    const visits = await Visit.find()
      .populate('inspectorId', 'nom prenom')
      .populate('enterpriseId', 'identification.nomEntreprise nom name statut')
      .populate('requestedBy', 'nom prenom email')
      .sort({ scheduledAt: -1 })
      .lean(); // Utiliser lean() pour meilleures performances
    
    console.log(`Found ${visits.length} total visits`);
    
    res.json({
      success: true,
      count: visits.length,
      data: visits
    });
  } catch (error) {
    console.error('Error getting all visits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des visites',
      error: error.message
    });
  }
};

// @desc    Obtenir les visites d'une entreprise
// @route   GET /api/visites/enterprise/:enterpriseId
exports.getEnterpriseVisits = async (req, res) => {
  try {
    console.log('🔍 [VISIT] GetEnterpriseVisits called for:', req.params.enterpriseId);
    
    const visits = await Visit.find({ enterpriseId: req.params.enterpriseId })
      .populate('inspectorId', 'nom prenom')
      .populate('enterpriseId')
      .populate('requestedBy', 'nom prenom email')
      .sort({ scheduledAt: -1 });
    
    console.log(`✅ [VISIT] Found ${visits.length} visits for enterprise ${req.params.enterpriseId}`);
    if (visits.length > 0) {
      console.log('📝 [VISIT] Sample visit:', {
        id: visits[0]._id,
        status: visits[0].status,
        type: visits[0].type,
        scheduledAt: visits[0].scheduledAt,
        enterpriseId: visits[0].enterpriseId
      });
    } else {
      console.log('⚠️ [VISIT] No visits found for this enterprise');
    }
    
    res.json({
      success: true,
      data: visits
    });
  } catch (error) {
    console.error('❌ [VISIT] Error getting enterprise visits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des visites',
      error: error.message
    });
  }
};

// @desc    Demander une visite
// @route   POST /api/visites/request
exports.requestVisit = async (req, res) => {
  try {
    const { enterpriseId, scheduledAt, type, comment } = req.body;

    console.log('🆕 [VISIT] RequestVisit called');
    console.log('📝 [VISIT] Data:', { enterpriseId, scheduledAt, type, comment });

    if (!enterpriseId || !scheduledAt || !type) {
      console.log('❌ [VISIT] Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'enterpriseId, scheduledAt et type sont requis' 
      });
    }

    const visit = await Visit.create({
      enterpriseId,
      requestedBy: req.user?.id || req.user?._id || null,
      scheduledAt: new Date(scheduledAt),
      type,
      comment,
      status: 'SCHEDULED'
    });

    console.log('✅ [VISIT] Visit created successfully!');
    console.log('📋 [VISIT] Details:', {
      _id: visit._id,
      enterpriseId: visit.enterpriseId,
      status: visit.status,
      type: visit.type,
      scheduledAt: visit.scheduledAt
    });

    res.status(201).json({
      success: true,
      data: visit,
      message: 'Visite planifiée avec succès'
    });
  } catch (error) {
    console.error('❌ [VISIT] Error creating visit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la visite',
      error: error.message
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
    
    console.log('SubmitVisitReport for visit:', req.params.id);
    console.log('Payload:', { content: content?.length, outcome, reporterName });
    
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visite non trouvée'
      });
    }

    if (visit.report && visit.report.submittedAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le rapport existe déjà et ne peut pas être modifié' 
      });
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
      enterpriseSnapshot: enterpriseSnapshot,
      submittedBy: req.user?.id || req.user?._id || null,
      submittedAt: new Date()
    };

    // Ne pas changer automatiquement le statut à COMPLETED
    // La visite reste SCHEDULED jusqu'à ce qu'elle soit marquée manuellement comme terminée
    // Cela permet au rapport d'être soumis tout en gardant la visite dans "à venir"
    visit.lastUpdatedBy = req.user?.id || req.user?._id || null;
    visit.lastUpdatedAt = new Date();
    
    await visit.save();

    console.log('Report submitted successfully');

    res.json({
      success: true,
      data: visit,
      message: 'Rapport soumis avec succès'
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la soumission du rapport',
      error: error.message
    });
  }
};

// @desc    Télécharger un rapport de visite
// @route   GET /api/visites/:id/report/download
exports.downloadReport = async (req, res) => {
  try {
    console.log('DownloadReport for visit:', req.params.id);
    
    const visit = await Visit.findById(req.params.id)
      .populate('inspectorId', 'nom prenom email')
      .populate('enterpriseId')
      .populate('requestedBy', 'nom prenom email');

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visite non trouvée'
      });
    }

    if (!visit.report || !visit.report.content) {
      return res.status(404).json({
        success: false,
        message: 'Rapport non disponible pour cette visite'
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
      endDate: visit.report.submittedAt || new Date(),
      visit,
    };

    await generatePDF(reportData, filePath, false);

    console.log('PDF generated successfully');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('close', () => {
      // Supprimer le fichier temporaire après envoi
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting temp PDF:', err);
      });
    });
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du rapport',
      error: error.message
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

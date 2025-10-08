const { FormBuilder, FormSubmission } = require('../models/FormBuilder');
const Indicator = require('../models/Indicator');

// ============ GESTION DES FORMULAIRES ============

// Créer un nouveau formulaire
exports.createForm = async (req, res) => {
  try {
    const form = new FormBuilder({
      ...req.body,
      createdBy: req.user?._id || req.body.createdBy || '000000000000000000000000'
    });
    
    await form.save();
    
    res.status(201).json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir tous les formulaires
exports.getForms = async (req, res) => {
  try {
    const { status, formType, projectId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (formType) filter.formType = formType;
    if (projectId) filter.project = projectId;
    
    const forms = await FormBuilder.find(filter)
      .populate('createdBy', 'nom prenom email')
      .populate('updatedBy', 'nom prenom email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: forms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir un formulaire par ID
exports.getFormById = async (req, res) => {
  try {
    const form = await FormBuilder.findById(req.params.id)
      .populate('createdBy', 'nom prenom email')
      .populate('updatedBy', 'nom prenom email')
      .populate('project')
      .populate('resultsFramework');
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Formulaire non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mettre à jour un formulaire
exports.updateForm = async (req, res) => {
  try {
    const form = await FormBuilder.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Formulaire non trouvé'
      });
    }
    
    // Si le formulaire est publié, créer une nouvelle version
    if (form.status === 'ACTIVE' && req.body.createNewVersion) {
      const newForm = await form.duplicate();
      Object.assign(newForm, req.body);
      newForm.version = form.version + 1;
      newForm.updatedBy = req.user?._id || req.body.updatedBy;
      await newForm.save();
      
      return res.json({
        success: true,
        data: newForm
      });
    }
    
    // Sinon, mettre à jour le formulaire existant
    Object.assign(form, req.body);
    form.updatedBy = req.user?._id || req.body.updatedBy;
    await form.save();
    
    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Publier un formulaire
exports.publishForm = async (req, res) => {
  try {
    const form = await FormBuilder.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Formulaire non trouvé'
      });
    }
    
    await form.publish();
    
    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Fermer un formulaire
exports.closeForm = async (req, res) => {
  try {
    const form = await FormBuilder.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Formulaire non trouvé'
      });
    }
    
    await form.close();
    
    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Dupliquer un formulaire
exports.duplicateForm = async (req, res) => {
  try {
    const form = await FormBuilder.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Formulaire non trouvé'
      });
    }
    
    const duplicate = await form.duplicate();
    duplicate.createdBy = req.user?._id || '000000000000000000000000';
    await duplicate.save();
    
    res.status(201).json({
      success: true,
      data: duplicate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Supprimer un formulaire
exports.deleteForm = async (req, res) => {
  try {
    const form = await FormBuilder.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Formulaire non trouvé'
      });
    }
    
    // Vérifier s'il y a des soumissions
    const submissionsCount = await FormSubmission.countDocuments({ form: form._id });
    
    if (submissionsCount > 0 && !req.query.force) {
      return res.status(400).json({
        success: false,
        message: `Ce formulaire a ${submissionsCount} soumission(s). Utilisez force=true pour supprimer quand même.`
      });
    }
    
    await FormBuilder.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Formulaire supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============ GESTION DES SOUMISSIONS ============

// Soumettre un formulaire
exports.submitForm = async (req, res) => {
  try {
    const form = await FormBuilder.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Formulaire non trouvé'
      });
    }
    
    if (form.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Ce formulaire n\'est pas actif'
      });
    }
    
    const submissionData = {
      form: form._id,
      data: req.body.data,
      submittedBy: req.user?._id,
      submitterEmail: req.body.email || req.user?.email,
      submitterName: req.body.name || req.user?.nom,
      isDraft: req.body.isDraft || false,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      submissionDuration: req.body.duration
    };

    // Ajouter location seulement si elle est fournie et valide
    if (req.body.location && req.body.location.coordinates && Array.isArray(req.body.location.coordinates)) {
      submissionData.location = req.body.location;
    }

    const submission = new FormSubmission(submissionData);
    
    // Si le formulaire nécessite une approbation
    if (form.settings.requireApproval && !submission.isDraft) {
      submission.status = 'PENDING_APPROVAL';
    } else if (!submission.isDraft) {
      submission.status = 'SUBMITTED';
    }
    
    await submission.save();
    
    // Mettre à jour les statistiques du formulaire
    if (!submission.isDraft) {
      form.stats.totalSubmissions += 1;
      if (submission.status === 'PENDING_APPROVAL') {
        form.stats.pendingSubmissions += 1;
      }
      form.stats.lastSubmissionDate = new Date();
      await form.save();
    }
    
    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir les soumissions d'un formulaire (ou toutes si pas d'ID)
exports.getSubmissions = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const filter = {};
    
    // Si on a un ID de formulaire dans les params, filtrer par formulaire
    if (req.params.id) {
      filter.form = req.params.id;
    }
    
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.submittedAt = {};
      if (startDate) filter.submittedAt.$gte = new Date(startDate);
      if (endDate) filter.submittedAt.$lte = new Date(endDate);
    }
    
    const submissions = await FormSubmission.find(filter)
      .populate('submittedBy', 'nom prenom email')
      .populate('approvedBy', 'nom prenom email')
      .populate('form', 'name')
      .sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir une soumission spécifique
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.submissionId)
      .populate('form')
      .populate('submittedBy', 'nom prenom email')
      .populate('approvedBy', 'nom prenom email')
      .populate('approvalHistory.approver', 'nom prenom email');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Approuver une soumission
exports.approveSubmission = async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.submissionId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée'
      });
    }
    
    await submission.approve(req.user?._id || '000000000000000000000000', req.body.comment);
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Rejeter une soumission
exports.rejectSubmission = async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.submissionId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée'
      });
    }
    
    if (!req.body.reason) {
      return res.status(400).json({
        success: false,
        message: 'Une raison de rejet est requise'
      });
    }
    
    await submission.reject(req.user?._id || '000000000000000000000000', req.body.reason);
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Exporter les soumissions
exports.exportSubmissions = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const submissions = await FormSubmission.find({ form: req.params.id })
      .populate('submittedBy', 'nom prenom email')
      .lean();
    
    if (format === 'csv') {
      // TODO: Implémenter l'export CSV
      return res.json({
        success: false,
        message: 'Export CSV à implémenter'
      });
    }
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir les statistiques d'un formulaire
exports.getFormStats = async (req, res) => {
  try {
    const form = await FormBuilder.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Formulaire non trouvé'
      });
    }
    
    const stats = {
      ...form.stats.toObject(),
      responseRate: form.settings.maxSubmissions 
        ? (form.stats.totalSubmissions / form.settings.maxSubmissions * 100).toFixed(2)
        : null,
      averageCompletionTime: await calculateAverageCompletionTime(form._id)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Fonction helper pour calculer le temps moyen de completion
async function calculateAverageCompletionTime(formId) {
  const submissions = await FormSubmission.find({ 
    form: formId,
    submissionDuration: { $exists: true }
  }).select('submissionDuration');
  
  if (submissions.length === 0) return 0;
  
  const total = submissions.reduce((sum, sub) => sum + sub.submissionDuration, 0);
  return Math.round(total / submissions.length);
}

// Obtenir toutes les soumissions (sans filtre par formulaire)
exports.getAllSubmissions = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.submittedAt = {};
      if (startDate) filter.submittedAt.$gte = new Date(startDate);
      if (endDate) filter.submittedAt.$lte = new Date(endDate);
    }
    
    const submissions = await FormSubmission.find(filter)
      .populate('submittedBy', 'nom prenom email')
      .populate('approvedBy', 'nom prenom email')
      .populate('form', 'name')
      .sort({ submittedAt: -1 });
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mettre à jour une soumission (pour les brouillons)
exports.updateSubmission = async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.submissionId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée'
      });
    }
    
    if (!submission.isDraft) {
      return res.status(400).json({
        success: false,
        message: 'Seuls les brouillons peuvent être modifiés'
      });
    }
    
    submission.data = req.body.data;
    submission.draftSavedAt = new Date();
    await submission.save();
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


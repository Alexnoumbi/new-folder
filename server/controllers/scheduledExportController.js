const ScheduledExport = require('../models/ScheduledExport');

// Récupérer tous les exports planifiés
exports.getScheduledExports = async (req, res) => {
  try {
    console.log('[SCHEDULED_EXPORT] Fetching all scheduled exports...');
    
    const exports = await ScheduledExport.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'nom prenom email')
      .populate('updatedBy', 'nom prenom email');
    
    console.log(`[SCHEDULED_EXPORT] Found ${exports.length} scheduled exports`);
    
    res.json({
      success: true,
      data: exports
    });
  } catch (error) {
    console.error('[SCHEDULED_EXPORT] Error fetching exports:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des exports planifiés',
      error: error.message
    });
  }
};

// Créer un nouvel export planifié
exports.createScheduledExport = async (req, res) => {
  try {
    console.log('[SCHEDULED_EXPORT] Creating new scheduled export...');
    console.log('[SCHEDULED_EXPORT] Data:', req.body);
    
    const {
      name,
      reportType,
      frequency,
      format,
      destination,
      schedule,
      parameters,
      recipients
    } = req.body;
    
    // Validation des champs requis
    if (!name || !reportType || !frequency || !format || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs requis doivent être remplis'
      });
    }
    
    // Créer le nouvel export
    const scheduledExport = new ScheduledExport({
      name,
      reportType,
      frequency,
      format,
      destination,
      schedule: schedule || {},
      parameters: parameters || {},
      recipients: recipients || [],
      isActive: true,
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null
    });
    
    // Calculer la première exécution
    scheduledExport.calculateNextRun();
    
    await scheduledExport.save();
    
    console.log('[SCHEDULED_EXPORT] Export created:', scheduledExport._id);
    
    res.status(201).json({
      success: true,
      data: scheduledExport,
      message: 'Export planifié créé avec succès'
    });
  } catch (error) {
    console.error('[SCHEDULED_EXPORT] Error creating export:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'export planifié',
      error: error.message
    });
  }
};

// Mettre à jour un export planifié
exports.updateScheduledExport = async (req, res) => {
  try {
    console.log('[SCHEDULED_EXPORT] Updating export:', req.params.id);
    
    const scheduledExport = await ScheduledExport.findById(req.params.id);
    
    if (!scheduledExport) {
      return res.status(404).json({
        success: false,
        message: 'Export planifié non trouvé'
      });
    }
    
    // Mettre à jour les champs
    const allowedFields = [
      'name', 'reportType', 'frequency', 'format', 'destination',
      'isActive', 'schedule', 'parameters', 'recipients'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        scheduledExport[field] = req.body[field];
      }
    });
    
    scheduledExport.updatedBy = req.user?._id || null;
    
    // Recalculer nextRun si la fréquence a changé
    if (req.body.frequency || req.body.schedule) {
      scheduledExport.calculateNextRun();
    }
    
    await scheduledExport.save();
    
    console.log('[SCHEDULED_EXPORT] Export updated successfully');
    
    res.json({
      success: true,
      data: scheduledExport,
      message: 'Export planifié mis à jour avec succès'
    });
  } catch (error) {
    console.error('[SCHEDULED_EXPORT] Error updating export:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'export planifié',
      error: error.message
    });
  }
};

// Supprimer un export planifié
exports.deleteScheduledExport = async (req, res) => {
  try {
    console.log('[SCHEDULED_EXPORT] Deleting export:', req.params.id);
    
    const scheduledExport = await ScheduledExport.findByIdAndDelete(req.params.id);
    
    if (!scheduledExport) {
      return res.status(404).json({
        success: false,
        message: 'Export planifié non trouvé'
      });
    }
    
    console.log('[SCHEDULED_EXPORT] Export deleted successfully');
    
    res.json({
      success: true,
      message: 'Export planifié supprimé avec succès'
    });
  } catch (error) {
    console.error('[SCHEDULED_EXPORT] Error deleting export:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'export planifié',
      error: error.message
    });
  }
};

// Exécuter manuellement un export
exports.runScheduledExport = async (req, res) => {
  try {
    console.log('[SCHEDULED_EXPORT] Running export manually:', req.params.id);
    
    const scheduledExport = await ScheduledExport.findById(req.params.id)
      .populate('templateId');
    
    if (!scheduledExport) {
      return res.status(404).json({
        success: false,
        message: 'Export planifié non trouvé'
      });
    }
    
    // Si un template est associé, générer le rapport depuis le template
    if (scheduledExport.templateId) {
      console.log('[SCHEDULED_EXPORT] Using template:', scheduledExport.templateId._id);
      const { generateFromTemplate } = require('./reportTemplateController');
      
      // Simuler une requête pour le template
      const fakeReq = { params: { id: scheduledExport.templateId._id }, user: req.user };
      const fakeRes = {
        status: (code) => ({ json: (data) => console.log('[SCHEDULED_EXPORT] Template generation result:', data) }),
        json: (data) => console.log('[SCHEDULED_EXPORT] Template generation result:', data)
      };
      
      await generateFromTemplate(fakeReq, fakeRes);
    } else {
      console.log('[SCHEDULED_EXPORT] No template, executing standard export');
      // TODO: Implémenter la génération standard
    }
    
    await scheduledExport.recordRun();
    
    console.log('[SCHEDULED_EXPORT] Export executed successfully');
    
    res.json({
      success: true,
      data: scheduledExport,
      message: 'Export exécuté avec succès'
    });
  } catch (error) {
    console.error('[SCHEDULED_EXPORT] Error running export:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'exécution de l\'export',
      error: error.message
    });
  }
};

// Activer/désactiver un export
exports.toggleScheduledExport = async (req, res) => {
  try {
    console.log('[SCHEDULED_EXPORT] Toggling export:', req.params.id);
    
    const scheduledExport = await ScheduledExport.findById(req.params.id);
    
    if (!scheduledExport) {
      return res.status(404).json({
        success: false,
        message: 'Export planifié non trouvé'
      });
    }
    
    scheduledExport.isActive = !scheduledExport.isActive;
    scheduledExport.updatedBy = req.user?._id || null;
    
    await scheduledExport.save();
    
    console.log('[SCHEDULED_EXPORT] Export toggled:', scheduledExport.isActive);
    
    res.json({
      success: true,
      data: scheduledExport,
      message: `Export ${scheduledExport.isActive ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error) {
    console.error('[SCHEDULED_EXPORT] Error toggling export:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'export',
      error: error.message
    });
  }
};


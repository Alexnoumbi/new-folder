const ReportTemplate = require('../models/ReportTemplate');
const Report = require('../models/Report');

// Récupérer tous les templates
exports.getTemplates = async (req, res) => {
  try {
    console.log('[TEMPLATE] Fetching all templates...');
    
    const { type, format } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (format) query.format = format;
    
    const templates = await ReportTemplate.find(query)
      .sort({ isDefault: -1, usageCount: -1, createdAt: -1 })
      .populate('createdBy', 'nom prenom email')
      .populate('updatedBy', 'nom prenom email');
    
    console.log(`[TEMPLATE] Found ${templates.length} templates`);
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('[TEMPLATE] Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des templates',
      error: error.message
    });
  }
};

// Créer un nouveau template
exports.createTemplate = async (req, res) => {
  try {
    console.log('[TEMPLATE] Creating new template...');
    console.log('[TEMPLATE] Data:', req.body);
    
    const {
      name,
      description,
      type,
      format,
      sections,
      filters,
      layout,
      isDefault
    } = req.body;
    
    // Validation
    if (!name || !description || !type || !format) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, description, type et format sont requis'
      });
    }
    
    const template = new ReportTemplate({
      name,
      description,
      type,
      format,
      sections: sections || [],
      filters: filters || {},
      layout: layout || {},
      isDefault: isDefault || false,
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null
    });
    
    await template.save();
    console.log('[TEMPLATE] Template created:', template._id);
    
    res.status(201).json({
      success: true,
      data: template,
      message: 'Template créé avec succès'
    });
  } catch (error) {
    console.error('[TEMPLATE] Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du template',
      error: error.message
    });
  }
};

// Mettre à jour un template
exports.updateTemplate = async (req, res) => {
  try {
    console.log('[TEMPLATE] Updating template:', req.params.id);
    
    const template = await ReportTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }
    
    const allowedFields = [
      'name', 'description', 'type', 'format', 'sections',
      'filters', 'layout', 'isDefault'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        template[field] = req.body[field];
      }
    });
    
    template.updatedBy = req.user?._id || null;
    
    await template.save();
    console.log('[TEMPLATE] Template updated successfully');
    
    res.json({
      success: true,
      data: template,
      message: 'Template mis à jour avec succès'
    });
  } catch (error) {
    console.error('[TEMPLATE] Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du template',
      error: error.message
    });
  }
};

// Supprimer un template
exports.deleteTemplate = async (req, res) => {
  try {
    console.log('[TEMPLATE] Deleting template:', req.params.id);
    
    const template = await ReportTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }
    
    // Empêcher la suppression des templates par défaut
    if (template.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un template par défaut'
      });
    }
    
    await template.deleteOne();
    console.log('[TEMPLATE] Template deleted successfully');
    
    res.json({
      success: true,
      message: 'Template supprimé avec succès'
    });
  } catch (error) {
    console.error('[TEMPLATE] Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du template',
      error: error.message
    });
  }
};

// Dupliquer un template
exports.duplicateTemplate = async (req, res) => {
  try {
    console.log('[TEMPLATE] Duplicating template:', req.params.id);
    
    const template = await ReportTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }
    
    const duplicated = await template.duplicate();
    console.log('[TEMPLATE] Template duplicated:', duplicated._id);
    
    res.status(201).json({
      success: true,
      data: duplicated,
      message: 'Template dupliqué avec succès'
    });
  } catch (error) {
    console.error('[TEMPLATE] Error duplicating template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la duplication du template',
      error: error.message
    });
  }
};

// Générer un rapport depuis un template (1 clic)
exports.generateFromTemplate = async (req, res) => {
  try {
    console.log('[TEMPLATE] Generating report from template:', req.params.id);
    
    const template = await ReportTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }
    
    // Incrémenter le compteur d'utilisation
    await template.incrementUsage();
    
    // Déterminer les dates selon les filtres
    let startDate, endDate;
    const now = new Date();
    
    if (template.filters?.dateRange) {
      switch (template.filters.dateRange) {
        case 'LAST_MONTH':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'LAST_QUARTER':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
          endDate = new Date(now.getFullYear(), quarter * 3, 0);
          break;
        case 'LAST_YEAR':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear() - 1, 11, 31);
          break;
        default:
          startDate = new Date(2020, 0, 1);
          endDate = now;
      }
    } else {
      startDate = new Date(2020, 0, 1);
      endDate = now;
    }
    
    // Créer le rapport
    const report = new Report({
      title: template.name,
      type: template.type.toLowerCase(),
      format: template.format.toLowerCase(),
      author: req.user?._id || null,
      startDate,
      endDate,
      status: 'in-progress',
      usedTemplate: template._id
    });
    
    await report.save();
    console.log('[TEMPLATE] Report created from template:', report._id);
    
    // Démarrer la génération en arrière-plan
    const { generateReportWithTemplate } = require('./reportController');
    generateReportWithTemplate(report._id, template, true)
      .catch(error => console.error('[TEMPLATE] Error generating report:', error));
    
    res.status(201).json({
      success: true,
      data: report,
      message: 'Rapport en cours de génération depuis le template'
    });
  } catch (error) {
    console.error('[TEMPLATE] Error generating from template:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du rapport',
      error: error.message
    });
  }
};


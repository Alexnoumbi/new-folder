const Indicator = require('../models/Indicator');
const KPI = require('../models/KPI');
const Entreprise = require('../models/Entreprise');

// Obtenir tous les indicateurs
exports.getAllIndicators = async (req, res) => {
  try {
    console.log('Fetching all indicators...');
    const { entrepriseId, frameworkId, type, status } = req.query;
    
    const filter = { isActive: true };
    if (entrepriseId) filter.entreprise = entrepriseId;
    if (frameworkId) filter.framework = frameworkId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    console.log('Filter:', filter);

    // Récupérer les indicateurs avec populate sélectif et gestion d'erreur
    let indicators;
    try {
      // Essayer d'abord sans populate pour vérifier que la requête de base fonctionne
      indicators = await Indicator.find(filter).sort({ createdAt: -1 }).lean();
      console.log(`Found ${indicators.length} indicators (without populate)`);
      
      // Ensuite populate avec gestion d'erreur pour chaque populate
      const query = Indicator.find(filter).sort({ createdAt: -1 });
      
      try {
        query.populate('entreprise', 'identification.nomEntreprise nom name statut');
      } catch (err) {
        console.warn('Entreprise populate failed:', err.message);
      }
      
      try {
        query.populate('framework', 'name description type');
      } catch (err) {
        console.warn('Framework populate failed:', err.message);
      }
      
      try {
        query.populate('linkedKPIs', 'name nom code description');
      } catch (err) {
        console.warn('LinkedKPIs populate failed:', err.message);
      }
      
      indicators = await query.lean();
      console.log('All populates completed successfully');
      
    } catch (populateError) {
      console.error('❌ Populate error:', populateError.message);
      console.error('Stack:', populateError.stack);
      // Si le populate échoue, retourner sans populate
      indicators = await Indicator.find(filter).sort({ createdAt: -1 }).lean();
    }

    console.log(`Returning ${indicators.length} indicators`);

    res.json({
      success: true,
      data: indicators
    });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des indicateurs',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtenir un indicateur par ID
exports.getIndicatorById = async (req, res) => {
  try {
    const indicator = await Indicator.findById(req.params.id)
      .populate('entreprise', 'identification.nomEntreprise nom name')
      .populate('framework', 'name description type')
      .populate('linkedKPIs', 'nom code valeurCible valeurActuelle unite')
      .populate('createdBy', 'nom prenom email')
      .populate('history.recordedBy', 'nom prenom');

    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: 'Indicateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: indicator
    });
  } catch (error) {
    console.error('Error fetching indicator:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'indicateur',
      error: error.message
    });
  }
};

// Créer un indicateur
exports.createIndicator = async (req, res) => {
  try {
    console.log('Creating indicator with data:', JSON.stringify(req.body, null, 2));

    const indicatorData = {
      ...req.body
    };

    // Transformer le code en uppercase si présent
    if (indicatorData.code) {
      indicatorData.code = indicatorData.code.toUpperCase().trim();
    }

    // Vérifier si req.user existe avant d'accéder à ses propriétés
    if (req.user) {
      indicatorData.createdBy = req.user._id || req.user.id || null;
    }

    // Vérifier que l'entreprise existe
    if (indicatorData.entreprise) {
      const enterpriseExists = await Entreprise.findById(indicatorData.entreprise);
      if (!enterpriseExists) {
        return res.status(400).json({
          success: false,
          message: 'L\'entreprise spécifiée n\'existe pas',
          error: 'INVALID_ENTERPRISE'
        });
      }
    }

    // Nettoyer les champs vides
    if (!indicatorData.framework || indicatorData.framework === '') {
      delete indicatorData.framework;
    }
    
    if (indicatorData.linkedKPIs && Array.isArray(indicatorData.linkedKPIs) && indicatorData.linkedKPIs.length === 0) {
      delete indicatorData.linkedKPIs;
    }

    // Nettoyer les tableaux optionnels vides
    if (indicatorData.verificationMeans && indicatorData.verificationMeans.length === 0) {
      delete indicatorData.verificationMeans;
    }
    if (indicatorData.assumptions && indicatorData.assumptions.length === 0) {
      delete indicatorData.assumptions;
    }

    // Nettoyer les champs optionnels vides
    if (!indicatorData.dataSource || indicatorData.dataSource === '') {
      delete indicatorData.dataSource;
    }
    if (!indicatorData.responsible || indicatorData.responsible === '') {
      delete indicatorData.responsible;
    }
    if (!indicatorData.description || indicatorData.description === '') {
      delete indicatorData.description;
    }

    console.log('Cleaned indicator data:', JSON.stringify(indicatorData, null, 2));

    const indicator = new Indicator(indicatorData);
    await indicator.save();

    console.log('Indicator saved successfully:', indicator._id);

    // Si lié à des KPIs, mettre à jour les KPIs
    if (req.body.linkedKPIs && req.body.linkedKPIs.length > 0) {
      try {
        await KPI.updateMany(
          { _id: { $in: req.body.linkedKPIs } },
          { $addToSet: { linkedIndicators: indicator._id } }
        );
        console.log('KPIs updated with indicator link');
      } catch (kpiError) {
        console.error('Error updating KPIs (non-critical):', kpiError.message);
        // Continue même si la mise à jour des KPIs échoue
      }
    }

    const populatedIndicator = await Indicator.findById(indicator._id)
      .populate('entreprise', 'identification.nomEntreprise nom name')
      .populate('framework', 'name description')
      .populate('linkedKPIs', 'name nom code');

    res.status(201).json({
      success: true,
      data: populatedIndicator,
      message: 'Indicateur créé avec succès'
    });
  } catch (error) {
    console.error('Error creating indicator:', error);
    console.error('Error details:', error.stack);
    
    // Gestion spéciale pour les codes dupliqués
    if (error.code === 11000 && error.keyPattern?.code) {
      return res.status(400).json({
        success: false,
        message: 'Un indicateur avec ce code existe déjà',
        error: 'CODE_DUPLICATE'
      });
    }
    
    // Gestion des erreurs de validation
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation des données',
        error: error.message,
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'indicateur',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Mettre à jour un indicateur
exports.updateIndicator = async (req, res) => {
  try {
    const indicator = await Indicator.findById(req.params.id);

    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: 'Indicateur non trouvé'
      });
    }

    // Sauvegarder les anciens KPIs liés
    const oldLinkedKPIs = indicator.linkedKPIs.map(id => id.toString());

    // Mettre à jour l'indicateur
    Object.assign(indicator, req.body);
    indicator.updatedBy = req.user?._id || '000000000000000000000000';
    
    await indicator.save();

    // Gérer les changements de KPIs liés
    if (req.body.linkedKPIs) {
      const newLinkedKPIs = req.body.linkedKPIs.map(id => id.toString());
      
      // Retirer l'indicateur des KPIs qui ne sont plus liés
      const kpisToRemove = oldLinkedKPIs.filter(id => !newLinkedKPIs.includes(id));
      if (kpisToRemove.length > 0) {
        await KPI.updateMany(
          { _id: { $in: kpisToRemove } },
          { $pull: { linkedIndicators: indicator._id } }
        );
      }

      // Ajouter l'indicateur aux nouveaux KPIs
      const kpisToAdd = newLinkedKPIs.filter(id => !oldLinkedKPIs.includes(id));
      if (kpisToAdd.length > 0) {
        await KPI.updateMany(
          { _id: { $in: kpisToAdd } },
          { $addToSet: { linkedIndicators: indicator._id } }
        );
      }
    }

    const updatedIndicator = await Indicator.findById(indicator._id)
      .populate('entreprise', 'identification.nomEntreprise nom')
      .populate('framework', 'name')
      .populate('linkedKPIs', 'nom code');

    res.json({
      success: true,
      data: updatedIndicator,
      message: 'Indicateur mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating indicator:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'indicateur',
      error: error.message
    });
  }
};

// Supprimer un indicateur (soft delete)
exports.deleteIndicator = async (req, res) => {
  try {
    const indicator = await Indicator.findById(req.params.id);

    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: 'Indicateur non trouvé'
      });
    }

    // Soft delete
    indicator.isActive = false;
    indicator.updatedBy = req.user?._id || '000000000000000000000000';
    await indicator.save();

    // Retirer des KPIs liés
    if (indicator.linkedKPIs && indicator.linkedKPIs.length > 0) {
      await KPI.updateMany(
        { _id: { $in: indicator.linkedKPIs } },
        { $pull: { linkedIndicators: indicator._id } }
      );
    }

    res.json({
      success: true,
      message: 'Indicateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting indicator:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'indicateur',
      error: error.message
    });
  }
};

// Ajouter une valeur à l'historique
exports.addIndicatorValue = async (req, res) => {
  try {
    const { value, comment } = req.body;
    const indicator = await Indicator.findById(req.params.id);

    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: 'Indicateur non trouvé'
      });
    }

    // Ajouter à l'historique
    indicator.history.push({
      date: new Date(),
      value: parseFloat(value),
      comment: comment || '',
      recordedBy: req.user?._id || '000000000000000000000000'
    });

    // Mettre à jour la valeur actuelle
    indicator.current = parseFloat(value);
    indicator.updatedBy = req.user?._id || '000000000000000000000000';

    await indicator.save();

    const updatedIndicator = await Indicator.findById(indicator._id)
      .populate('entreprise', 'identification.nomEntreprise nom')
      .populate('framework', 'name')
      .populate('history.recordedBy', 'nom prenom');

    res.json({
      success: true,
      data: updatedIndicator,
      message: 'Valeur ajoutée avec succès'
    });
  } catch (error) {
    console.error('Error adding indicator value:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la valeur',
      error: error.message
    });
  }
};

// Obtenir les indicateurs d'un cadre de résultats
exports.getIndicatorsByFramework = async (req, res) => {
  try {
    const indicators = await Indicator.find({
      framework: req.params.frameworkId,
      isActive: true
    })
      .populate('entreprise', 'identification.nomEntreprise nom')
      .populate('linkedKPIs', 'nom code valeurCible valeurActuelle')
      .sort({ type: 1, name: 1 });

    res.json({
      success: true,
      data: indicators
    });
  } catch (error) {
    console.error('Error fetching framework indicators:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des indicateurs du cadre',
      error: error.message
    });
  }
};

// Obtenir les indicateurs liés à un KPI
exports.getIndicatorsLinkedToKPI = async (req, res) => {
  try {
    const indicators = await Indicator.find({
      linkedKPIs: req.params.kpiId,
      isActive: true
    })
      .populate('entreprise', 'identification.nomEntreprise nom')
      .populate('framework', 'name description')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: indicators
    });
  } catch (error) {
    console.error('Error fetching KPI indicators:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des indicateurs du KPI',
      error: error.message
    });
  }
};

// Lier un indicateur à un KPI
exports.linkToKPI = async (req, res) => {
  try {
    const { kpiId } = req.body;
    const indicator = await Indicator.findById(req.params.id);

    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: 'Indicateur non trouvé'
      });
    }

    // Ajouter le KPI à la liste des KPIs liés
    if (!indicator.linkedKPIs.includes(kpiId)) {
      indicator.linkedKPIs.push(kpiId);
      await indicator.save();

      // Mettre à jour le KPI
      await KPI.findByIdAndUpdate(kpiId, {
        $addToSet: { linkedIndicators: indicator._id }
      });
    }

    const updatedIndicator = await Indicator.findById(indicator._id)
      .populate('linkedKPIs', 'nom code');

    res.json({
      success: true,
      data: updatedIndicator,
      message: 'Indicateur lié au KPI avec succès'
    });
  } catch (error) {
    console.error('Error linking indicator to KPI:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la liaison avec le KPI',
      error: error.message
    });
  }
};

// Délier un indicateur d'un KPI
exports.unlinkFromKPI = async (req, res) => {
  try {
    const { kpiId } = req.body;
    const indicator = await Indicator.findById(req.params.id);

    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: 'Indicateur non trouvé'
      });
    }

    // Retirer le KPI de la liste
    indicator.linkedKPIs = indicator.linkedKPIs.filter(id => id.toString() !== kpiId);
    await indicator.save();

    // Mettre à jour le KPI
    await KPI.findByIdAndUpdate(kpiId, {
      $pull: { linkedIndicators: indicator._id }
    });

    res.json({
      success: true,
      message: 'Indicateur délié du KPI avec succès'
    });
  } catch (error) {
    console.error('Error unlinking indicator from KPI:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du lien avec le KPI',
      error: error.message
    });
  }
};

// Obtenir les statistiques des indicateurs
exports.getIndicatorStats = async (req, res) => {
  try {
    const { entrepriseId } = req.query;
    const filter = { isActive: true };
    if (entrepriseId) filter.entreprise = entrepriseId;

    const indicators = await Indicator.find(filter);

    const stats = {
      total: indicators.length,
      byType: {
        OUTCOME: indicators.filter(i => i.type === 'OUTCOME').length,
        OUTPUT: indicators.filter(i => i.type === 'OUTPUT').length,
        ACTIVITY: indicators.filter(i => i.type === 'ACTIVITY').length,
        IMPACT: indicators.filter(i => i.type === 'IMPACT').length
      },
      byStatus: {
        ON_TRACK: indicators.filter(i => i.status === 'ON_TRACK').length,
        AT_RISK: indicators.filter(i => i.status === 'AT_RISK').length,
        OFF_TRACK: indicators.filter(i => i.status === 'OFF_TRACK').length,
        NOT_STARTED: indicators.filter(i => i.status === 'NOT_STARTED').length
      },
      averageProgress: indicators.length > 0
        ? indicators.reduce((sum, i) => sum + i.calculateProgress(), 0) / indicators.length
        : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching indicator stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

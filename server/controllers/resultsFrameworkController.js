const ResultsFramework = require('../models/ResultsFramework');
const Indicator = require('../models/Indicator');

// Obtenir tous les cadres de résultats
exports.getAllFrameworks = async (req, res) => {
  try {
    const { entrepriseId, status } = req.query;
    
    const filter = {};
    if (entrepriseId) filter.entreprise = entrepriseId;
    if (status) filter.status = status;

    const frameworks = await ResultsFramework.find(filter)
      .populate('entreprise', 'identification.nomEntreprise nom name')
      .populate('project', 'nom name')
      .populate('createdBy', 'nom prenom email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: frameworks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Créer un nouveau cadre de résultats
exports.createFramework = async (req, res) => {
  try {
    const framework = new ResultsFramework({
      ...req.body,
      createdBy: req.user?._id || '000000000000000000000000'
    });
    
    await framework.save();
    
    const populatedFramework = await ResultsFramework.findById(framework._id)
      .populate('entreprise', 'identification.nomEntreprise nom name')
      .populate('project', 'nom name');
    
    res.status(201).json({
      success: true,
      data: populatedFramework,
      message: 'Cadre de résultats créé avec succès'
    });
  } catch (error) {
    console.error('Error creating framework:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir tous les cadres de résultats d'un projet
exports.getFrameworksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const frameworks = await ResultsFramework.find({ project: projectId })
      .populate('createdBy', 'nom prenom email')
      .populate('updatedBy', 'nom prenom email')
      .populate({
        path: 'impact.indicators outcomes.indicators outputs.indicators',
        select: 'name description type unit targetValue currentValue'
      })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: frameworks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir un cadre de résultats spécifique
exports.getFrameworkById = async (req, res) => {
  try {
    const framework = await ResultsFramework.findById(req.params.id)
      .populate('createdBy', 'nom prenom email')
      .populate('updatedBy', 'nom prenom email')
      .populate({
        path: 'impact.indicators outcomes.indicators outputs.indicators',
        select: 'name description type unit targetValue currentValue'
      });
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: framework
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mettre à jour un cadre de résultats
exports.updateFramework = async (req, res) => {
  try {
    const framework = await ResultsFramework.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?._id || '000000000000000000000000',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: framework
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ajouter un outcome
exports.addOutcome = async (req, res) => {
  try {
    const framework = await ResultsFramework.findById(req.params.id);
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    framework.outcomes.push(req.body);
    framework.updatedBy = req.user?._id || '000000000000000000000000';
    await framework.save();
    
    res.json({
      success: true,
      data: framework
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ajouter un output
exports.addOutput = async (req, res) => {
  try {
    const framework = await ResultsFramework.findById(req.params.id);
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    framework.outputs.push(req.body);
    framework.updatedBy = req.user?._id || '000000000000000000000000';
    await framework.save();
    
    res.json({
      success: true,
      data: framework
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ajouter une activité
exports.addActivity = async (req, res) => {
  try {
    const framework = await ResultsFramework.findById(req.params.id);
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    framework.activities.push(req.body);
    framework.updatedBy = req.user?._id || '000000000000000000000000';
    await framework.save();
    
    res.json({
      success: true,
      data: framework
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mettre à jour le statut d'une activité
exports.updateActivityStatus = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { status, progressPercentage } = req.body;
    
    const framework = await ResultsFramework.findOne({
      'activities._id': activityId
    });
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Activité non trouvée'
      });
    }
    
    const activity = framework.activities.id(activityId);
    if (status) activity.status = status;
    if (progressPercentage !== undefined) activity.progressPercentage = progressPercentage;
    
    framework.updatedBy = req.user?._id || '000000000000000000000000';
    await framework.save();
    
    res.json({
      success: true,
      data: framework
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Lier un indicateur à un élément du cadre
exports.linkIndicator = async (req, res) => {
  try {
    const { frameworkId, elementType, elementId, indicatorId } = req.body;
    
    const framework = await ResultsFramework.findById(frameworkId);
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    // Vérifier que l'indicateur existe
    const indicator = await Indicator.findById(indicatorId);
    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: 'Indicateur non trouvé'
      });
    }
    
    // Ajouter l'indicateur selon le type d'élément
    switch (elementType) {
      case 'impact':
        if (!framework.impact.indicators) framework.impact.indicators = [];
        framework.impact.indicators.push(indicatorId);
        break;
      case 'outcome':
        const outcome = framework.outcomes.id(elementId);
        if (!outcome) {
          return res.status(404).json({
            success: false,
            message: 'Outcome non trouvé'
          });
        }
        if (!outcome.indicators) outcome.indicators = [];
        outcome.indicators.push(indicatorId);
        break;
      case 'output':
        const output = framework.outputs.id(elementId);
        if (!output) {
          return res.status(404).json({
            success: false,
            message: 'Output non trouvé'
          });
        }
        if (!output.indicators) output.indicators = [];
        output.indicators.push(indicatorId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Type d\'élément invalide'
        });
    }
    
    framework.updatedBy = req.user?._id || '000000000000000000000000';
    await framework.save();
    
    res.json({
      success: true,
      data: framework
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Générer un rapport de cadre logique
exports.generateLogframeReport = async (req, res) => {
  try {
    const framework = await ResultsFramework.findById(req.params.id)
      .populate({
        path: 'impact.indicators outcomes.indicators outputs.indicators',
        select: 'name description type unit targetValue currentValue'
      });
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    const report = framework.generateLogframeReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Ajouter/mettre à jour la théorie du changement
exports.updateTheoryOfChange = async (req, res) => {
  try {
    const framework = await ResultsFramework.findById(req.params.id);
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    framework.theoryOfChange = req.body;
    framework.updatedBy = req.user?._id || '000000000000000000000000';
    await framework.save();
    
    res.json({
      success: true,
      data: framework
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ajouter un risque
exports.addRisk = async (req, res) => {
  try {
    const framework = await ResultsFramework.findById(req.params.id);
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    framework.risks.push(req.body);
    framework.updatedBy = req.user?._id || '000000000000000000000000';
    await framework.save();
    
    res.json({
      success: true,
      data: framework
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir les statistiques d'un cadre de résultats
exports.getFrameworkStats = async (req, res) => {
  try {
    const framework = await ResultsFramework.findById(req.params.id);
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    const stats = {
      totalOutcomes: framework.outcomes.length,
      achievedOutcomes: framework.outcomes.filter(o => o.status === 'ACHIEVED').length,
      totalOutputs: framework.outputs.length,
      achievedOutputs: framework.outputs.filter(o => o.status === 'ACHIEVED').length,
      totalActivities: framework.activities.length,
      completedActivities: framework.activities.filter(a => a.status === 'COMPLETED').length,
      overallProgress: framework.overallProgress,
      overallStatus: framework.calculateOverallStatus(),
      totalIndicators: framework.allIndicators.length,
      budgetUtilization: calculateBudgetUtilization(framework)
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

// Fonction helper pour calculer l'utilisation du budget
function calculateBudgetUtilization(framework) {
  if (!framework.totalBudget || !framework.totalBudget.amount) return 0;
  
  const totalActivityBudget = framework.activities.reduce((sum, activity) => {
    return sum + (activity.budget?.amount || 0);
  }, 0);
  
  return Math.round((totalActivityBudget / framework.totalBudget.amount) * 100);
}

// Supprimer un cadre de résultats
exports.deleteFramework = async (req, res) => {
  try {
    const framework = await ResultsFramework.findByIdAndDelete(req.params.id);
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Cadre de résultats supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


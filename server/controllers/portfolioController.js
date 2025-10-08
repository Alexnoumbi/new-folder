const Portfolio = require('../models/Portfolio');
const Entreprise = require('../models/Entreprise');
const Indicator = require('../models/Indicator');

// Obtenir les statistiques globales des portfolios
exports.getGlobalPortfolioStats = async (req, res) => {
  try {
    const portfolios = await Portfolio.find();
    
    const stats = {
      totalPortfolios: portfolios.length,
      activePortfolios: portfolios.filter(p => p.status === 'ACTIVE').length,
      totalProjects: portfolios.reduce((sum, p) => sum + (p.projects?.length || 0), 0),
      totalBudget: portfolios.reduce((sum, p) => sum + (p.budget?.total || 0), 0),
      allocatedBudget: portfolios.reduce((sum, p) => sum + (p.budget?.allocated || 0), 0),
      spentBudget: portfolios.reduce((sum, p) => sum + (p.budget?.spent || 0), 0),
      byType: {
        programme: portfolios.filter(p => p.portfolioType === 'PROGRAMME').length,
        thematic: portfolios.filter(p => p.portfolioType === 'THEMATIC').length,
        region: portfolios.filter(p => p.portfolioType === 'REGION').length,
        donor: portfolios.filter(p => p.portfolioType === 'DONOR').length
      },
      avgPerformanceScore: portfolios.length > 0 
        ? Math.round(portfolios.reduce((sum, p) => sum + (p.performanceScore?.overall || 0), 0) / portfolios.length)
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting global portfolio stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Créer un nouveau portfolio
exports.createPortfolio = async (req, res) => {
  try {
    const portfolio = new Portfolio({
      ...req.body,
      createdBy: req.user._id
    });
    
    await portfolio.save();
    
    res.status(201).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir tous les portfolios
exports.getPortfolios = async (req, res) => {
  try {
    const { status, portfolioType } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (portfolioType) filter.portfolioType = portfolioType;
    
    const portfolios = await Portfolio.find(filter)
      .populate('projects', 'identification.nomEntreprise statut')
      .populate('createdBy', 'nom prenom email')
      .populate('team.user', 'nom prenom email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir un portfolio par ID
exports.getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id)
      .populate('projects')
      .populate('createdBy', 'nom prenom email')
      .populate('updatedBy', 'nom prenom email')
      .populate('team.user', 'nom prenom email')
      .populate('aggregatedIndicators.sourceIndicators');
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mettre à jour un portfolio
exports.updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    );
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Supprimer un portfolio
exports.deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Portfolio supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Ajouter un projet au portfolio
exports.addProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    const project = await Entreprise.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }
    
    await portfolio.addProject(projectId);
    
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Retirer un projet du portfolio
exports.removeProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    await portfolio.removeProject(projectId);
    
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Calculer les indicateurs agrégés
exports.calculateAggregatedIndicators = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    const indicators = await portfolio.calculateAggregatedIndicators();
    
    res.json({
      success: true,
      data: indicators
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Calculer le score de performance
exports.calculatePerformanceScore = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    const score = await portfolio.calculatePerformanceScore();
    
    res.json({
      success: true,
      data: { score }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Générer un rapport de synthèse
exports.generateSummaryReport = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    const report = await portfolio.generateSummaryReport();
    
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

// Obtenir les statistiques du portfolio
exports.getPortfolioStats = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id)
      .populate('projects', 'statut performanceEconomique investissementEmploi');
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    const stats = {
      overview: {
        totalProjects: portfolio.projectCount,
        activeProjects: portfolio.projects.filter(p => p.statut === 'Actif').length,
        totalBudget: portfolio.budget.totalBudget.amount,
        budgetSpent: portfolio.budget.spent,
        executionRate: portfolio.budgetExecutionRate
      },
      performance: {
        overallScore: portfolio.performance.overallScore,
        dimensions: portfolio.performance.dimensions
      },
      beneficiaries: {
        directTarget: portfolio.beneficiaries.direct.target,
        directReached: portfolio.beneficiaries.direct.reached,
        reachRate: portfolio.beneficiaries.direct.target > 0
          ? Math.round((portfolio.beneficiaries.direct.reached / portfolio.beneficiaries.direct.target) * 100)
          : 0
      },
      risks: {
        total: portfolio.risks.length,
        critical: portfolio.risks.filter(r => 
          r.probability === 'CRITICAL' || r.impact === 'CRITICAL'
        ).length,
        byCategory: groupByCategory(portfolio.risks)
      },
      geography: portfolio.geographicCoverage,
      team: {
        size: portfolio.team.length,
        roles: groupByRole(portfolio.team)
      }
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

// Ajouter un risque au portfolio
exports.addRisk = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    portfolio.risks.push({
      ...req.body,
      owner: req.user._id
    });
    
    portfolio.updatedBy = req.user._id;
    await portfolio.save();
    
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ajouter une leçon apprise
exports.addLessonLearned = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    portfolio.lessonsLearned.push({
      ...req.body,
      dateIdentified: new Date()
    });
    
    portfolio.updatedBy = req.user._id;
    await portfolio.save();
    
    res.json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir une vue comparative des projets
exports.getProjectsComparison = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id)
      .populate('projects');
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    const comparison = portfolio.projects.map(project => ({
      id: project._id,
      name: project.identification?.nomEntreprise,
      status: project.statut,
      budget: project.performanceEconomique?.chiffreAffaires?.montant || 0,
      employees: project.investissementEmploi?.effectifsEmployes || 0,
      region: project.identification?.region,
      sector: project.identification?.secteurActivite
    }));
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Fonctions helper
function groupByCategory(risks) {
  return risks.reduce((acc, risk) => {
    const category = risk.category || 'OTHER';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
}

function groupByRole(team) {
  return team.reduce((acc, member) => {
    const role = member.role;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
}

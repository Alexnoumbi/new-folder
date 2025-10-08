const mongoose = require('mongoose');

// Schéma pour la gestion de portfolio
const portfolioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  
  // Type de portfolio
  portfolioType: {
    type: String,
    enum: ['PROGRAM', 'THEME', 'REGION', 'DONOR', 'CUSTOM'],
    required: true
  },
  
  // Projets inclus dans le portfolio
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entreprise'
  }],
  
  // Objectifs du portfolio
  objectives: [{
    description: String,
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    targetDate: Date,
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'AT_RISK'],
      default: 'NOT_STARTED'
    }
  }],
  
  // Indicateurs agrégés au niveau portfolio
  aggregatedIndicators: [{
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['SUM', 'AVERAGE', 'WEIGHTED_AVERAGE', 'PERCENTAGE', 'COUNT']
    },
    sourceIndicators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Indicator' }],
    targetValue: Number,
    currentValue: Number,
    unit: String,
    weight: Number, // Pour les moyennes pondérées
    calculationFormula: String
  }],
  
  // Budget consolidé
  budget: {
    totalBudget: {
      amount: Number,
      currency: {
        type: String,
        enum: ['FCFA', 'USD', 'EUR'],
        default: 'FCFA'
      }
    },
    allocated: Number,
    spent: Number,
    committed: Number,
    available: Number,
    breakdown: [{
      project: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' },
      allocated: Number,
      spent: Number,
      percentage: Number
    }]
  },
  
  // Période du portfolio
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    fiscalYear: String
  },
  
  // Bailleurs et partenaires
  donors: [{
    name: String,
    type: {
      type: String,
      enum: ['BILATERAL', 'MULTILATERAL', 'FOUNDATION', 'PRIVATE', 'GOVERNMENT', 'OTHER']
    },
    contribution: {
      amount: Number,
      currency: String,
      percentage: Number
    },
    contactPerson: String,
    email: String,
    requirements: [String]
  }],
  
  partners: [{
    name: String,
    type: {
      type: String,
      enum: ['IMPLEMENTING', 'TECHNICAL', 'FINANCIAL', 'STRATEGIC']
    },
    role: String,
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' }]
  }],
  
  // Zones géographiques couvertes
  geographicCoverage: [{
    region: String,
    country: String,
    province: String,
    projectCount: Number
  }],
  
  // Bénéficiaires
  beneficiaries: {
    direct: {
      target: Number,
      reached: Number,
      breakdown: [{
        category: String, // ex: 'Femmes', 'Jeunes', 'Agriculteurs'
        count: Number
      }]
    },
    indirect: {
      target: Number,
      estimated: Number
    }
  },
  
  // Risques consolidés
  risks: [{
    description: String,
    category: {
      type: String,
      enum: ['FINANCIAL', 'OPERATIONAL', 'STRATEGIC', 'REPUTATIONAL', 'COMPLIANCE']
    },
    probability: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    impact: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    affectedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' }],
    mitigationPlan: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['IDENTIFIED', 'MONITORING', 'MITIGATING', 'CLOSED'],
      default: 'IDENTIFIED'
    }
  }],
  
  // Leçons apprises et bonnes pratiques
  lessonsLearned: [{
    title: String,
    description: String,
    category: String,
    source: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' },
    dateIdentified: Date,
    recommendations: [String],
    status: {
      type: String,
      enum: ['DOCUMENTED', 'SHARED', 'APPLIED'],
      default: 'DOCUMENTED'
    }
  }],
  
  // Rapports planifiés
  reportingSchedule: [{
    reportType: String,
    frequency: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'AD_HOC']
    },
    recipient: String,
    nextDueDate: Date,
    lastSubmitted: Date,
    template: String
  }],
  
  // Performance du portfolio
  performance: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    dimensions: [{
      name: String,
      score: Number,
      weight: Number,
      trend: {
        type: String,
        enum: ['UP', 'DOWN', 'STABLE']
      }
    }],
    lastAssessment: Date
  },
  
  // Équipe de gestion du portfolio
  team: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: {
      type: String,
      enum: ['MANAGER', 'COORDINATOR', 'M&E_SPECIALIST', 'FINANCIAL_OFFICER', 'TECHNICAL_ADVISOR']
    },
    responsibilities: [String],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' }]
  }],
  
  // Statut et métadonnées
  status: {
    type: String,
    enum: ['PLANNING', 'ACTIVE', 'CLOSING', 'CLOSED', 'ON_HOLD'],
    default: 'PLANNING'
  },
  visibility: {
    type: String,
    enum: ['PUBLIC', 'INTERNAL', 'RESTRICTED', 'CONFIDENTIAL'],
    default: 'INTERNAL'
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour calculer le nombre total de projets
portfolioSchema.virtual('projectCount').get(function() {
  return this.projects.length;
});

// Virtual pour calculer le taux d'exécution du budget
portfolioSchema.virtual('budgetExecutionRate').get(function() {
  if (!this.budget.totalBudget.amount || this.budget.totalBudget.amount === 0) return 0;
  return Math.round((this.budget.spent / this.budget.totalBudget.amount) * 100);
});

// Méthode pour calculer les indicateurs agrégés
portfolioSchema.methods.calculateAggregatedIndicators = async function() {
  const Indicator = mongoose.model('Indicator');
  
  for (const aggIndicator of this.aggregatedIndicators) {
    const sourceIndicators = await Indicator.find({
      _id: { $in: aggIndicator.sourceIndicators }
    });
    
    let value = 0;
    
    switch (aggIndicator.type) {
      case 'SUM':
        value = sourceIndicators.reduce((sum, ind) => sum + (ind.currentValue || 0), 0);
        break;
      case 'AVERAGE':
        const total = sourceIndicators.reduce((sum, ind) => sum + (ind.currentValue || 0), 0);
        value = sourceIndicators.length > 0 ? total / sourceIndicators.length : 0;
        break;
      case 'WEIGHTED_AVERAGE':
        // Calculer la moyenne pondérée si des poids sont définis
        const weightedSum = sourceIndicators.reduce((sum, ind, index) => {
          const weight = aggIndicator.weight || 1;
          return sum + ((ind.currentValue || 0) * weight);
        }, 0);
        const totalWeight = sourceIndicators.length * (aggIndicator.weight || 1);
        value = totalWeight > 0 ? weightedSum / totalWeight : 0;
        break;
      case 'COUNT':
        value = sourceIndicators.filter(ind => ind.currentValue > 0).length;
        break;
      default:
        value = 0;
    }
    
    aggIndicator.currentValue = Math.round(value * 100) / 100;
  }
  
  await this.save();
  return this.aggregatedIndicators;
};

// Méthode pour calculer le score de performance global
portfolioSchema.methods.calculatePerformanceScore = async function() {
  if (!this.performance.dimensions || this.performance.dimensions.length === 0) {
    this.performance.overallScore = 0;
    await this.save();
    return 0;
  }
  
  const totalWeight = this.performance.dimensions.reduce((sum, dim) => sum + (dim.weight || 1), 0);
  const weightedScore = this.performance.dimensions.reduce((sum, dim) => {
    return sum + (dim.score * (dim.weight || 1));
  }, 0);
  
  this.performance.overallScore = Math.round((weightedScore / totalWeight) * 100) / 100;
  this.performance.lastAssessment = new Date();
  
  await this.save();
  return this.performance.overallScore;
};

// Méthode pour générer un rapport de synthèse du portfolio
portfolioSchema.methods.generateSummaryReport = async function() {
  await this.populate('projects');
  await this.populate('team.user', 'nom prenom email');
  
  return {
    portfolio: {
      name: this.name,
      code: this.code,
      type: this.portfolioType,
      status: this.status
    },
    projects: {
      total: this.projectCount,
      active: this.projects.filter(p => p.statut === 'Actif').length,
      list: this.projects.map(p => ({
        id: p._id,
        name: p.identification?.nomEntreprise,
        status: p.statut
      }))
    },
    budget: {
      total: this.budget.totalBudget.amount,
      currency: this.budget.totalBudget.currency,
      spent: this.budget.spent,
      executionRate: this.budgetExecutionRate,
      available: this.budget.available
    },
    performance: {
      overallScore: this.performance.overallScore,
      dimensions: this.performance.dimensions
    },
    indicators: this.aggregatedIndicators.map(ind => ({
      name: ind.name,
      current: ind.currentValue,
      target: ind.targetValue,
      achievement: ind.targetValue > 0 
        ? Math.round((ind.currentValue / ind.targetValue) * 100) 
        : 0
    })),
    beneficiaries: {
      directTarget: this.beneficiaries.direct.target,
      directReached: this.beneficiaries.direct.reached,
      reachRate: this.beneficiaries.direct.target > 0
        ? Math.round((this.beneficiaries.direct.reached / this.beneficiaries.direct.target) * 100)
        : 0
    },
    risks: {
      total: this.risks.length,
      critical: this.risks.filter(r => r.probability === 'CRITICAL' || r.impact === 'CRITICAL').length,
      active: this.risks.filter(r => r.status === 'MONITORING' || r.status === 'MITIGATING').length
    },
    team: this.team.map(member => ({
      name: member.user?.nom + ' ' + member.user?.prenom,
      role: member.role,
      projectCount: member.projects.length
    }))
  };
};

// Méthode pour ajouter un projet au portfolio
portfolioSchema.methods.addProject = async function(projectId) {
  if (!this.projects.includes(projectId)) {
    this.projects.push(projectId);
    await this.save();
  }
  return this;
};

// Méthode pour retirer un projet du portfolio
portfolioSchema.methods.removeProject = async function(projectId) {
  this.projects = this.projects.filter(p => p.toString() !== projectId.toString());
  await this.save();
  return this;
};

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;


const mongoose = require('mongoose');

// Modèle pour la Théorie du Changement (Theory of Change)
const theoryOfChangeSchema = new mongoose.Schema({
  ultimateGoal: {
    type: String,
    required: true,
    trim: true
  },
  longTermOutcomes: [{
    description: String,
    timeframe: String,
    indicators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Indicator' }]
  }],
  intermediateOutcomes: [{
    description: String,
    timeframe: String,
    indicators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Indicator' }]
  }],
  shortTermOutcomes: [{
    description: String,
    timeframe: String,
    indicators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Indicator' }]
  }],
  activities: [{
    description: String,
    responsibleParty: String,
    timeline: String
  }],
  assumptions: [String],
  externalFactors: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Modèle pour le Cadre de Résultats (Results Framework)
const resultsFrameworkSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entreprise',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  frameworkType: {
    type: String,
    enum: ['LOGFRAME', 'THEORY_OF_CHANGE', 'RESULTS_CHAIN', 'OUTCOME_MAPPING'],
    default: 'LOGFRAME'
  },
  
  // Hiérarchie des résultats (selon le cadre logique)
  impact: {
    description: String,
    indicators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Indicator' }],
    verificationMeans: [String],
    assumptions: [String]
  },
  
  outcomes: [{
    level: {
      type: Number,
      default: 1
    },
    description: {
      type: String,
      required: true
    },
    indicators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Indicator' }],
    verificationMeans: [String],
    assumptions: [String],
    targetDate: Date,
    responsibleParty: String,
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'PARTIALLY_ACHIEVED', 'NOT_ACHIEVED'],
      default: 'NOT_STARTED'
    }
  }],
  
  outputs: [{
    description: {
      type: String,
      required: true
    },
    indicators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Indicator' }],
    verificationMeans: [String],
    assumptions: [String],
    targetDate: Date,
    responsibleParty: String,
    linkedOutcome: { type: mongoose.Schema.Types.ObjectId },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'PARTIALLY_ACHIEVED', 'NOT_ACHIEVED'],
      default: 'NOT_STARTED'
    }
  }],
  
  activities: [{
    description: {
      type: String,
      required: true
    },
    linkedOutput: { type: mongoose.Schema.Types.ObjectId },
    inputs: [{
      type: String
    }],
    budget: {
      amount: Number,
      currency: {
        type: String,
        enum: ['FCFA', 'USD', 'EUR'],
        default: 'FCFA'
      }
    },
    timeline: {
      startDate: Date,
      endDate: Date
    },
    responsibleParty: String,
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'],
      default: 'NOT_STARTED'
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  
  // Théorie du changement intégrée
  theoryOfChange: theoryOfChangeSchema,
  
  // Risques et hypothèses globales
  risks: [{
    description: String,
    probability: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    impact: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    mitigationStrategy: String,
    status: {
      type: String,
      enum: ['IDENTIFIED', 'MONITORING', 'MITIGATED', 'MATERIALIZED'],
      default: 'IDENTIFIED'
    }
  }],
  
  // Parties prenantes
  stakeholders: [{
    name: String,
    type: {
      type: String,
      enum: ['BENEFICIARY', 'PARTNER', 'DONOR', 'GOVERNMENT', 'IMPLEMENTING_AGENCY', 'OTHER']
    },
    role: String,
    influence: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW']
    },
    interest: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW']
    }
  }],
  
  // Budget et ressources
  totalBudget: {
    amount: Number,
    currency: {
      type: String,
      enum: ['FCFA', 'USD', 'EUR'],
      default: 'FCFA'
    },
    breakdown: [{
      category: String,
      amount: Number,
      percentage: Number
    }]
  },
  
  // Période du projet
  projectPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    phases: [{
      name: String,
      startDate: Date,
      endDate: Date,
      milestones: [String]
    }]
  },
  
  // Métadonnées
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  version: {
    type: Number,
    default: 1
  },
  lastReviewed: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Virtual pour calculer le pourcentage global de réalisation
resultsFrameworkSchema.virtual('overallProgress').get(function() {
  if (this.activities.length === 0) return 0;
  
  const totalProgress = this.activities.reduce((sum, activity) => {
    return sum + (activity.progressPercentage || 0);
  }, 0);
  
  return Math.round(totalProgress / this.activities.length);
});

// Virtual pour obtenir les indicateurs liés
resultsFrameworkSchema.virtual('allIndicators').get(function() {
  const indicators = [];
  
  if (this.impact?.indicators) {
    indicators.push(...this.impact.indicators);
  }
  
  this.outcomes?.forEach(outcome => {
    if (outcome.indicators) {
      indicators.push(...outcome.indicators);
    }
  });
  
  this.outputs?.forEach(output => {
    if (output.indicators) {
      indicators.push(...output.indicators);
    }
  });
  
  return [...new Set(indicators)]; // Remove duplicates
});

// Méthode pour calculer le statut global
resultsFrameworkSchema.methods.calculateOverallStatus = function() {
  const outcomeStatuses = this.outcomes.map(o => o.status);
  const outputStatuses = this.outputs.map(o => o.status);
  const allStatuses = [...outcomeStatuses, ...outputStatuses];
  
  if (allStatuses.every(s => s === 'ACHIEVED')) return 'ON_TRACK';
  if (allStatuses.some(s => s === 'NOT_ACHIEVED')) return 'AT_RISK';
  if (allStatuses.some(s => s === 'IN_PROGRESS')) return 'IN_PROGRESS';
  
  return 'NOT_STARTED';
};

// Méthode pour générer un rapport de cadre logique
resultsFrameworkSchema.methods.generateLogframeReport = function() {
  return {
    project: this.project,
    framework: this.name,
    reportDate: new Date(),
    hierarchy: {
      impact: {
        description: this.impact?.description,
        indicators: this.impact?.indicators?.length || 0,
        status: this.impact?.status
      },
      outcomes: this.outcomes.map(o => ({
        description: o.description,
        indicators: o.indicators?.length || 0,
        status: o.status,
        progress: this.calculateOutcomeProgress(o._id)
      })),
      outputs: this.outputs.map(o => ({
        description: o.description,
        indicators: o.indicators?.length || 0,
        status: o.status
      })),
      activities: this.activities.map(a => ({
        description: a.description,
        status: a.status,
        progress: a.progressPercentage
      }))
    },
    overallProgress: this.overallProgress,
    overallStatus: this.calculateOverallStatus()
  };
};

// Méthode pour calculer la progression d'un outcome
resultsFrameworkSchema.methods.calculateOutcomeProgress = function(outcomeId) {
  const relatedOutputs = this.outputs.filter(o => 
    o.linkedOutcome && o.linkedOutcome.toString() === outcomeId.toString()
  );
  
  if (relatedOutputs.length === 0) return 0;
  
  const achievedOutputs = relatedOutputs.filter(o => o.status === 'ACHIEVED').length;
  return Math.round((achievedOutputs / relatedOutputs.length) * 100);
};

const ResultsFramework = mongoose.model('ResultsFramework', resultsFrameworkSchema);

module.exports = ResultsFramework;


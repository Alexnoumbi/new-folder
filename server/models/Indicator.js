const mongoose = require('mongoose');

const indicatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['OUTCOME', 'OUTPUT', 'ACTIVITY', 'IMPACT', 'QUANTITATIVE', 'QUALITATIVE'],
    required: true
  },
  // Liaison avec Cadre de Résultats
  framework: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResultsFramework'
  },
  // Liaison avec KPIs d'entreprise
  linkedKPIs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KPI'
  }],
  // Entreprise concernée
  entreprise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entreprise',
    required: true
  },
  // Mesures
  unit: {
    type: String,
    required: true,
    trim: true
  },
  baseline: {
    type: Number,
    default: 0
  },
  target: {
    type: Number,
    required: true
  },
  current: {
    type: Number,
    default: 0
  },
  targetDate: {
    type: Date
  },
  // Fréquence de collecte
  frequency: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'],
    default: 'MONTHLY'
  },
  // Source de données
  dataSource: {
    type: String,
    trim: true
  },
  responsible: {
    type: String,
    trim: true
  },
  // Historique des valeurs
  history: [{
    date: {
      type: Date,
      default: Date.now
    },
    value: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      trim: true
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Statut automatique basé sur progression
  status: {
    type: String,
    enum: ['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'NOT_STARTED'],
    default: 'NOT_STARTED'
  },
  // Moyens de vérification
  verificationMeans: [{
    type: String,
    trim: true
  }],
  // Hypothèses
  assumptions: [{
    type: String,
    trim: true
  }],
  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
indicatorSchema.index({ code: 1 });
indicatorSchema.index({ entreprise: 1 });
indicatorSchema.index({ framework: 1 });
indicatorSchema.index({ type: 1 });
// Index textuel désactivé temporairement pour éviter les conflits
// indicatorSchema.index({ name: 'text', description: 'text' });

// Méthode pour calculer le pourcentage de progression
indicatorSchema.methods.calculateProgress = function() {
  if (!this.target || this.target === 0) return 0;
  return Math.min((this.current / this.target) * 100, 100);
};

// Méthode pour mettre à jour le statut automatiquement
indicatorSchema.methods.updateStatus = function() {
  const progress = this.calculateProgress();
  
  if (progress === 0) {
    this.status = 'NOT_STARTED';
  } else if (progress >= 75) {
    this.status = 'ON_TRACK';
  } else if (progress >= 50) {
    this.status = 'AT_RISK';
  } else {
    this.status = 'OFF_TRACK';
  }
  
  return this.status;
};

// Middleware pour mettre à jour le statut avant sauvegarde
indicatorSchema.pre('save', function(next) {
  if (this.isModified('current') || this.isModified('target')) {
    this.updateStatus();
  }
  next();
});

module.exports = mongoose.model('Indicator', indicatorSchema);

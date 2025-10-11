const mongoose = require('mongoose');

const reportTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['PORTFOLIO', 'PROJECT', 'KPI', 'COMPLIANCE', 'CUSTOM', 'MONTHLY', 'QUARTERLY', 'ANNUAL']
  },
  format: {
    type: String,
    required: true,
    enum: ['PDF', 'EXCEL', 'WORD'],
    default: 'PDF'
  },
  sections: [{
    type: String,
    enum: [
      'STATISTICS',
      'ENTREPRISES',
      'INDICATORS',
      'KPIS',
      'VISITS',
      'FRAMEWORKS',
      'PORTFOLIOS',
      'COMPLIANCE',
      'CHARTS',
      'SUMMARY',
      'RECOMMENDATIONS'
    ]
  }],
  filters: {
    region: String,
    secteur: String,
    status: String,
    dateRange: {
      type: String,
      enum: ['LAST_MONTH', 'LAST_QUARTER', 'LAST_YEAR', 'CUSTOM']
    },
    customFilters: mongoose.Schema.Types.Mixed
  },
  layout: {
    orientation: {
      type: String,
      enum: ['PORTRAIT', 'LANDSCAPE'],
      default: 'PORTRAIT'
    },
    pageSize: {
      type: String,
      enum: ['A4', 'A3', 'LETTER'],
      default: 'A4'
    },
    includeHeader: {
      type: Boolean,
      default: true
    },
    includeFooter: {
      type: Boolean,
      default: true
    },
    includeTableOfContents: {
      type: Boolean,
      default: false
    },
    colorScheme: {
      type: String,
      enum: ['DEFAULT', 'BLUE', 'GREEN', 'PROFESSIONAL'],
      default: 'DEFAULT'
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
reportTemplateSchema.index({ type: 1, isDefault: 1 });
reportTemplateSchema.index({ name: 'text', description: 'text' });
reportTemplateSchema.index({ createdBy: 1 });

// Méthode pour incrémenter le compteur d'utilisation
reportTemplateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  await this.save();
  return this;
};

// Méthode pour dupliquer un template
reportTemplateSchema.methods.duplicate = async function() {
  const ReportTemplate = mongoose.model('ReportTemplate');
  
  const duplicatedTemplate = new ReportTemplate({
    name: `${this.name} (Copie)`,
    description: this.description,
    type: this.type,
    format: this.format,
    sections: [...this.sections],
    filters: { ...this.filters },
    layout: { ...this.layout },
    isDefault: false,
    usageCount: 0,
    createdBy: this.createdBy
  });
  
  await duplicatedTemplate.save();
  return duplicatedTemplate;
};

module.exports = mongoose.model('ReportTemplate', reportTemplateSchema);


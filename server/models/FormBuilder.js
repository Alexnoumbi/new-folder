const mongoose = require('mongoose');

// Schéma pour les champs de formulaire
const formFieldSchema = new mongoose.Schema({
  fieldId: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    required: true,
    enum: [
      'TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'PHONE', 'DATE', 'TIME', 'DATETIME',
      'SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX', 'FILE', 'IMAGE',
      'RATING', 'SCALE', 'SIGNATURE', 'LOCATION', 'CURRENCY'
    ]
  },
  description: String,
  placeholder: String,
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  
  // Options pour les champs de sélection
  options: [{
    value: String,
    label: String
  }],
  
  // Validation
  validation: {
    min: Number,
    max: Number,
    minLength: Number,
    maxLength: Number,
    pattern: String,
    customValidation: String
  },
  
  // Configuration conditionnelle
  conditional: {
    enabled: {
      type: Boolean,
      default: false
    },
    dependsOn: String, // ID du champ parent
    condition: String, // 'equals', 'not_equals', 'contains', etc.
    value: mongoose.Schema.Types.Mixed
  },
  
  // Configuration spécifique au type
  config: {
    // Pour les fichiers
    acceptedTypes: [String],
    maxSize: Number, // en MB
    
    // Pour les échelles/ratings
    minValue: Number,
    maxValue: Number,
    step: Number,
    
    // Pour les devises
    currency: String,
    
    // Pour la localisation
    enableMap: Boolean,
    
    // Pour les calculs
    formula: String,
    linkedFields: [String]
  },
  
  // Intégration avec indicateurs
  linkedIndicator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Indicator'
  }
});

// Schéma principal du formulaire
const formBuilderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  formType: {
    type: String,
    enum: ['DATA_COLLECTION', 'SURVEY', 'ASSESSMENT', 'MONITORING', 'EVALUATION', 'REPORTING'],
    required: true
  },
  
  // Organisation en sections
  sections: [{
    sectionId: String,
    title: String,
    description: String,
    order: Number,
    fields: [formFieldSchema],
    repeatable: {
      type: Boolean,
      default: false
    },
    maxRepetitions: Number
  }],
  
  // Projet/Entreprise associé
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entreprise'
  },
  
  // Cadre de résultats associé
  resultsFramework: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResultsFramework'
  },
  
  // Configuration du formulaire
  settings: {
    allowDraft: {
      type: Boolean,
      default: true
    },
    allowEdit: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    enableOfflineMode: {
      type: Boolean,
      default: false
    },
    enableNotifications: {
      type: Boolean,
      default: true
    },
    autoSaveInterval: {
      type: Number,
      default: 30 // en secondes
    },
    expirationDate: Date,
    maxSubmissions: Number,
    allowAnonymous: {
      type: Boolean,
      default: false
    }
  },
  
  // Intégrations externes
  integrations: {
    koboToolbox: {
      enabled: Boolean,
      apiKey: String,
      formId: String
    },
    googleForms: {
      enabled: Boolean,
      formId: String
    },
    odk: {
      enabled: Boolean,
      serverUrl: String
    }
  },
  
  // Workflows d'approbation
  approvalWorkflow: {
    enabled: {
      type: Boolean,
      default: false
    },
    steps: [{
      order: Number,
      approverRole: String,
      approverUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      required: Boolean,
      autoApprove: Boolean,
      conditions: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Notifications
  notifications: {
    onSubmit: {
      enabled: Boolean,
      recipients: [String], // emails
      template: String
    },
    onApproval: {
      enabled: Boolean,
      recipients: [String],
      template: String
    },
    onRejection: {
      enabled: Boolean,
      recipients: [String],
      template: String
    }
  },
  
  // Statistiques
  stats: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    pendingSubmissions: {
      type: Number,
      default: 0
    },
    approvedSubmissions: {
      type: Number,
      default: 0
    },
    rejectedSubmissions: {
      type: Number,
      default: 0
    },
    lastSubmissionDate: Date
  },
  
  // Métadonnées
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  version: {
    type: Number,
    default: 1
  },
  publishedAt: Date,
  closedAt: Date,
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

// Virtual pour obtenir toutes les soumissions
formBuilderSchema.virtual('submissions', {
  ref: 'FormSubmission',
  localField: '_id',
  foreignField: 'form'
});

// Méthode pour dupliquer un formulaire
formBuilderSchema.methods.duplicate = async function() {
  const duplicate = new this.constructor(this.toObject());
  duplicate._id = mongoose.Types.ObjectId();
  duplicate.name = `${this.name} (copie)`;
  duplicate.status = 'DRAFT';
  duplicate.version = 1;
  duplicate.stats = {
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0
  };
  
  await duplicate.save();
  return duplicate;
};

// Méthode pour publier le formulaire
formBuilderSchema.methods.publish = async function() {
  this.status = 'ACTIVE';
  this.publishedAt = new Date();
  await this.save();
  return this;
};

// Méthode pour fermer le formulaire
formBuilderSchema.methods.close = async function() {
  this.status = 'CLOSED';
  this.closedAt = new Date();
  await this.save();
  return this;
};

// Schéma pour les soumissions de formulaire
const formSubmissionSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormBuilder',
    required: true
  },
  
  // Données soumises
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Métadonnées de soumission
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submitterEmail: String,
  submitterName: String,
  
  // Statut
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'],
    default: 'SUBMITTED'
  },
  
  // Workflow d'approbation
  approvalHistory: [{
    step: Number,
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String, // 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  currentApprovalStep: {
    type: Number,
    default: 0
  },
  
  // Fichiers joints
  attachments: [{
    fieldId: String,
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Géolocalisation (optionnel)
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    },
    address: String
  },
  
  // Tracking
  ipAddress: String,
  userAgent: String,
  deviceInfo: String,
  submissionDuration: Number, // en secondes
  
  // Validation
  validationErrors: [{
    fieldId: String,
    message: String
  }],
  
  // Brouillon
  isDraft: {
    type: Boolean,
    default: false
  },
  draftSavedAt: Date,
  
  // Métadonnées
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectionReason: String,
  
  // Synchronisation offline
  offlineId: String,
  syncedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index géospatial
formSubmissionSchema.index({ location: '2dsphere' });

// Méthode pour approuver une soumission
formSubmissionSchema.methods.approve = async function(approverId, comment = '') {
  this.status = 'APPROVED';
  this.approvedAt = new Date();
  this.approvedBy = approverId;
  
  this.approvalHistory.push({
    step: this.currentApprovalStep,
    approver: approverId,
    action: 'APPROVED',
    comment
  });
  
  await this.save();
  
  // Mettre à jour les statistiques du formulaire
  await mongoose.model('FormBuilder').findByIdAndUpdate(this.form, {
    $inc: { 
      'stats.approvedSubmissions': 1,
      'stats.pendingSubmissions': -1
    },
    'stats.lastSubmissionDate': new Date()
  });
  
  return this;
};

// Méthode pour rejeter une soumission
formSubmissionSchema.methods.reject = async function(approverId, reason) {
  this.status = 'REJECTED';
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  
  this.approvalHistory.push({
    step: this.currentApprovalStep,
    approver: approverId,
    action: 'REJECTED',
    comment: reason
  });
  
  await this.save();
  
  // Mettre à jour les statistiques
  await mongoose.model('FormBuilder').findByIdAndUpdate(this.form, {
    $inc: { 
      'stats.rejectedSubmissions': 1,
      'stats.pendingSubmissions': -1
    }
  });
  
  return this;
};

const FormBuilder = mongoose.model('FormBuilder', formBuilderSchema);
const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

module.exports = { FormBuilder, FormSubmission };


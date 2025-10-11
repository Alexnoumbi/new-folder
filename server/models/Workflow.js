const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['DOCUMENT_APPROVAL', 'ENTERPRISE_VALIDATION', 'REPORT_REVIEW', 'CONVENTION_APPROVAL', 'VISIT_APPROVAL', 'CUSTOM'],
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  
  // Étapes du workflow
  steps: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    order: {
      type: Number,
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedRole: {
      type: String,
      enum: ['admin', 'manager', 'validator', 'reviewer', 'approver']
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'SKIPPED'],
      default: 'PENDING'
    },
    requiredAction: {
      type: String,
      enum: ['APPROVE', 'REVIEW', 'VALIDATE', 'COMMENT', 'UPLOAD', 'FILL_FORM']
    },
    dueDate: Date,
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    attachments: [{
      name: String,
      url: String,
      uploadedAt: Date
    }]
  }],
  
  // Conditions et règles
  conditions: [{
    field: String,
    operator: {
      type: String,
      enum: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS']
    },
    value: mongoose.Schema.Types.Mixed,
    action: {
      type: String,
      enum: ['SKIP_STEP', 'REQUIRE_STEP', 'NOTIFY', 'ASSIGN_TO']
    }
  }],
  
  // Entité liée
  relatedEntity: {
    type: {
      type: String,
      enum: ['ENTREPRISE', 'DOCUMENT', 'CONVENTION', 'VISIT', 'REPORT', 'KPI', 'INDICATOR']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  
  // Participants
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['INITIATOR', 'APPROVER', 'REVIEWER', 'OBSERVER', 'PARTICIPANT']
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    }
  }],
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['STARTED', 'STEP_COMPLETED', 'APPROVAL_REQUIRED', 'REJECTED', 'COMPLETED', 'OVERDUE']
    },
    recipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    message: String,
    sentAt: Date,
    read: { type: Boolean, default: false }
  }],
  
  // Historique et audit
  history: [{
    action: {
      type: String,
      enum: ['CREATED', 'STARTED', 'STEP_COMPLETED', 'APPROVED', 'REJECTED', 'PAUSED', 'RESUMED', 'COMPLETED']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    },
    details: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Métriques
  metrics: {
    startedAt: Date,
    completedAt: Date,
    totalDuration: Number, // en heures
    averageStepDuration: Number,
    currentStep: Number,
    progressPercentage: Number
  },
  
  // Configuration
  settings: {
    autoAssign: { type: Boolean, default: false },
    requireSequential: { type: Boolean, default: true },
    allowParallelSteps: { type: Boolean, default: false },
    sendNotifications: { type: Boolean, default: true },
    escalationEnabled: { type: Boolean, default: false },
    escalationDelay: Number // en heures
  },
  
  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  }
}, {
  timestamps: true
});

// Index pour performance
workflowSchema.index({ status: 1 });
workflowSchema.index({ type: 1 });
workflowSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 });
workflowSchema.index({ createdBy: 1 });
workflowSchema.index({ 'steps.assignedTo': 1 });
workflowSchema.index({ createdAt: -1 });

// Méthode pour calculer la progression
workflowSchema.methods.calculateProgress = function() {
  if (!this.steps || this.steps.length === 0) return 0;
  
  const completedSteps = this.steps.filter(s => s.status === 'COMPLETED').length;
  this.metrics.progressPercentage = Math.round((completedSteps / this.steps.length) * 100);
  this.metrics.currentStep = completedSteps + 1;
  
  return this.metrics.progressPercentage;
};

// Méthode pour passer à l'étape suivante
workflowSchema.methods.moveToNextStep = async function() {
  const currentStepIndex = this.steps.findIndex(s => s.status === 'IN_PROGRESS');
  
  if (currentStepIndex >= 0) {
    this.steps[currentStepIndex].status = 'COMPLETED';
    this.steps[currentStepIndex].completedAt = new Date();
  }
  
  const nextStepIndex = this.steps.findIndex(s => s.status === 'PENDING');
  if (nextStepIndex >= 0) {
    this.steps[nextStepIndex].status = 'IN_PROGRESS';
  } else {
    // Tous les steps complétés
    this.status = 'COMPLETED';
    this.metrics.completedAt = new Date();
    if (this.metrics.startedAt) {
      const durationMs = this.metrics.completedAt - this.metrics.startedAt;
      this.metrics.totalDuration = Math.round(durationMs / (1000 * 60 * 60)); // en heures
    }
  }
  
  this.calculateProgress();
  await this.save();
  
  return this;
};

// Méthode pour démarrer le workflow
workflowSchema.methods.start = async function() {
  if (this.status !== 'DRAFT') {
    throw new Error('Le workflow doit être en mode DRAFT pour être démarré');
  }
  
  this.status = 'ACTIVE';
  this.metrics.startedAt = new Date();
  
  if (this.steps && this.steps.length > 0) {
    this.steps[0].status = 'IN_PROGRESS';
  }
  
  this.history.push({
    action: 'STARTED',
    date: new Date(),
    details: 'Workflow démarré'
  });
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Workflow', workflowSchema);


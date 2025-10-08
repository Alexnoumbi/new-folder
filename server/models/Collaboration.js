const mongoose = require('mongoose');

// Schéma pour les discussions/commentaires
const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  // Entité associée
  entityType: {
    type: String,
    enum: ['PROJECT', 'INDICATOR', 'FRAMEWORK', 'PORTFOLIO', 'FORM', 'REPORT'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Statut de la discussion
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN'
  },
  
  // Priorité
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  
  // Participants
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: {
      type: String,
      enum: ['OWNER', 'ASSIGNEE', 'PARTICIPANT', 'VIEWER']
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Messages/Commentaires
  messages: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: {
      type: String,
      required: true
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number,
      mimeType: String
    }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    editedAt: Date,
    reactions: [{
      emoji: String,
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }]
  }],
  
  // Tâches liées
  tasks: [{
    description: String,
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: Date,
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
      default: 'TODO'
    },
    priority: String,
    completedAt: Date,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Métadonnées
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Schéma pour les workflows d'approbation
const approvalWorkflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  // Type d'entité auquel ce workflow s'applique
  applicableType: {
    type: String,
    enum: ['FORM_SUBMISSION', 'REPORT', 'INDICATOR_UPDATE', 'BUDGET_CHANGE', 'PROJECT_MILESTONE', 'CUSTOM'],
    required: true
  },
  
  // Étapes du workflow
  steps: [{
    order: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    
    // Approbateurs
    approvers: {
      type: {
        type: String,
        enum: ['SPECIFIC_USERS', 'ROLE', 'DYNAMIC'],
        default: 'SPECIFIC_USERS'
      },
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      role: String,
      dynamicRule: String // Expression pour déterminer dynamiquement les approbateurs
    },
    
    // Configuration
    requiresAllApprovers: {
      type: Boolean,
      default: false // Si false, un seul approbateur suffit
    },
    allowDelegation: {
      type: Boolean,
      default: true
    },
    slaHours: Number, // SLA en heures pour cette étape
    autoEscalate: {
      enabled: Boolean,
      escalateTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      afterHours: Number
    },
    
    // Actions possibles
    allowedActions: [{
      type: String,
      enum: ['APPROVE', 'REJECT', 'REQUEST_CHANGES', 'DELEGATE', 'SKIP']
    }],
    
    // Conditions pour passer à cette étape
    conditions: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }]
  }],
  
  // Notifications
  notifications: {
    onSubmission: {
      enabled: Boolean,
      recipients: String, // 'ASSIGNEE', 'CREATOR', 'ALL_APPROVERS'
      template: String
    },
    onApproval: {
      enabled: Boolean,
      recipients: String,
      template: String
    },
    onRejection: {
      enabled: Boolean,
      recipients: String,
      template: String
    },
    beforeSLA: {
      enabled: Boolean,
      hoursBeforeSLA: Number,
      recipients: String,
      template: String
    }
  },
  
  // Statut
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'],
    default: 'DRAFT'
  },
  
  // Métadonnées
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
  timestamps: true
});

// Schéma pour les instances de workflow (processus en cours)
const workflowInstanceSchema = new mongoose.Schema({
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalWorkflow',
    required: true
  },
  
  // Entité en cours d'approbation
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Progression
  currentStep: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED'],
    default: 'PENDING'
  },
  
  // Historique des étapes
  stepHistory: [{
    stepOrder: Number,
    stepName: String,
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    startedAt: Date,
    completedAt: Date,
    action: String, // 'APPROVE', 'REJECT', 'REQUEST_CHANGES', etc.
    actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    attachments: [{
      filename: String,
      url: String
    }],
    delegatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    delegatedAt: Date
  }],
  
  // SLA tracking
  sla: {
    expectedCompletionAt: Date,
    actualCompletionAt: Date,
    isOverdue: Boolean,
    escalated: Boolean,
    escalatedAt: Date,
    escalatedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // Métadonnées
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: Date,
  finalDecision: String,
  finalComment: String
}, {
  timestamps: true
});

// Méthode pour ajouter un message à une discussion
discussionSchema.methods.addMessage = async function(userId, content, attachments = [], mentions = []) {
  this.messages.push({
    author: userId,
    content,
    attachments,
    mentions
  });
  
  this.lastActivityAt = new Date();
  await this.save();
  
  // TODO: Envoyer des notifications aux participants et mentions
  
  return this;
};

// Méthode pour créer une tâche dans une discussion
discussionSchema.methods.createTask = async function(taskData) {
  this.tasks.push(taskData);
  this.lastActivityAt = new Date();
  await this.save();
  
  return this;
};

// Méthode pour démarrer une instance de workflow
approvalWorkflowSchema.methods.startInstance = async function(entityType, entityId, initiatedBy) {
  const WorkflowInstance = mongoose.model('WorkflowInstance');
  
  // Calculer le SLA
  let totalSLAHours = 0;
  this.steps.forEach(step => {
    if (step.slaHours) totalSLAHours += step.slaHours;
  });
  
  const instance = new WorkflowInstance({
    workflow: this._id,
    entityType,
    entityId,
    initiatedBy,
    currentStep: 0,
    status: 'IN_PROGRESS',
    sla: {
      expectedCompletionAt: totalSLAHours > 0 
        ? new Date(Date.now() + totalSLAHours * 60 * 60 * 1000)
        : undefined
    }
  });
  
  // Ajouter la première étape à l'historique
  if (this.steps.length > 0) {
    const firstStep = this.steps[0];
    instance.stepHistory.push({
      stepOrder: firstStep.order,
      stepName: firstStep.name,
      assignedTo: firstStep.approvers.users || [],
      startedAt: new Date()
    });
  }
  
  await instance.save();
  return instance;
};

// Méthode pour approuver une étape
workflowInstanceSchema.methods.approveStep = async function(userId, comment = '', attachments = []) {
  const workflow = await mongoose.model('ApprovalWorkflow').findById(this.workflow);
  const currentStepConfig = workflow.steps[this.currentStep];
  
  // Enregistrer l'approbation
  const currentHistory = this.stepHistory[this.stepHistory.length - 1];
  currentHistory.completedAt = new Date();
  currentHistory.action = 'APPROVE';
  currentHistory.actionBy = userId;
  currentHistory.comment = comment;
  currentHistory.attachments = attachments;
  
  // Vérifier si on peut passer à l'étape suivante
  const canProceed = currentStepConfig.requiresAllApprovers 
    ? this.hasAllApprovals(currentStepConfig)
    : true;
  
  if (canProceed) {
    // Passer à l'étape suivante ou finaliser
    if (this.currentStep < workflow.steps.length - 1) {
      this.currentStep += 1;
      const nextStep = workflow.steps[this.currentStep];
      
      this.stepHistory.push({
        stepOrder: nextStep.order,
        stepName: nextStep.name,
        assignedTo: nextStep.approvers.users || [],
        startedAt: new Date()
      });
    } else {
      // Workflow terminé
      this.status = 'APPROVED';
      this.completedAt = new Date();
      this.sla.actualCompletionAt = new Date();
      this.finalDecision = 'APPROVED';
    }
  }
  
  await this.save();
  return this;
};

// Méthode pour rejeter
workflowInstanceSchema.methods.reject = async function(userId, reason) {
  const currentHistory = this.stepHistory[this.stepHistory.length - 1];
  currentHistory.completedAt = new Date();
  currentHistory.action = 'REJECT';
  currentHistory.actionBy = userId;
  currentHistory.comment = reason;
  
  this.status = 'REJECTED';
  this.completedAt = new Date();
  this.sla.actualCompletionAt = new Date();
  this.finalDecision = 'REJECTED';
  this.finalComment = reason;
  
  await this.save();
  return this;
};

// Méthode helper pour vérifier toutes les approbations
workflowInstanceSchema.methods.hasAllApprovals = function(stepConfig) {
  // TODO: Implémenter la logique pour vérifier si tous les approbateurs requis ont approuvé
  return true;
};

const Discussion = mongoose.model('Discussion', discussionSchema);
const ApprovalWorkflow = mongoose.model('ApprovalWorkflow', approvalWorkflowSchema);
const WorkflowInstance = mongoose.model('WorkflowInstance', workflowInstanceSchema);

module.exports = { Discussion, ApprovalWorkflow, WorkflowInstance };


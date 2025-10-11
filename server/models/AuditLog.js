const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userDetails: {
    name: String,
    email: String
  },
  action: {
    type: String,
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 
      'LOGIN', 'LOGOUT', 
      'EXPORT', 'IMPORT',
      'APPROVE', 'REJECT',
      'SUBMIT', 'VALIDATE',
      'UPLOAD', 'DOWNLOAD',
      'SEND', 'RECEIVE',
      'VIEW', 'SEARCH',
      'UPDATE_ENTREPRISE_STATUT',
      'UPDATE_ENTREPRISE_CONFORMITE'
    ],
    required: true
  },
  entityType: {
    type: String,
    enum: [
      'USER', 'ENTERPRISE', 'KPI', 'DOCUMENT', 'REPORT', 
      'CONVENTION', 'VISIT', 'PORTFOLIO', 'INDICATOR',
      'MESSAGE', 'WORKFLOW', 'APPROVAL', 'SUBMISSION',
      'TEMPLATE', 'EXPORT', 'FORM', 'COMPLIANCE',
      'RESULTS_FRAMEWORK', 'CONTROL'
    ],
    required: true
  },
  entityId: {
    type: String,
    required: true
  },
  // Alias pour compatibilité
  resourceType: {
    type: String
  },
  resourceId: {
    type: String
  },
  changes: {
    type: mongoose.Schema.Types.Mixed
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['success', 'error', 'warning'],
    default: 'success'
  },
  ipAddress: String,
  userAgent: String,
  method: String,
  endpoint: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware pour synchroniser entityType/resourceType
auditLogSchema.pre('save', function(next) {
  if (this.entityType && !this.resourceType) {
    this.resourceType = this.entityType;
  }
  if (this.entityId && !this.resourceId) {
    this.resourceId = this.entityId;
  }
  next();
});

// Index pour améliorer les performances des requêtes
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ resourceType: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ status: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

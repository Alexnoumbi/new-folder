const mongoose = require('mongoose');

const SubmissionRequestSchema = new mongoose.Schema({
  entreprise: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  telephone: {
    type: String,
    trim: true
  },
  projet: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  workflowInstance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowInstance'
  },
  status: {
    type: String,
    enum: ['NEW', 'CONTACTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'NEW'
  },
  source: {
    type: String,
    enum: ['LANDING_PAGE', 'DIRECT_CONTACT', 'REFERRAL', 'OTHER'],
    default: 'LANDING_PAGE'
  },
  notes: {
    type: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responseDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour recherche et tri
SubmissionRequestSchema.index({ status: 1, createdAt: -1 });
SubmissionRequestSchema.index({ email: 1 });

module.exports = mongoose.model('SubmissionRequest', SubmissionRequestSchema);


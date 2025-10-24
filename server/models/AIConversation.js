const mongoose = require('mongoose');

const AIMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const AIConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'entreprise'],
    required: true
  },
  messages: [AIMessageSchema],
  metadata: {
    entrepriseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Entreprise'
    },
    resolved: {
      type: Boolean,
      default: false
    },
    escalated: {
      type: Boolean,
      default: false
    },
    escalationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubmissionRequest'
    },
    context: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour recherche et tri
AIConversationSchema.index({ userId: 1, createdAt: -1 });
AIConversationSchema.index({ role: 1, lastActivity: -1 });
AIConversationSchema.index({ 'metadata.entrepriseId': 1 });
AIConversationSchema.index({ isActive: 1 });

// Middleware pour mettre à jour lastActivity
AIConversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
  }
  next();
});

module.exports = mongoose.model('AIConversation', AIConversationSchema);

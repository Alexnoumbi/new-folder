const mongoose = require('mongoose');

const scheduledExportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM', 'PORTFOLIO', 'FRAMEWORK', 'FORM_SUBMISSIONS']
  },
  frequency: {
    type: String,
    required: true,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']
  },
  format: {
    type: String,
    required: true,
    enum: ['PDF', 'EXCEL', 'CSV']
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRun: {
    type: Date
  },
  nextRun: {
    type: Date,
    required: true
  },
  runCount: {
    type: Number,
    default: 0
  },
  schedule: {
    dayOfWeek: Number, // 0-6 (Dimanche = 0)
    dayOfMonth: Number, // 1-31
    hour: {
      type: Number,
      default: 8 // 8h du matin par défaut
    },
    minute: {
      type: Number,
      default: 0
    }
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  recipients: [{
    type: String, // Emails des destinataires
    trim: true,
    lowercase: true
  }],
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReportTemplate'
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

// Index pour recherche et tri
scheduledExportSchema.index({ isActive: 1, nextRun: 1 });
scheduledExportSchema.index({ createdBy: 1 });

// Méthode pour calculer la prochaine exécution
scheduledExportSchema.methods.calculateNextRun = function() {
  const now = new Date();
  let nextRun = new Date(now);
  
  switch(this.frequency) {
    case 'DAILY':
      nextRun.setDate(now.getDate() + 1);
      break;
    case 'WEEKLY':
      nextRun.setDate(now.getDate() + 7);
      break;
    case 'MONTHLY':
      nextRun.setMonth(now.getMonth() + 1);
      if (this.schedule.dayOfMonth) {
        nextRun.setDate(this.schedule.dayOfMonth);
      }
      break;
    case 'QUARTERLY':
      nextRun.setMonth(now.getMonth() + 3);
      break;
  }
  
  // Définir l'heure
  nextRun.setHours(this.schedule.hour || 8, this.schedule.minute || 0, 0, 0);
  
  this.nextRun = nextRun;
  return nextRun;
};

// Méthode pour enregistrer une exécution
scheduledExportSchema.methods.recordRun = async function() {
  this.lastRun = new Date();
  this.runCount += 1;
  this.calculateNextRun();
  await this.save();
};

module.exports = mongoose.model('ScheduledExport', scheduledExportSchema);


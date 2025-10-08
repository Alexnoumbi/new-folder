const mongoose = require('mongoose');

const OCRResultSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  filePath: String,
  textContent: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  wordsCount: Number,
  language: {
    type: String,
    default: 'french' // MongoDB text index supporte 'french', pas 'fra'
  },
  entrepriseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entreprise',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['PROCESSED', 'PENDING', 'ERROR', 'EDITED'],
    default: 'PROCESSED'
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
OCRResultSchema.index({ entrepriseId: 1, createdAt: -1 });
OCRResultSchema.index({ fileName: 'text', textContent: 'text' });

module.exports = mongoose.model('OCRResult', OCRResultSchema);


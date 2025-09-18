const mongoose = require('mongoose');

const controlSchema = new mongoose.Schema({
    entrepriseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entreprise',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['qualité', 'sécurité', 'environnement', 'conformité', 'autre']
    },
    status: {
        type: String,
        required: true,
        enum: ['planifié', 'en_cours', 'complété', 'annulé'],
        default: 'planifié'
    },
    dateControl: {
        type: Date,
        required: true
    },
    responsable: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    observations: {
        type: String
    },
    recommendations: {
        type: String
    },
    resultats: {
        conformité: {
            type: Number,
            min: 0,
            max: 100
        },
        nonConformités: [{
            description: String,
            gravité: {
                type: String,
                enum: ['mineure', 'majeure', 'critique']
            },
            actionCorrective: String,
            dateLimite: Date
        }]
    },
    documents: [{
        nom: String,
        type: String,
        url: String,
        dateUpload: {
            type: Date,
            default: Date.now
        }
    }],
    historique: [{
        date: {
            type: Date,
            default: Date.now
        },
        action: String,
        utilisateur: String,
        commentaire: String
    }]
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
controlSchema.index({ entrepriseId: 1, dateControl: 1 });
controlSchema.index({ status: 1 });

module.exports = mongoose.model('Control', controlSchema);

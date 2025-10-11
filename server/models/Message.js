const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false  // Optionnel pour chats d'entreprise généraux
    },
    entrepriseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entreprise',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }]
}, {
    timestamps: true
});

// Index pour améliorer les performances des requêtes
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ entrepriseId: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ read: 1 });
// Index textuel pour la recherche
messageSchema.index({ content: 'text' });

module.exports = mongoose.model('Message', messageSchema);

const mongoose = require('mongoose');

const securityAlertSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['INTRUSION_ATTEMPT', 'FAILED_LOGIN', 'SUSPICIOUS_ACTIVITY', 'PERMISSION_VIOLATION', 'DATA_BREACH']
    },
    severity: {
        type: String,
        required: true,
        enum: ['high', 'medium', 'low']
    },
    description: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    resolved: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    ipAddress: String,
    location: String,
    details: mongoose.Schema.Types.Mixed
});

// Index pour optimiser les recherches
securityAlertSchema.index({ timestamp: -1 });
securityAlertSchema.index({ severity: 1 });
securityAlertSchema.index({ type: 1 });
securityAlertSchema.index({ resolved: 1 });

const SecurityAlert = mongoose.model('SecurityAlert', securityAlertSchema);
module.exports = SecurityAlert;

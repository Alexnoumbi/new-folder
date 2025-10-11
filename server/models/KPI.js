const mongoose = require('mongoose');

const kpiHistorySchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true
    },
    comment: String,
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'validated', 'rejected'],
        default: 'pending'
    },
    validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    validatedAt: Date,
    validationComment: String
});

const kpiSchema = new mongoose.Schema({
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
        enum: ['NUMERIC', 'PERCENTAGE', 'CURRENCY', 'BOOLEAN'],
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    targetValue: {
        type: Number,
        required: true
    },
    minValue: Number,
    maxValue: Number,
    frequency: {
        type: String,
        enum: ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'],
        required: true
    },
    enterprise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enterprise'
    },
    currentValue: Number,
    history: [kpiHistorySchema],
    // Liaison avec les indicateurs de cadres logiques
    linkedIndicators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Indicator'
    }],
    code: {
        type: String,
        unique: true,
        sparse: true
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

// Méthode pour calculer la tendance du KPI
kpiSchema.methods.calculateTrend = function() {
    if (this.history.length < 2) return 'flat';

    const sortedHistory = this.history
        .filter(h => h.status === 'validated')
        .sort((a, b) => b.submittedAt - a.submittedAt);

    if (sortedHistory.length < 2) return 'flat';

    const latest = sortedHistory[0].value;
    const previous = sortedHistory[1].value;

    if (latest > previous) return 'up';
    if (latest < previous) return 'down';
    return 'flat';
};

// Méthode pour calculer le pourcentage de changement
kpiSchema.methods.calculateChange = function() {
    if (this.history.length < 2) return 0;

    const sortedHistory = this.history
        .filter(h => h.status === 'validated')
        .sort((a, b) => b.submittedAt - a.submittedAt);

    if (sortedHistory.length < 2) return 0;

    const latest = sortedHistory[0].value;
    const previous = sortedHistory[1].value;

    if (previous === 0) return 0;
    return ((latest - previous) / previous) * 100;
};

const KPI = mongoose.model('KPI', kpiSchema);

module.exports = KPI;

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['monthly', 'quarterly', 'annual', 'custom']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'in-progress'],
        default: 'pending'
    },
    format: {
        type: String,
        required: true,
        enum: ['pdf', 'excel']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    filePath: String,
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    error: String
});

module.exports = mongoose.model('Report', reportSchema);

const asyncHandler = require('express-async-handler');
const Control = require('../models/Control');

const getComplianceStatus = asyncHandler(async (req, res) => {
    // Mock data for now - Replace with actual implementation
    const complianceData = {
        overallScore: 85,
        passedControls: 42,
        pendingControls: 8,
        failedControls: 5,
        categories: [
            {
                categoryId: '1',
                name: 'Sécurité',
                score: 90,
                status: 'compliant',
                lastAssessment: new Date().toISOString(),
                items: [
                    { id: '1', status: 'compliant' },
                    { id: '2', status: 'compliant' },
                ]
            },
            {
                categoryId: '2',
                name: 'Protection des données',
                score: 75,
                status: 'partial',
                lastAssessment: new Date().toISOString(),
                items: [
                    { id: '3', status: 'compliant' },
                    { id: '4', status: 'non-compliant' },
                ]
            }
        ]
    };

    res.json(complianceData);
});

module.exports = {
    getComplianceStatus
};

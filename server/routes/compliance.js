const express = require('express');
const router = express.Router();
const { getComplianceStatus } = require('../controllers/complianceController');

// @route   GET /
// @desc    Get compliance status
// @access  Public
router.get('/', getComplianceStatus);
router.get('/status', getComplianceStatus);

module.exports = router;

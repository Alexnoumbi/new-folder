const express = require('express');
const router = express.Router();
const { getComplianceStatus } = require('../controllers/complianceController');

// @route   GET /status
// @desc    Get compliance status
// @access  Public
router.get('/status', getComplianceStatus);

module.exports = router;

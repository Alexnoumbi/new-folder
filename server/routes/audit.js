const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { getComplianceStatus } = require('../controllers/complianceController');

// Routes d'audit (accessibles sans authentification)
router.get('/logs/export', auditController.exportAuditLogs);
router.get('/logs', auditController.getAuditLogs);
router.get('/logs/:id', auditController.getAuditLogDetails);

// Route de compliance
router.get('/compliance', getComplianceStatus);
router.get('/compliance/status', getComplianceStatus);

module.exports = router;

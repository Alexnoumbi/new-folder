const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

// Routes d'audit (accessibles sans authentification)
router.get('/logs', auditController.getAuditLogs);
router.get('/logs/:id', auditController.getAuditLogDetails);

module.exports = router;

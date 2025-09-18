const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const auditController = require('../controllers/auditController');

// Routes d'audit
router.get('/logs', auth, auditController.getAuditLogs);
router.get('/logs/:id', auth, auditController.getAuditLogDetails);

module.exports = router;

const express = require('express');
const { getEntrepriseStats, getEntrepriseInfo } = require('../controllers/entrepriseController');

const router = express.Router();

// Routes des statistiques entreprise - sans authentification
router.get('/stats', getEntrepriseStats);
router.get('/me', getEntrepriseInfo);

module.exports = router;

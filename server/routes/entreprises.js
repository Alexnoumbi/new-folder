const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  getEntreprises,
  getEntreprise,
  createEntreprise,
  updateEntreprise,
  deleteEntreprise,
  getEntrepriseStats,
  getEntrepriseInfo,
  updateEntrepriseProfile,
  getEntrepriseDocuments,
  getEntrepriseControls,
  getEntrepriseAffiliations,
  getEntrepriseKPIHistory,
  getEntrepriseMessages,
  getEntrepriseReports,
  getGlobalStats,
  getEntreprisesAgrees,
  updateEntrepriseStatut,
  getEntreprisesEvolution,
  getEntrepriseComplete,
  updateEntrepriseConformite,
  getEntrepriseEvolutionData,
  getEntrepriseSnapshots,
  getEntrepriseActivityLog,
  uploadLogo
} = require('../controllers/entrepriseController');

// Configuration de multer pour les logos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `logo-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Seules les images sont acceptées.'), false);
    }
  }
});

// Routes publiques et générales
router.get('/', getEntreprises);

// Routes admin (accessibles sans authentification pour certaines, mais devrait être protégé)
router.get('/admin/stats', getGlobalStats);
router.get('/admin/agrees', getEntreprisesAgrees);
router.get('/admin/evolution', getEntreprisesEvolution);
router.get('/:id/complete', getEntrepriseComplete);
router.post('/', createEntreprise);
router.delete('/:id', deleteEntreprise);
router.patch('/:id/statut', updateEntrepriseStatut);
router.patch('/:id/conformite', updateEntrepriseConformite);

// Routes pour les statistiques et informations (protégées)
router.get('/stats', protect, getEntrepriseStats);
router.get('/me', protect, getEntrepriseInfo);
router.put('/profile', protect, updateEntrepriseProfile);
router.post('/logo', protect, upload.single('logo'), uploadLogo);

// Détail et mise à jour d'une entreprise (protégées)
router.get('/:id', protect, getEntreprise);
router.put('/:id', protect, updateEntreprise);

// Routes pour les ressources liées (protégées)
router.get('/:id/documents', protect, getEntrepriseDocuments);
router.get('/:id/controls', protect, getEntrepriseControls);
router.get('/:id/affiliations', protect, getEntrepriseAffiliations);
router.get('/:id/kpi-history', protect, getEntrepriseKPIHistory);
router.get('/:id/messages', protect, getEntrepriseMessages);
router.get('/:id/reports', protect, getEntrepriseReports);

// Routes pour évolution et traçabilité (protégées)
router.get('/:id/evolution', protect, getEntrepriseEvolutionData);
router.get('/:id/snapshots', protect, getEntrepriseSnapshots);
router.get('/:id/activity-log', protect, getEntrepriseActivityLog);

module.exports = router;

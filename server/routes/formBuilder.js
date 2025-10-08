const express = require('express');
const router = express.Router();
const {
  createForm,
  getForms,
  getFormById,
  updateForm,
  publishForm,
  closeForm,
  duplicateForm,
  deleteForm,
  submitForm,
  getSubmissions,
  getAllSubmissions,
  getSubmissionById,
  approveSubmission,
  rejectSubmission,
  exportSubmissions,
  getFormStats,
  updateSubmission
} = require('../controllers/formBuilderController');

// Routes spécifiques en premier (avant les routes avec :id)

// Route pour toutes les soumissions
router.get('/submissions', getAllSubmissions);

// Routes d'approbation globales
router.put('/submissions/:submissionId/approve', approveSubmission);
router.put('/submissions/:submissionId/reject', rejectSubmission);

// Routes publiques (pour les soumissions anonymes)
router.post('/:id/submit-public', submitForm);

// Routes CRUD formulaires
router.post('/', createForm);
router.get('/', getForms);

// Routes avec actions spécifiques (avant /:id générique)
router.post('/:id/publish', publishForm);
router.post('/:id/close', closeForm);
router.post('/:id/duplicate', duplicateForm);
router.get('/:id/stats', getFormStats);
router.get('/:id/export', exportSubmissions);

// Routes pour les soumissions d'un formulaire
router.post('/:id/submit', submitForm);
router.get('/:id/submissions', getSubmissions);
router.get('/:id/submissions/:submissionId', getSubmissionById);
router.put('/:id/submissions/:submissionId', updateSubmission);
router.post('/:id/submissions/:submissionId/approve', approveSubmission);
router.post('/:id/submissions/:submissionId/reject', rejectSubmission);

// Routes génériques formulaires (en dernier)
router.get('/:id', getFormById);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

module.exports = router;

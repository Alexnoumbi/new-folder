const express = require('express');
const router = express.Router();
const indicatorController = require('../controllers/indicatorController');
const auth = require('../middleware/auth');
const { validateIndicatorSubmission } = require('../middleware/indicatorValidation');

// Routes des indicateurs
router.post('/', auth, validateIndicatorSubmission, indicatorController.createIndicator);
router.get('/convention/:conventionId', auth, indicatorController.getIndicatorsByConvention);
router.get('/:id', auth, indicatorController.getIndicator);
router.put('/:id', auth, validateIndicatorSubmission, indicatorController.updateIndicator);
router.delete('/:id', auth, indicatorController.deleteIndicator);

// Routes pour les validations et commentaires
router.post('/:id/validate', auth, indicatorController.validateIndicator);
router.post('/:id/reject', auth, indicatorController.rejectIndicator);
router.post('/:id/comment', auth, indicatorController.addComment);

module.exports = router;

const express = require('express');
const router = express.Router();
const indicatorController = require('../controllers/indicatorController');
const { validateIndicatorSubmission } = require('../middleware/indicatorValidation');

// Routes des indicateurs (accessibles sans authentification)
router.post('/', validateIndicatorSubmission, indicatorController.createIndicator);
router.get('/convention/:conventionId', indicatorController.getIndicatorsByConvention);
router.get('/:id', indicatorController.getIndicator);
router.put('/:id', validateIndicatorSubmission, indicatorController.updateIndicator);
router.delete('/:id', indicatorController.deleteIndicator);

// Routes pour les validations et commentaires
router.post('/:id/validate', indicatorController.validateIndicator);
router.post('/:id/reject', indicatorController.rejectIndicator);
router.post('/:id/comment', indicatorController.addComment);

module.exports = router;

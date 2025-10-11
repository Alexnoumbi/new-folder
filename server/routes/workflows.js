const express = require('express');
const router = express.Router();
const {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  startWorkflow,
  completeStep,
  rejectStep,
  getWorkflowStats,
  getMyPendingTasks
} = require('../controllers/workflowController');

// Routes publiques
router.get('/stats', getWorkflowStats);
router.get('/my-tasks', getMyPendingTasks);

// CRUD
router.get('/', getAllWorkflows);
router.post('/', createWorkflow);
router.get('/:id', getWorkflowById);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);

// Actions
router.post('/:id/start', startWorkflow);
router.post('/:workflowId/steps/:stepIndex/complete', completeStep);
router.post('/:workflowId/steps/:stepIndex/reject', rejectStep);

module.exports = router;


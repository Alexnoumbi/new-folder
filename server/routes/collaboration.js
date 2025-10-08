const express = require('express');
const router = express.Router();
const {
  createDiscussion,
  getDiscussions,
  addMessage,
  createTask,
  updateTaskStatus,
  createWorkflow,
  getWorkflows,
  startWorkflowInstance,
  getWorkflowInstances,
  getMyPendingApprovals,
  approveStep,
  rejectStep,
  getCollaborationStats
} = require('../controllers/collaborationController');

// ============ DISCUSSIONS ============
router.post('/discussions', createDiscussion);
router.get('/discussions', getDiscussions);
router.post('/discussions/:id/messages', addMessage);
router.post('/discussions/:id/tasks', createTask);
router.put('/discussions/:id/tasks/:taskId/status', updateTaskStatus);

// ============ WORKFLOWS ============
router.post('/workflows', createWorkflow);
router.get('/workflows', getWorkflows);
router.post('/workflows/instances', startWorkflowInstance);
router.get('/workflows/instances', getWorkflowInstances);
router.get('/workflows/my-approvals', getMyPendingApprovals);
router.post('/workflows/instances/:id/approve', approveStep);
router.post('/workflows/instances/:id/reject', rejectStep);

// ============ STATISTIQUES ============
router.get('/stats', getCollaborationStats);

module.exports = router;


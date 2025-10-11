const { Discussion, ApprovalWorkflow, WorkflowInstance } = require('../models/Collaboration');

// ============ DISCUSSIONS ============

// Créer une nouvelle discussion
exports.createDiscussion = async (req, res) => {
  try {
    const discussion = new Discussion({
      ...req.body,
      createdBy: req.user._id,
      participants: [
        { user: req.user._id, role: 'OWNER' },
        ...(req.body.participants || [])
      ]
    });
    
    await discussion.save();
    
    res.status(201).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir les discussions
exports.getDiscussions = async (req, res) => {
  try {
    const { entityType, entityId, status } = req.query;
    
    const filter = {};
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;
    if (status) filter.status = status;
    
    const discussions = await Discussion.find(filter)
      .populate('createdBy', 'nom prenom email')
      .populate('participants.user', 'nom prenom email')
      .populate('messages.author', 'nom prenom email')
      .sort({ lastActivityAt: -1 });
    
    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Ajouter un message à une discussion
exports.addMessage = async (req, res) => {
  try {
    const { content, attachments, mentions } = req.body;
    
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }
    
    await discussion.addMessage(req.user._id, content, attachments, mentions);
    
    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Créer une tâche dans une discussion
exports.createTask = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }
    
    await discussion.createTask(req.body);
    
    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mettre à jour le statut d'une tâche
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    
    const discussion = await Discussion.findOne({ 'tasks._id': taskId });
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }
    
    const task = discussion.tasks.id(taskId);
    task.status = status;
    if (status === 'DONE') {
      task.completedAt = new Date();
      task.completedBy = req.user._id;
    }
    
    discussion.lastActivityAt = new Date();
    await discussion.save();
    
    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ============ WORKFLOWS D'APPROBATION ============

// Créer un workflow d'approbation
exports.createWorkflow = async (req, res) => {
  try {
    const workflow = new ApprovalWorkflow({
      ...req.body,
      createdBy: req.user._id
    });
    
    await workflow.save();
    
    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir les workflows
exports.getWorkflows = async (req, res) => {
  try {
    const { status, applicableType } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (applicableType) filter.applicableType = applicableType;
    
    const workflows = await ApprovalWorkflow.find(filter)
      .populate('createdBy', 'nom prenom email')
      .populate('steps.approvers.users', 'nom prenom email');
    
    res.json({
      success: true,
      data: workflows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Démarrer une instance de workflow
exports.startWorkflowInstance = async (req, res) => {
  try {
    const { workflowId, entityType, entityId } = req.body;
    
    const workflow = await ApprovalWorkflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow non trouvé'
      });
    }
    
    if (workflow.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Le workflow doit être actif'
      });
    }
    
    const instance = await workflow.startInstance(entityType, entityId, req.user._id);
    
    res.status(201).json({
      success: true,
      data: instance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir les instances de workflow
exports.getWorkflowInstances = async (req, res) => {
  try {
    const { status, entityType } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (entityType) filter.entityType = entityType;
    
    const instances = await WorkflowInstance.find(filter)
      .populate('workflow')
      .populate('initiatedBy', 'nom prenom email')
      .populate('stepHistory.assignedTo', 'nom prenom email')
      .populate('stepHistory.actionBy', 'nom prenom email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: instances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir mes approbations en attente
exports.getMyPendingApprovals = async (req, res) => {
  try {
    console.log('[APPROVALS] Fetching pending approvals...');
    
    const SubmissionRequest = require('../models/SubmissionRequest');
    
    // Récupérer TOUTES les instances de workflow en attente
    const query = { status: 'IN_PROGRESS' };
    
    const instances = await WorkflowInstance.find(query)
      .populate('workflow')
      .populate('initiatedBy', 'nom prenom email')
      .populate('entityId')
      .lean();
    
    console.log(`[APPROVALS] Found ${instances.length} workflow instances`);
    
    // Transformer les données au format attendu par le frontend
    const formattedApprovals = await Promise.all(instances.map(async (instance) => {
      const currentStepHistory = instance.stepHistory && instance.stepHistory.length > 0 
        ? instance.stepHistory[instance.stepHistory.length - 1] 
        : null;
      
      let itemName = instance.workflow?.name || 'Workflow';
      let requestedBy = {
        nom: instance.initiatedBy?.nom || 'Public',
        prenom: instance.initiatedBy?.prenom || ''
      };
      
      // Si c'est une soumission de demande, récupérer les détails
      if (instance.entityType === 'SUBMISSION_REQUEST' && instance.entityId) {
        try {
          const submission = await SubmissionRequest.findById(instance.entityId);
          if (submission) {
            itemName = `${submission.projet} - ${submission.entreprise}`;
            requestedBy = {
              nom: submission.email.split('@')[0],
              prenom: ''
            };
          }
        } catch (err) {
          console.error('[APPROVALS] Error fetching submission:', err);
        }
      }
      
      return {
        _id: instance._id,
        itemType: instance.entityType || 'CUSTOM',
        itemName: itemName,
        requestedBy: requestedBy,
        workflow: {
          name: instance.workflow?.name || 'Workflow',
          currentStep: currentStepHistory?.stepName || 'Étape en cours'
        },
        priority: determinePriority(instance),
        dueDate: instance.sla?.expectedCompletionAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: mapStatus(instance.status),
        createdAt: instance.createdAt,
        entityId: instance.entityId,
        documentsCount: 0 // Sera mis à jour si on trouve la soumission
      };
    }));
    
    console.log(`[APPROVALS] Formatted ${formattedApprovals.length} approvals`);
    
    res.json({
      success: true,
      data: formattedApprovals
    });
  } catch (error) {
    console.error('[APPROVALS] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper pour déterminer la priorité basée sur le SLA
function determinePriority(instance) {
  if (!instance.sla || !instance.sla.expectedCompletionAt) return 'MEDIUM';
  
  const now = new Date();
  const dueDate = new Date(instance.sla.expectedCompletionAt);
  const hoursRemaining = (dueDate - now) / (1000 * 60 * 60);
  
  if (hoursRemaining < 0) return 'URGENT';
  if (hoursRemaining < 24) return 'HIGH';
  if (hoursRemaining < 72) return 'MEDIUM';
  return 'LOW';
}

// Helper pour mapper le statut
function mapStatus(status) {
  switch (status) {
    case 'PENDING':
    case 'IN_PROGRESS':
      return 'PENDING';
    case 'APPROVED':
      return 'APPROVED';
    case 'REJECTED':
      return 'REJECTED';
    default:
      return 'PENDING';
  }
}

// Approuver une étape
exports.approveStep = async (req, res) => {
  try {
    console.log('[APPROVE] Approving workflow instance:', req.params.id);
    const { comment, attachments } = req.body;
    
    const SubmissionRequest = require('../models/SubmissionRequest');
    
    // Vérifier d'abord si c'est un workflow instance réel
    const instance = await WorkflowInstance.findById(req.params.id);
    if (!instance) {
      return res.status(404).json({
        success: false,
        message: 'Instance de workflow non trouvée'
      });
    }
    
    // Utiliser l'utilisateur connecté ou null
    const userId = req.user?._id || req.user?.id || null;
    
    await instance.approveStep(userId, comment, attachments);
    
    // Mettre à jour le statut de la soumission si c'est une SUBMISSION_REQUEST
    if (instance.entityType === 'SUBMISSION_REQUEST' && instance.status === 'APPROVED') {
      try {
        await SubmissionRequest.findByIdAndUpdate(instance.entityId, {
          status: 'APPROVED'
        });
        console.log('[APPROVE] Submission status updated to APPROVED');
      } catch (err) {
        console.error('[APPROVE] Error updating submission status:', err);
      }
    }
    
    res.json({
      success: true,
      message: 'Approbation effectuée avec succès',
      data: instance
    });
  } catch (error) {
    console.error('[APPROVE] Error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Rejeter
exports.rejectStep = async (req, res) => {
  try {
    console.log('[REJECT] Rejecting workflow instance:', req.params.id);
    const { reason } = req.body;
    
    const SubmissionRequest = require('../models/SubmissionRequest');
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Une raison est requise pour le rejet'
      });
    }
    
    // Vérifier d'abord si c'est un workflow instance réel
    const instance = await WorkflowInstance.findById(req.params.id);
    if (!instance) {
      return res.status(404).json({
        success: false,
        message: 'Instance de workflow non trouvée'
      });
    }
    
    // Utiliser l'utilisateur connecté ou null
    const userId = req.user?._id || req.user?.id || null;
    
    await instance.reject(userId, reason);
    
    // Mettre à jour le statut de la soumission si c'est une SUBMISSION_REQUEST
    if (instance.entityType === 'SUBMISSION_REQUEST') {
      try {
        await SubmissionRequest.findByIdAndUpdate(instance.entityId, {
          status: 'REJECTED'
        });
        console.log('[REJECT] Submission status updated to REJECTED');
      } catch (err) {
        console.error('[REJECT] Error updating submission status:', err);
      }
    }
    
    res.json({
      success: true,
      message: 'Rejet effectué avec succès',
      data: instance
    });
  } catch (error) {
    console.error('[REJECT] Error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtenir les statistiques de collaboration
exports.getCollaborationStats = async (req, res) => {
  try {
    const stats = {
      discussions: {
        total: await Discussion.countDocuments(),
        open: await Discussion.countDocuments({ status: 'OPEN' }),
        resolved: await Discussion.countDocuments({ status: 'RESOLVED' })
      },
      tasks: {
        total: await Discussion.aggregate([
          { $unwind: '$tasks' },
          { $count: 'total' }
        ]),
        pending: await Discussion.aggregate([
          { $unwind: '$tasks' },
          { $match: { 'tasks.status': { $in: ['TODO', 'IN_PROGRESS'] } } },
          { $count: 'pending' }
        ])
      },
      workflows: {
        active: await ApprovalWorkflow.countDocuments({ status: 'ACTIVE' }),
        instances: {
          pending: await WorkflowInstance.countDocuments({ status: 'IN_PROGRESS' }),
          approved: await WorkflowInstance.countDocuments({ status: 'APPROVED' }),
          rejected: await WorkflowInstance.countDocuments({ status: 'REJECTED' })
        }
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


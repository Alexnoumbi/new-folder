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
    const instances = await WorkflowInstance.find({
      status: 'IN_PROGRESS',
      'stepHistory.assignedTo': req.user._id,
      'stepHistory.completedAt': { $exists: false }
    })
      .populate('workflow')
      .populate('initiatedBy', 'nom prenom email');
    
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

// Approuver une étape
exports.approveStep = async (req, res) => {
  try {
    const { comment, attachments } = req.body;
    
    const instance = await WorkflowInstance.findById(req.params.id);
    if (!instance) {
      return res.status(404).json({
        success: false,
        message: 'Instance de workflow non trouvée'
      });
    }
    
    await instance.approveStep(req.user._id, comment, attachments);
    
    res.json({
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

// Rejeter
exports.rejectStep = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Une raison est requise pour le rejet'
      });
    }
    
    const instance = await WorkflowInstance.findById(req.params.id);
    if (!instance) {
      return res.status(404).json({
        success: false,
        message: 'Instance de workflow non trouvée'
      });
    }
    
    await instance.reject(req.user._id, reason);
    
    res.json({
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


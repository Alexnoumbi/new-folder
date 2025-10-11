const Workflow = require('../models/Workflow');
const User = require('../models/User');

// Obtenir tous les workflows
exports.getAllWorkflows = async (req, res) => {
  try {
    console.log('GetAllWorkflows - Fetching...');
    
    const { status, type, isTemplate } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (isTemplate !== undefined) filter.isTemplate = isTemplate === 'true';
    
    const workflows = await Workflow.find(filter)
      .populate('createdBy', 'nom prenom email')
      .populate('steps.assignedTo', 'nom prenom email role')
      .populate('participants.user', 'nom prenom email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${workflows.length} workflows`);
    
    res.json({
      success: true,
      count: workflows.length,
      data: workflows
    });
  } catch (error) {
    console.error('Error getting workflows:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des workflows',
      error: error.message
    });
  }
};

// Obtenir un workflow par ID
exports.getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('createdBy', 'nom prenom email')
      .populate('updatedBy', 'nom prenom email')
      .populate('steps.assignedTo', 'nom prenom email role')
      .populate('steps.completedBy', 'nom prenom email')
      .populate('participants.user', 'nom prenom email role')
      .populate('history.performedBy', 'nom prenom email');
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error getting workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du workflow',
      error: error.message
    });
  }
};

// Créer un workflow
exports.createWorkflow = async (req, res) => {
  try {
    console.log('CreateWorkflow:', req.body);
    
    const workflowData = {
      ...req.body,
      createdBy: req.user?._id || req.user?.id || null,
      metrics: {
        progressPercentage: 0,
        currentStep: 1
      }
    };
    
    const workflow = await Workflow.create(workflowData);
    
    console.log('Workflow created:', workflow._id);
    
    const populatedWorkflow = await Workflow.findById(workflow._id)
      .populate('createdBy', 'nom prenom email')
      .populate('steps.assignedTo', 'nom prenom email role');
    
    res.status(201).json({
      success: true,
      data: populatedWorkflow,
      message: 'Workflow créé avec succès'
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du workflow',
      error: error.message
    });
  }
};

// Mettre à jour un workflow
exports.updateWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow non trouvé'
      });
    }
    
    Object.assign(workflow, req.body);
    workflow.updatedBy = req.user?._id || req.user?.id || null;
    
    await workflow.save();
    
    const populatedWorkflow = await Workflow.findById(workflow._id)
      .populate('createdBy', 'nom prenom email')
      .populate('steps.assignedTo', 'nom prenom email');
    
    res.json({
      success: true,
      data: populatedWorkflow,
      message: 'Workflow mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du workflow',
      error: error.message
    });
  }
};

// Supprimer un workflow
exports.deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Workflow supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du workflow',
      error: error.message
    });
  }
};

// Démarrer un workflow
exports.startWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow non trouvé'
      });
    }
    
    await workflow.start();
    
    res.json({
      success: true,
      data: workflow,
      message: 'Workflow démarré avec succès'
    });
  } catch (error) {
    console.error('Error starting workflow:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors du démarrage du workflow'
    });
  }
};

// Compléter une étape
exports.completeStep = async (req, res) => {
  try {
    const { workflowId, stepIndex } = req.params;
    const { comment, attachments } = req.body;
    
    const workflow = await Workflow.findById(workflowId);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow non trouvé'
      });
    }
    
    if (!workflow.steps[stepIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Étape non trouvée'
      });
    }
    
    workflow.steps[stepIndex].status = 'COMPLETED';
    workflow.steps[stepIndex].completedAt = new Date();
    workflow.steps[stepIndex].completedBy = req.user?._id || req.user?.id || null;
    if (comment) workflow.steps[stepIndex].comment = comment;
    if (attachments) workflow.steps[stepIndex].attachments = attachments;
    
    // Historique
    workflow.history.push({
      action: 'STEP_COMPLETED',
      performedBy: req.user?._id || req.user?.id || null,
      date: new Date(),
      details: `Étape "${workflow.steps[stepIndex].name}" complétée`,
      metadata: { stepIndex, stepName: workflow.steps[stepIndex].name }
    });
    
    await workflow.moveToNextStep();
    
    res.json({
      success: true,
      data: workflow,
      message: 'Étape complétée avec succès'
    });
  } catch (error) {
    console.error('Error completing step:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la complétion de l\'étape',
      error: error.message
    });
  }
};

// Rejeter une étape
exports.rejectStep = async (req, res) => {
  try {
    const { workflowId, stepIndex } = req.params;
    const { reason } = req.body;
    
    const workflow = await Workflow.findById(workflowId);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow non trouvé'
      });
    }
    
    workflow.steps[stepIndex].status = 'REJECTED';
    workflow.steps[stepIndex].comment = reason;
    workflow.status = 'PAUSED';
    
    workflow.history.push({
      action: 'REJECTED',
      performedBy: req.user?._id || req.user?.id || null,
      date: new Date(),
      details: `Étape "${workflow.steps[stepIndex].name}" rejetée: ${reason}`
    });
    
    await workflow.save();
    
    res.json({
      success: true,
      data: workflow,
      message: 'Étape rejetée'
    });
  } catch (error) {
    console.error('Error rejecting step:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet de l\'étape',
      error: error.message
    });
  }
};

// Obtenir les statistiques
exports.getWorkflowStats = async (req, res) => {
  try {
    const [total, active, completed, draft, byType] = await Promise.all([
      Workflow.countDocuments(),
      Workflow.countDocuments({ status: 'ACTIVE' }),
      Workflow.countDocuments({ status: 'COMPLETED' }),
      Workflow.countDocuments({ status: 'DRAFT' }),
      Workflow.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        active,
        completed,
        draft,
        paused: total - active - completed - draft,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error getting workflow stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Obtenir mes tâches en attente
exports.getMyPendingTasks = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    const workflows = await Workflow.find({
      status: 'ACTIVE',
      'steps': {
        $elemMatch: {
          $or: [
            { assignedTo: userId },
            { assignedRole: req.user?.role }
          ],
          status: { $in: ['PENDING', 'IN_PROGRESS'] }
        }
      }
    })
    .populate('relatedEntity.id')
    .populate('steps.assignedTo', 'nom prenom email');
    
    // Extraire les tâches spécifiques
    const tasks = [];
    workflows.forEach(workflow => {
      workflow.steps.forEach((step, index) => {
        const isAssigned = step.assignedTo?.toString() === userId?.toString() || 
                          step.assignedRole === req.user?.role;
        const isPending = ['PENDING', 'IN_PROGRESS'].includes(step.status);
        
        if (isAssigned && isPending) {
          tasks.push({
            workflowId: workflow._id,
            workflowName: workflow.name,
            stepIndex: index,
            stepName: step.name,
            stepStatus: step.status,
            dueDate: step.dueDate,
            priority: workflow.priority,
            relatedEntity: workflow.relatedEntity
          });
        }
      });
    });
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error getting pending tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tâches',
      error: error.message
    });
  }
};


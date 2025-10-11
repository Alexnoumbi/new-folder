const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SubmissionRequest = require('../models/SubmissionRequest');
const { ApprovalWorkflow, WorkflowInstance } = require('../models/Collaboration');
const User = require('../models/User');

// Configuration de Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/submissions');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'submission-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter tous les types de fichiers pour l'instant
    cb(null, true);
  }
});

// Route publique pour les demandes de soumission (sans authentification)
router.post('/submission-requests', upload.array('documents', 5), async (req, res) => {
  try {
    console.log('[SUBMISSION] New submission request received');
    console.log('[SUBMISSION] Body:', req.body);
    console.log('[SUBMISSION] Files:', req.files ? req.files.length : 0);

    const { entreprise, email, telephone, projet, description } = req.body;
    
    // Validation des champs requis
    if (!entreprise || !email || !projet || !description) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs requis doivent être remplis'
      });
    }

    // Préparer les documents uploadés
    const documents = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    console.log('[SUBMISSION] Documents:', documents.length);

    // Créer la demande
    const request = new SubmissionRequest({
      entreprise,
      email,
      telephone,
      projet,
      description,
      documents,
      status: 'NEW',
      source: 'LANDING_PAGE'
    });

    await request.save();
    console.log('[SUBMISSION] Request saved:', request._id);

    // Créer automatiquement une WorkflowInstance pour l'approbation
    try {
      console.log('[SUBMISSION] Starting workflow creation...');
      
      // Chercher un workflow d'approbation pour les soumissions
      let workflow = await ApprovalWorkflow.findOne({
        applicableType: 'FORM_SUBMISSION',
        status: 'ACTIVE'
      });

      console.log('[SUBMISSION] Existing workflow found:', workflow ? workflow._id : 'NONE');

      // Si aucun workflow n'existe, en créer un par défaut
      if (!workflow) {
        console.log('[SUBMISSION] No active workflow found, creating default workflow');
        
        // Trouver un utilisateur admin pour assigner
        const adminUser = await User.findOne({ role: 'admin' });
        console.log('[SUBMISSION] Admin user found:', adminUser ? adminUser._id : 'NONE');
        
        workflow = new ApprovalWorkflow({
          name: 'Validation de Soumission Standard',
          description: 'Workflow automatique pour valider les soumissions de projets',
          applicableType: 'FORM_SUBMISSION',
          status: 'ACTIVE',
          createdBy: adminUser ? adminUser._id : null,
          steps: [
            {
              order: 1,
              name: 'Révision Initiale',
              description: 'Vérification des informations de base',
              approvers: {
                type: 'ROLE',
                role: 'admin',
                users: adminUser ? [adminUser._id] : []
              },
              requiresAllApprovers: false,
              allowDelegation: true,
              slaHours: 48,
              allowedActions: ['APPROVE', 'REJECT', 'REQUEST_CHANGES']
            },
            {
              order: 2,
              name: 'Validation Finale',
              description: 'Approbation finale du projet',
              approvers: {
                type: 'ROLE',
                role: 'admin',
                users: adminUser ? [adminUser._id] : []
              },
              requiresAllApprovers: false,
              allowDelegation: false,
              slaHours: 24,
              allowedActions: ['APPROVE', 'REJECT']
            }
          ]
        });

        await workflow.save();
        console.log('[SUBMISSION] Default workflow created:', workflow._id);
      } else {
        console.log('[SUBMISSION] Using existing workflow:', workflow._id);
      }

      // Créer une instance de workflow
      console.log('[SUBMISSION] Creating workflow instance...');
      const workflowInstance = new WorkflowInstance({
        workflow: workflow._id,
        entityType: 'SUBMISSION_REQUEST',
        entityId: request._id,
        initiatedBy: null, // Pas d'utilisateur pour une soumission publique
        currentStep: 0,
        status: 'IN_PROGRESS',
        sla: {
          expectedCompletionAt: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 heures
        }
      });

      // Ajouter la première étape à l'historique
      if (workflow.steps && workflow.steps.length > 0) {
        const firstStep = workflow.steps[0];
        console.log('[SUBMISSION] Adding first step to history:', firstStep.name);
        workflowInstance.stepHistory.push({
          stepOrder: firstStep.order,
          stepName: firstStep.name,
          assignedTo: firstStep.approvers.users || [],
          startedAt: new Date()
        });
      }

      console.log('[SUBMISSION] Saving workflow instance...');
      await workflowInstance.save();
      console.log('[SUBMISSION] ✅ Workflow instance created:', workflowInstance._id);

      // Lier le workflow à la demande
      console.log('[SUBMISSION] Linking workflow to submission...');
      request.workflowInstance = workflowInstance._id;
      await request.save();
      console.log('[SUBMISSION] ✅ Workflow linked to submission');

    } catch (workflowError) {
      console.error('[SUBMISSION] ❌ ERROR creating workflow:');
      console.error('[SUBMISSION] Error name:', workflowError.name);
      console.error('[SUBMISSION] Error message:', workflowError.message);
      console.error('[SUBMISSION] Error stack:', workflowError.stack);
      // Ne pas bloquer la soumission si la création du workflow échoue
    }

    res.json({
      success: true,
      message: 'Votre demande a été envoyée avec succès! Nous vous contacterons bientôt.',
      data: {
        id: request._id,
        entreprise: request.entreprise,
        documentsCount: documents.length
      }
    });
  } catch (error) {
    console.error('[SUBMISSION] Error creating submission request:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la demande',
      error: error.message
    });
  }
});

// Route pour obtenir toutes les demandes (accessible sans authentification)
router.get('/submission-requests', async (req, res) => {
  try {
    const requests = await SubmissionRequest.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching submission requests:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes',
      error: error.message
    });
  }
});

module.exports = router;


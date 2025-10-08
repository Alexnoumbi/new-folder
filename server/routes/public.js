const express = require('express');
const router = express.Router();
const SubmissionRequest = require('../models/SubmissionRequest');

// Route publique pour les demandes de soumission (sans authentification)
router.post('/submission-requests', async (req, res) => {
  try {
    const { entreprise, email, telephone, projet, description } = req.body;
    
    // Validation des champs requis
    if (!entreprise || !email || !projet || !description) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs requis doivent être remplis'
      });
    }

    // Créer la demande
    const request = new SubmissionRequest({
      entreprise,
      email,
      telephone,
      projet,
      description,
      status: 'NEW',
      source: 'LANDING_PAGE'
    });

    await request.save();

    // TODO: Envoyer email de notification à l'admin
    // const nodemailer = require('nodemailer');
    // Configurer et envoyer email

    res.json({
      success: true,
      message: 'Votre demande a été envoyée avec succès! Nous vous contacterons bientôt.',
      data: {
        id: request._id,
        entreprise: request.entreprise
      }
    });
  } catch (error) {
    console.error('Error creating submission request:', error);
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


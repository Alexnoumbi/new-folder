const Entreprise = require('../models/Entreprise');
const User = require('../models/User');
const KPI = require('../models/KPI');
const Document = require('../models/Document');
const Visit = require('../models/Visit');
const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');

// @desc    Obtenir toutes les entreprises
// @route   GET /api/entreprises
// @access  Private
const getEntreprises = async (req, res) => {
  try {
    const entreprises = await Entreprise.find();
    res.json(entreprises);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entreprises',
      error: error.message
    });
  }
};

// @desc    Obtenir une entreprise par ID
// @route   GET /api/entreprises/:id
// @access  Private
const getEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprise.findById(req.params.id);
    if (!entreprise) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    res.json(entreprise);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'entreprise',
      error: error.message
    });
  }
};

// @desc    Créer une entreprise
// @route   POST /api/entreprises
// @access  Private/Admin
const createEntreprise = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const body = req.body || {};

    // Build identification object (support nested identification or top-level fields)
    const identificationFields = ['nomEntreprise','raisonSociale','region','ville','dateCreation','secteurActivite','sousSecteur','filiereProduction','formeJuridique','numeroContribuable'];
    const identification = {};
    if (body.identification && typeof body.identification === 'object') {
      identificationFields.forEach(f => {
        if (body.identification[f] !== undefined) identification[f] = body.identification[f];
      });
    } else {
      identificationFields.forEach(f => {
        if (body[f] !== undefined) identification[f] = body[f];
      });
    }

    const entrepriseData = {
      identification,
      performanceEconomique: body.performanceEconomique || {
        chiffreAffaires: (body.chiffreAffaires || body['chiffreAffaires']) || undefined,
        evolutionCA: undefined,
        coutsProduction: undefined
      },
      investissementEmploi: body.investissementEmploi || undefined,
      innovationDigitalisation: body.innovationDigitalisation || undefined,
      conventions: body.conventions || undefined,
      contact: body.contact || (body.telephone || body.email || body.siteWeb ? {
        telephone: body.telephone || null,
        email: body.email || undefined,
        siteWeb: body.siteWeb || undefined,
        adresse: body.adresse || undefined
      } : undefined),
      description: body.description || undefined,
      documents: Array.isArray(body.documents) ? body.documents.map(d => ({
        originalName: d.originalName || d.nom || d.filename || null,
        filename: d.filename || null,
        path: d.path || null,
        mimeType: d.mimeType || d.mimetype || null,
        size: d.size || null,
        uploadedAt: d.uploadedAt || new Date(),
        type: d.type || 'autre',
        nom: d.nom || d.originalName || null
      })) : []
    };

    const entreprise = await Entreprise.create(entrepriseData);

    res.status(201).json({
      success: true,
      entreprise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'entreprise',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une entreprise
// @route   PUT /api/entreprises/:id
// @access  Private
const updateEntreprise = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Build nested update object only with provided fields
    const body = req.body || {};
    const updateData = {};

    // Identification
    const identificationFields = ['nomEntreprise','raisonSociale','region','ville','dateCreation','secteurActivite','sousSecteur','filiereProduction','formeJuridique','numeroContribuable'];
    identificationFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[`identification.${field}`] = body[field];
      }
    });

    // Performance Economique
    if (body.performanceEconomique) {
      // nested structure allowed
      Object.keys(body.performanceEconomique).forEach(key => {
        const val = body.performanceEconomique[key];
        updateData[`performanceEconomique.${key}`] = val;
      });
    } else {
      // allow flat CA fields
      if (body['chiffreAffaires.montant'] !== undefined) updateData['performanceEconomique.chiffreAffaires.montant'] = body['chiffreAffaires.montant'];
    }

    // Investissement et Emploi
    if (body.investissementEmploi) {
      Object.keys(body.investissementEmploi).forEach(key => {
        updateData[`investissementEmploi.${key}`] = body.investissementEmploi[key];
      });
    } else {
      const invFields = ['effectifsEmployes','nouveauxEmploisCrees','nouveauxInvestissementsRealises','typesInvestissements'];
      invFields.forEach(field => {
        if (body[field] !== undefined) updateData[`investissementEmploi.${field}`] = body[field];
      });
    }

    // Innovation et Digitalisation
    if (body.innovationDigitalisation) {
      Object.keys(body.innovationDigitalisation).forEach(key => {
        updateData[`innovationDigitalisation.${key}`] = body.innovationDigitalisation[key];
      });
    }

    // Conventions
    if (body.conventions) {
      Object.keys(body.conventions).forEach(key => {
        // support nested objects like respectDelaisReporting.conforme
        if (typeof body.conventions[key] === 'object' && !Array.isArray(body.conventions[key])) {
          Object.keys(body.conventions[key]).forEach(k2 => {
            updateData[`conventions.${key}.${k2}`] = body.conventions[key][k2];
          });
        } else {
          updateData[`conventions.${key}`] = body.conventions[key];
        }
      });
    }

    // Contact
    if (body.contact) {
      Object.keys(body.contact).forEach(key => {
        if (typeof body.contact[key] === 'object' && !Array.isArray(body.contact[key])) {
          Object.keys(body.contact[key]).forEach(k2 => {
            updateData[`contact.${key}.${k2}`] = body.contact[key][k2];
          });
        } else {
          updateData[`contact.${key}`] = body.contact[key];
        }
      });
    } else {
      const contactFields = ['telephone','email','siteWeb'];
      contactFields.forEach(field => {
        if (body[field] !== undefined) updateData[`contact.${field}`] = body[field];
      });
    }

    // Description
    if (body.description !== undefined) updateData.description = body.description;

    // Documents (replace whole documents array if provided)
    if (body.documents !== undefined) {
      updateData.documents = Array.isArray(body.documents)
        ? body.documents.map(d => ({
            originalName: d.originalName || d.nom || d.filename || null,
            filename: d.filename || null,
            path: d.path || null,
            mimeType: d.mimeType || d.mimetype || null,
            size: d.size || null,
            uploadedAt: d.uploadedAt || new Date(),
            type: d.type || 'autre',
            nom: d.nom || d.originalName || null
          }))
        : body.documents;
    }

    // Update modification date
    updateData.dateModification = new Date();

    // Apply update
    const entreprise = await Entreprise.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!entreprise) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    res.json({
      success: true,
      entreprise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'entreprise',
      error: error.message
    });
  }
};

// @desc    Supprimer une entreprise
// @route   DELETE /api/entreprises/:id
// @access  Private/Admin
const deleteEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprise.findByIdAndDelete(req.params.id);

    if (!entreprise) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Entreprise supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'entreprise',
      error: error.message
    });
  }
};

// @desc    Obtenir les statistiques du tableau de bord entreprise
// @route   GET /api/entreprise/stats
// @access  Public (sans authentification)
const getEntrepriseStats = async (req, res) => {
  try {
    // Retourner des statistiques par défaut pour tous les utilisateurs
    res.status(200).json({
      success: true,
      data: {
        scoreGlobal: 85,
        kpiValides: 12,
        totalKpis: 15,
        documentsRequis: 8,
        documentsSoumis: 6,
        visitesPlanifiees: 3,
        visitesTerminees: 7,
        statutConformite: 'green',
        activiteRecente: [
          {
            id: '1',
            type: 'KPI',
            description: 'Nouveau KPI validé',
            timestamp: new Date().toISOString(),
            user: 'Système'
          }
        ],
        evolutionKpis: [
          {
            date: '2024-01',
            score: 80
          },
          {
            date: '2024-02',
            score: 85
          }
        ]
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// @desc    Obtenir les informations de l'entreprise de l'utilisateur connecté
// @route   GET /api/entreprise/me
// @access  Public (sans authentification)
const getEntrepriseInfo = async (req, res) => {
  try {
    // Retourner des informations par défaut
    res.status(200).json({
      success: true,
      data: {
        nom: 'Entreprise Demo',
        secteur: 'Technologie',
        statut: 'Actif'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations entreprise:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations'
    });
  }
};

module.exports = {
  getEntreprises,
  getEntreprise,
  createEntreprise,
  updateEntreprise,
  deleteEntreprise,
  getEntrepriseStats,
  getEntrepriseInfo
};

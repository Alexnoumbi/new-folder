const Entreprise = require('../models/Entreprise');
const User = require('../models/User');
const KPI = require('../models/KPI');
const Document = require('../models/Document');
const Visit = require('../models/Visit');
const AuditLog = require('../models/AuditLog');
const Control = require('../models/Control');
const Message = require('../models/Message');
const Report = require('../models/Report');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { logAudit } = require('../utils/auditLogger');

// @desc    Obtenir toutes les entreprises
// @route   GET /api/entreprises
// @access  Private
const getEntreprises = async (req, res) => {
  try {
    const entreprises = await Entreprise.find();
    
    // Nettoyer les données pour éviter les objets imbriqués problématiques
    const cleanedEntreprises = entreprises.map(ent => {
      const entObj = ent.toObject();
      
      // S'assurer que conformite est une chaîne
      if (entObj.conformite && typeof entObj.conformite === 'object') {
        entObj.conformite = entObj.conformite.conformite || 'Non vérifié';
      }
      
      // S'assurer que commentaireConformite est une chaîne
      if (entObj.commentaireConformite && typeof entObj.commentaireConformite === 'object') {
        entObj.commentaireConformite = entObj.commentaireConformite.commentaireConformite || '';
      }
      
      return entObj;
    });
    
    res.json(cleanedEntreprises);
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
    
    // Convertir en objet simple et nettoyer les champs problématiques
    const entrepriseObj = entreprise.toObject();
    
    // S'assurer que conformite est une chaîne
    if (entrepriseObj.conformite && typeof entrepriseObj.conformite === 'object') {
      entrepriseObj.conformite = entrepriseObj.conformite.conformite || 'Non vérifié';
    }
    
    // S'assurer que commentaireConformite est une chaîne
    if (entrepriseObj.commentaireConformite && typeof entrepriseObj.commentaireConformite === 'object') {
      entrepriseObj.commentaireConformite = entrepriseObj.commentaireConformite.commentaireConformite || '';
    }
    
    res.json(entrepriseObj);
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

    const body = req.body || {};
    const updateData = {};

    // Fonction helper pour gérer les nested updates
    const processNestedObject = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          // Récursion pour les objets imbriqués
          processNestedObject(value, fullKey);
        } else {
          // Valeur finale
          updateData[fullKey] = value;
        }
      });
    };

    // Traiter tous les champs principaux
    const mainFields = [
      'identification',
      'performanceEconomique', 
      'investissementEmploi',
      'innovationDigitalisation',
      'conventions',
      'contact',
      'description',
      'statut',
      'informationsCompletes',
      'dateCreation'
    ];

    mainFields.forEach(field => {
      if (body[field] !== undefined) {
        if (typeof body[field] === 'object' && !Array.isArray(body[field]) && body[field] !== null) {
          processNestedObject(body[field], field);
        } else {
          updateData[field] = body[field];
        }
      }
    });

    // Traiter les champs plats d'identification qui pourraient être envoyés directement
    const identificationFields = ['nomEntreprise','raisonSociale','region','ville','dateCreation','secteurActivite','sousSecteur','filiereProduction','formeJuridique','numeroContribuable'];
    identificationFields.forEach(field => {
      if (body[field] !== undefined && !body.identification) {
        updateData[`identification.${field}`] = body[field];
      }
    });

    // Traiter les champs de contact plats
    const contactFields = ['telephone','email','siteWeb'];
    contactFields.forEach(field => {
      if (body[field] !== undefined && !body.contact) {
        updateData[`contact.${field}`] = body[field];
      }
    });

    // Documents (remplacer tout le tableau si fourni)
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

    // Mettre à jour la date de modification
    updateData.dateModification = new Date();

    console.log('Update data being sent to DB:', JSON.stringify(updateData, null, 2));

    // Appliquer la mise à jour
    const entreprise = await Entreprise.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!entreprise) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    console.log('Entreprise updated successfully:', entreprise._id);

    res.json({
      success: true,
      data: entreprise,
      entreprise
    });
  } catch (error) {
    console.error('Error updating entreprise:', error);
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

// @desc    Obtenir les statistiques de l'entreprise
// @route   GET /api/entreprises/stats
// @access  Private
const getEntrepriseStats = async (req, res) => {
  try {
    // Récupérer l'email des headers ou query params
    const email = req.headers['x-user-email'] || req.query.email || req.body.email;
    if (!email) {
      return res.status(401).json({ message: 'Email requis' });
    }

    // Trouver l'utilisateur et son entreprise
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const entrepriseId = user.entrepriseId || user.entreprise;
    const entreprise = await Entreprise.findById(entrepriseId);

    // Récupérer les statistiques
    const documents = await Document.find({ entrepriseId });
    const documentsRequis = await Document.countDocuments({
      entrepriseId,
      required: true
    });
    const documentsSoumis = documents.length;

    const visitesPlanifiees = await Visit.countDocuments({
      entrepriseId,
      status: 'planned'
    });
    const visitesTerminees = await Visit.countDocuments({
      entrepriseId,
      status: 'completed'
    });

    const kpis = await KPI.find({ entrepriseId });
    const kpiValides = kpis.filter(kpi => kpi.status === 'valid').length;
    const totalKpis = kpis.length;
    const scoreGlobal = Math.round((kpiValides / totalKpis) * 100) || 0;

    let statutConformite = 'yellow';
    if (scoreGlobal >= 80 && documentsSoumis >= documentsRequis * 0.9) {
      statutConformite = 'green';
    } else if (scoreGlobal < 50 || documentsSoumis < documentsRequis * 0.6) {
      statutConformite = 'red';
    }

    // Évolution des KPIs
    const evolutionKpis = await KPI.aggregate([
      { $match: { entrepriseId } },
      { $sort: { date: 1 } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
        score: { $avg: "$score" }
      }},
      { $project: {
        _id: 0,
        date: "$_id",
        score: 1
      }},
      { $sort: { date: 1 } }
    ]);

    const stats = {
      scoreGlobal,
      kpiValides,
      totalKpis,
      documentsRequis,
      documentsSoumis,
      visitesPlanifiees,
      visitesTerminees,
      statutConformite,
      evolutionKpis,
      entrepriseId
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur getEntrepriseStats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les informations de l'entreprise
const getEntrepriseInfo = async (req, res) => {
  try {
    const email = req.headers['x-user-email'] || req.query.email || req.body.email;
    if (!email) {
      return res.status(401).json({ message: 'Email requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const entrepriseId = user.entrepriseId || user.entreprise;
    const entreprise = await Entreprise.findById(entrepriseId);
    if (!entreprise) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    res.json(entreprise);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour le profil de l'entreprise
const updateEntrepriseProfile = async (req, res) => {
  try {
    const entreprise = await Entreprise.findByIdAndUpdate(
      req.user.entrepriseId,
      { $set: req.body },
      { new: true }
    );
    if (!entreprise) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }
    res.json(entreprise);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
  }
};

// Obtenir les documents de l'entreprise
const getEntrepriseDocuments = async (req, res) => {
  try {
    const entrepriseId = req.params.id || req.user?.entrepriseId;
    const documents = await Document.find({ entrepriseId });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des documents" });
  }
};

// Obtenir les contrôles de l'entreprise
const getEntrepriseControls = async (req, res) => {
  try {
    const entrepriseId = req.params.id || req.user?.entrepriseId;
    const controls = await Control.find({ entrepriseId });
    res.json(controls);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des contrôles" });
  }
};

// Obtenir les affiliations de l'entreprise
const getEntrepriseAffiliations = async (req, res) => {
  try {
    // Pour l’instant, on renvoie une liste réduite de toutes les entreprises comme "affiliations"
    // Projection minimale pour la page: id, partnerName, type, status, score, startDate, endDate, description
    const entreprises = await Entreprise.find({}, {
      _id: 1,
      'identification.nomEntreprise': 1,
      'identification.secteurActivite': 1,
      statut: 1,
      createdAt: 1,
      updatedAt: 1,
      description: 1
    }).lean();

    const affiliations = entreprises.map(e => ({
      id: e._id?.toString(),
      partnerName: e.identification?.nomEntreprise || 'Entreprise',
      type: e.identification?.secteurActivite || 'Tertiaire',
      status: (e.statut || 'En attente').toString().toLowerCase() // active | pending | inactive
        .replace('en attente','pending')
        .replace('actif','active')
        .replace('inactif','inactive')
        .replace('suspendu','inactive'),
      score:  Math.min(100, Math.max(0, Math.round(Math.random()*20 + 70))), // score factice 70-90 si pas de champ
      startDate: e.createdAt || new Date(),
      endDate: null,
      description: e.description || ''
    }));

    res.json(affiliations);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des affiliations" });
  }
};

// Obtenir l'historique des KPIs de l'entreprise
const getEntrepriseKPIHistory = async (req, res) => {
  try {
    const entrepriseId = req.params.id || req.user?.entrepriseId;
    if (!entrepriseId) {
      return res.status(400).json({ message: "Identifiant d'entreprise manquant" });
    }

    // 1) Lire directement les documents KPI de la collection
    const kpis = await KPI.find({ enterprise: entrepriseId }).lean();

    // 2) Construire des points temps à partir de l'historique et fallback currentValue
    const rawPoints = [];
    for (const kpi of kpis) {
      const history = Array.isArray(kpi.history) ? kpi.history : [];

      if (history.length > 0) {
        for (const h of history) {
          if (h && typeof h.value === 'number') {
            // Optionnel: garder uniquement validés si status présent
            if (!h.status || h.status === 'validated') {
              rawPoints.push({
                date: new Date(h.submittedAt || kpi.updatedAt || kpi.createdAt || Date.now()),
                value: h.value
              });
            }
          }
        }
      } else if (typeof kpi.currentValue === 'number') {
        // Fallback si pas d'historique: utiliser currentValue avec la date du KPI
        rawPoints.push({
          date: new Date(kpi.updatedAt || kpi.createdAt || Date.now()),
          value: kpi.currentValue
        });
      }

      // Fallback additionnel si certains schémas utilisent score/date (legacy)
      if (typeof kpi.score === 'number' && kpi.date) {
        rawPoints.push({ date: new Date(kpi.date), value: kpi.score });
      }
    }

    if (rawPoints.length === 0) {
      return res.json([]);
    }

    // 3) Agréger par mois et calculer la moyenne
    const bucket = new Map(); // key: YYYY-MM -> { sum, count }
    for (const p of rawPoints) {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = bucket.get(key) || { sum: 0, count: 0, year: d.getFullYear(), month: d.getMonth() + 1 };
      entry.sum += p.value;
      entry.count += 1;
      bucket.set(key, entry);
    }

    const result = Array.from(bucket.values())
      .map(b => ({
        date: new Date(b.year, b.month - 1, 1),
        value: Math.round((b.sum / b.count) * 100) / 100
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return res.json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des KPIs:", error);
    res.status(500).json({ message: "Erreur lors de la récupération de l'historique des KPIs" });
  }
};

// Obtenir les messages de l'entreprise
const getEntrepriseMessages = async (req, res) => {
  try {
    const entrepriseId = req.params.id || req.user?.entrepriseId;
    const messages = await Message.find({
        $or: [
            { sender: entrepriseId },
            { recipient: entrepriseId }
        ]
    }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des messages" });
  }
};

// Obtenir les rapports de l'entreprise
const getEntrepriseReports = async (req, res) => {
  try {
    const entrepriseId = req.params.id || req.user?.entrepriseId;
    const reports = await Report.find({ entrepriseId })
        .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des rapports" });
  }
};

// Obtenir les statistiques globales des entreprises (pour admin)
const getGlobalStats = async (req, res) => {
  try {
    const total = await Entreprise.countDocuments();
    const actives = await Entreprise.countDocuments({ statut: 'Actif' });
    const enAttente = await Entreprise.countDocuments({ statut: 'En attente' });
    const suspendues = await Entreprise.countDocuments({ statut: 'Suspendu' });
    const inactives = await Entreprise.countDocuments({ statut: 'Inactif' });
    const completes = await Entreprise.countDocuments({ informationsCompletes: true });

    // Statistiques par région
    const parRegion = await Entreprise.aggregate([
      { $group: { _id: '$identification.region', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Statistiques par secteur
    const parSecteur = await Entreprise.aggregate([
      { $group: { _id: '$identification.secteurActivite', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Total employés
    const totalEmployes = await Entreprise.aggregate([
      { $group: { _id: null, total: { $sum: '$investissementEmploi.effectifsEmployes' } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        actives,
        enAttente,
        suspendues,
        inactives,
        completes,
        totalEmployes: totalEmployes[0]?.total || 0,
        parRegion,
        parSecteur
      }
    });
  } catch (error) {
    console.error('Error in getGlobalStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Obtenir uniquement les entreprises agréées/actives
const getEntreprisesAgrees = async (req, res) => {
  try {
    const entreprises = await Entreprise.find({ 
      statut: { $in: ['Actif', 'AGREE', 'VALIDE', 'ACTIVE'] } 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: entreprises
    });
  } catch (error) {
    console.error('Error in getEntreprisesAgrees:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des entreprises agréées',
      error: error.message
    });
  }
};

// Mettre à jour le statut d'une entreprise
const updateEntrepriseStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    console.log('UpdateEntrepriseStatut - ID:', id, 'New Status:', statut);

    if (!['Actif', 'En attente', 'Suspendu', 'Inactif'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Valeurs acceptées: Actif, En attente, Suspendu, Inactif'
      });
    }

    // Récupérer l'ancien statut avant la mise à jour
    const oldEntreprise = await Entreprise.findById(id);
    
    if (!oldEntreprise) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    const oldStatut = oldEntreprise.statut;

    // Mettre à jour le statut
    const entreprise = await Entreprise.findByIdAndUpdate(
      id,
      { statut, dateModification: new Date() },
      { new: true }
    );

    console.log('Entreprise updated successfully:', entreprise._id);

    // Log audit (non-bloquant)
    try {
      await AuditLog.create({
        userId: req.user?._id || null,
        action: 'UPDATE_ENTREPRISE_STATUT',
        entityType: 'ENTERPRISE',
        entityId: id,
        details: { oldStatut, newStatut: statut },
        ipAddress: req.ip
      });
      console.log('Audit log created');
    } catch (auditError) {
      console.error('Error creating audit log (non-critical):', auditError.message);
      // Continue même si l'audit log échoue
    }

    res.json({
      success: true,
      data: entreprise,
      message: `Statut changé de "${oldStatut || 'N/A'}" à "${statut}"`
    });
  } catch (error) {
    console.error('Error in updateEntrepriseStatut:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    });
  }
};

// Obtenir l'évolution des entreprises dans le temps
const getEntreprisesEvolution = async (req, res) => {
  try {
    const { start } = req.query;
    let matchStage = {};

    if (start) {
      const [year, month] = start.split('-').map(Number);
      matchStage = {
        createdAt: { $gte: new Date(year, month - 1, 1) }
      };
    }

    const evolution = await Entreprise.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
                ]
              }
            ]
          },
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: evolution
    });
  } catch (error) {
    console.error('Error in getEntreprisesEvolution:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'évolution',
      error: error.message
    });
  }
};

// Obtenir toutes les informations détaillées d'une entreprise (pour admin)
const getEntrepriseComplete = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting complete data for enterprise:', id);

    // Get enterprise details
    const entreprise = await Entreprise.findById(id);
    if (!entreprise) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    // Get all related data in parallel
    // Note: Different models use different field names (enterprise, entrepriseId, enterpriseId)
    const [documents, reports, kpis, messages, visits, controls] = await Promise.all([
      Document.find({ enterpriseId: id }).sort({ createdAt: -1 }).limit(50),
      Report.find({}).sort({ createdAt: -1 }).limit(50), // Report model doesn't have enterprise field
      KPI.find({ enterprise: id }).sort({ createdAt: -1 }).limit(50), // KPI uses 'enterprise'
      Message.find({ entrepriseId: id })
        .populate('sender', 'nom prenom email role')
        .populate('recipient', 'nom prenom email role')
        .sort({ createdAt: -1 })
        .limit(100),
      Visit.find({ enterpriseId: id }).sort({ scheduledAt: -1 }).limit(50),
      Control.find({ entrepriseId: id }).sort({ createdAt: -1 }).limit(50)
    ]);
    
    console.log('Found data for enterprise', id, ':', {
      documents: documents.length,
      reports: reports.length,
      kpis: kpis.length,
      messages: messages.length,
      visits: visits.length,
      controls: controls.length
    });

    // Calculate statistics
    const stats = {
      documents: {
        total: documents.length,
        byStatus: documents.reduce((acc, doc) => {
          acc[doc.status || 'unknown'] = (acc[doc.status || 'unknown'] || 0) + 1;
          return acc;
        }, {})
      },
      reports: {
        total: reports.length,
        byStatus: reports.reduce((acc, rep) => {
          acc[rep.status || 'unknown'] = (acc[rep.status || 'unknown'] || 0) + 1;
          return acc;
        }, {})
      },
      kpis: {
        total: kpis.length,
        averageScore: kpis.length > 0 
          ? (kpis.reduce((sum, kpi) => sum + (kpi.score || 0), 0) / kpis.length).toFixed(2)
          : 0
      },
      messages: {
        total: messages.length,
        unread: messages.filter(m => !m.read).length
      },
      visits: {
        total: visits.length,
        byStatus: visits.reduce((acc, visit) => {
          acc[visit.status || 'unknown'] = (acc[visit.status || 'unknown'] || 0) + 1;
          return acc;
        }, {})
      },
      controls: {
        total: controls.length
      }
    };

    res.json({
      success: true,
      data: {
        entreprise,
        documents,
        reports,
        kpis,
        messages,
        visits,
        controls,
        stats
      }
    });
  } catch (error) {
    console.error('Error in getEntrepriseComplete:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données complètes',
      error: error.message
    });
  }
};

// Mettre à jour le statut de conformité d'une entreprise (pour admin uniquement)
const updateEntrepriseConformite = async (req, res) => {
  try {
    const { id } = req.params;
    const { conformite, commentaireConformite } = req.body;

    console.log('UpdateEntrepriseConformite - ID:', id, 'Conformité:', conformite);

    if (!['Conforme', 'Non conforme', 'En cours de vérification', 'Non vérifié'].includes(conformite)) {
      return res.status(400).json({
        success: false,
        message: 'Statut de conformité invalide'
      });
    }

    const entreprise = await Entreprise.findByIdAndUpdate(
      id,
      { 
        conformite, 
        commentaireConformite,
        derniereVerificationConformite: new Date(),
        verifiePar: req.user?._id || null,
        dateModification: new Date()
      },
      { new: true }
    );

    if (!entreprise) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    console.log('Conformité mise à jour avec succès:', entreprise._id);

    // Log audit (non-bloquant)
    try {
      await AuditLog.create({
        userId: req.user?._id || null,
        action: 'UPDATE_ENTREPRISE_CONFORMITE',
        entityType: 'ENTERPRISE',
        entityId: id,
        details: { conformite, commentaireConformite },
        ipAddress: req.ip
      });
    } catch (auditError) {
      console.error('Error creating audit log (non-critical):', auditError.message);
    }

    res.json({
      success: true,
      data: entreprise,
      message: `Conformité changée en "${conformite}"`
    });
  } catch (error) {
    console.error('Error in updateEntrepriseConformite:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la conformité',
      error: error.message
    });
  }
};

// Obtenir l'évolution temporelle d'une entreprise
const getEntrepriseEvolutionData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting evolution data for enterprise:', id);

    // Récupérer l'entreprise actuelle
    const entreprise = await Entreprise.findById(id);
    if (!entreprise) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }

    // Récupérer toutes les visites avec snapshots
    const visits = await Visit.find({ 
      enterpriseId: id,
      'report.enterpriseSnapshot': { $exists: true }
    })
      .sort({ scheduledAt: 1 })
      .select('scheduledAt report.enterpriseSnapshot report.submittedAt type');

    // Construire l'évolution du personnel
    const personnelEvolution = visits.map(visit => ({
      date: visit.report?.submittedAt || visit.scheduledAt,
      effectifs: visit.report?.enterpriseSnapshot?.investissementEmploi?.effectifsEmployes || 0,
      nouveauxEmplois: visit.report?.enterpriseSnapshot?.investissementEmploi?.nouveauxEmploisCrees || 0
    }));

    // Ajouter les données actuelles
    personnelEvolution.push({
      date: new Date(),
      effectifs: entreprise.investissementEmploi?.effectifsEmployes || 0,
      nouveauxEmplois: entreprise.investissementEmploi?.nouveauxEmploisCrees || 0
    });

    // Construire l'évolution financière
    const financierEvolution = visits.map(visit => ({
      date: visit.report?.submittedAt || visit.scheduledAt,
      ca: visit.report?.enterpriseSnapshot?.performanceEconomique?.chiffreAffaires?.montant || 0,
      couts: visit.report?.enterpriseSnapshot?.performanceEconomique?.coutsProduction?.montant || 0,
      devise: visit.report?.enterpriseSnapshot?.performanceEconomique?.chiffreAffaires?.devise || 'FCFA'
    }));

    // Ajouter les données actuelles
    financierEvolution.push({
      date: new Date(),
      ca: entreprise.performanceEconomique?.chiffreAffaires?.montant || 0,
      couts: entreprise.performanceEconomique?.coutsProduction?.montant || 0,
      devise: entreprise.performanceEconomique?.chiffreAffaires?.devise || 'FCFA'
    });

    res.json({
      success: true,
      data: {
        personnel: personnelEvolution,
        financier: financierEvolution,
        currentData: {
          effectifs: entreprise.investissementEmploi?.effectifsEmployes || 0,
          ca: entreprise.performanceEconomique?.chiffreAffaires?.montant || 0,
          tresorerie: entreprise.performanceEconomique?.situationTresorerie || 'Normale',
          conformite: entreprise.conformite || 'Non vérifié'
        }
      }
    });
  } catch (error) {
    console.error('Error in getEntrepriseEvolutionData:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données d\'évolution',
      error: error.message
    });
  }
};

// Obtenir tous les snapshots historiques d'une entreprise
const getEntrepriseSnapshots = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting snapshots for enterprise:', id);

    const visits = await Visit.find({ 
      enterpriseId: id,
      'report.enterpriseSnapshot': { $exists: true }
    })
      .populate('inspectorId', 'nom prenom email')
      .populate('requestedBy', 'nom prenom email')
      .sort({ scheduledAt: -1 })
      .select('scheduledAt type status report');

    const snapshots = visits.map(visit => ({
      date: visit.report?.submittedAt || visit.scheduledAt,
      visitId: visit._id,
      visitType: visit.type,
      visitStatus: visit.status,
      snapshot: visit.report?.enterpriseSnapshot,
      inspector: visit.inspectorId,
      outcome: visit.report?.outcome
    }));

    res.json({
      success: true,
      count: snapshots.length,
      data: snapshots
    });
  } catch (error) {
    console.error('Error in getEntrepriseSnapshots:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des snapshots',
      error: error.message
    });
  }
};

// Obtenir le journal d'activité d'une entreprise
const getEntrepriseActivityLog = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    console.log('Getting activity log for enterprise:', id);

    const logs = await AuditLog.find({ 
      entityId: id,
      entityType: 'ENTERPRISE'
    })
      .populate('userId', 'nom prenom email')
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error in getEntrepriseActivityLog:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du journal d\'activité',
      error: error.message
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
  getEntrepriseInfo,
  updateEntrepriseProfile,
  getEntrepriseDocuments,
  getEntrepriseControls,
  getEntrepriseAffiliations,
  getEntrepriseKPIHistory,
  getEntrepriseMessages,
  getEntrepriseReports,
  getGlobalStats,
  getEntreprisesAgrees,
  updateEntrepriseStatut,
  getEntreprisesEvolution,
  getEntrepriseComplete,
  updateEntrepriseConformite,
  getEntrepriseEvolutionData,
  getEntrepriseSnapshots,
  getEntrepriseActivityLog
};

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
  getEntrepriseReports
};

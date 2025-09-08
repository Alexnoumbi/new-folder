const Document = require('../models/Document');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');

// @desc    Obtenir les documents d'une entreprise
// @route   GET /api/documents/company/:companyId
exports.getCompanyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ enterpriseId: req.params.companyId })
      .populate('validatedBy', 'nom prenom');
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents'
    });
  }
};

// @desc    Télécharger un document
// @route   GET /api/documents/:id
exports.getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('validatedBy', 'nom prenom');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du document'
    });
  }
};

// @desc    Uploader un document
// @route   POST /api/documents/company/:companyId/upload
exports.uploadDocument = async (req, res) => {
  try {
    const { type, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    // Upload le fichier sur S3
    const uploadResult = await uploadToS3(file);

    // Créer l'enregistrement du document
    const document = await Document.create({
      enterpriseId: req.params.companyId,
      type,
      description,
      file: {
        name: file.originalname,
        url: uploadResult.Location,
        type: file.mimetype,
        size: file.size
      },
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
      status: 'EN_ATTENTE'
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du document'
    });
  }
};

// @desc    Valider un document
// @route   PUT /api/documents/:id/validate
exports.validateDocument = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    document.status = status;
    document.validationComment = comment;
    document.validatedBy = req.user.id;
    document.validatedAt = new Date();

    await document.save();

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du document'
    });
  }
};

// @desc    Supprimer un document
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    // Supprimer le fichier de S3
    if (document.file && document.file.url) {
      await deleteFromS3(document.file.url);
    }

    await document.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document'
    });
  }
};

// @desc    Obtenir les types de documents
// @route   GET /api/documents/types
exports.getDocumentTypes = async (req, res) => {
  try {
    const types = [
      {
        id: 'CONVENTION',
        name: 'Convention',
        description: 'Documents liés aux conventions'
      },
      {
        id: 'RAPPORT',
        name: 'Rapport',
        description: 'Rapports d\'activité'
      },
      {
        id: 'LEGAL',
        name: 'Document légal',
        description: 'Documents juridiques et administratifs'
      },
      {
        id: 'FINANCIER',
        name: 'Document financier',
        description: 'Documents financiers et comptables'
      },
      {
        id: 'AUTRE',
        name: 'Autre',
        description: 'Autres types de documents'
      }
    ];

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des types de documents'
    });
  }
};

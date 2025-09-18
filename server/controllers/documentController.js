const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

// @desc    Upload un nouveau document
// @route   POST /api/documents
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier n'a été téléchargé" });
        }

        const enterpriseId = req.user?.entrepriseId;
        if (!enterpriseId) {
            return res.status(400).json({ message: "Entreprise introuvable pour l'utilisateur" });
        }

        const doc = await Document.create({
            enterpriseId,
            type: req.body.type || 'OTHER',
            required: true,
            dueDate: new Date(Date.now() + 30*24*60*60*1000),
            status: 'RECEIVED',
            files: [{
                name: req.file.originalname,
                url: req.file.path,
                uploadedAt: new Date()
            }],
            uploadedAt: new Date()
        });

        return res.status(201).json(doc);
    } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        res.status(500).json({ message: 'Erreur lors de l\'upload du document' });
    }
};

// @desc    Récupérer tous les documents
// @route   GET /api/documents
exports.getDocuments = async (req, res) => {
    try {
        const enterpriseId = req.user?.entrepriseId;
        if (!enterpriseId) {
            return res.status(400).json({ message: "Entreprise introuvable pour l'utilisateur" });
        }

        const documents = await Document.find({ enterpriseId }).sort({ createdAt: -1 });
        return res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
    }
};

// @desc    Récupérer un document spécifique
// @route   GET /api/documents/:id
exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            enterpriseId: req.user.entrepriseId
        });

        if (!document) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        return res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du document' });
    }
};

// @desc    Mettre à jour un document
// @route   PUT /api/documents/:id
exports.updateDocument = async (req, res) => {
    try {
        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, enterpriseId: req.user.entrepriseId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        return res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du document' });
    }
};

// @desc    Supprimer un document
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, enterpriseId: req.user.entrepriseId });

        if (!document) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        // Supprimer les fichiers physiques
        if (Array.isArray(document.files)) {
            for (const f of document.files) {
                if (f.url && fs.existsSync(f.url)) {
                    try { fs.unlinkSync(f.url); } catch {}
                }
            }
        }

        await document.deleteOne();
        return res.json({ message: 'Document supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du document' });
    }
};

// @desc    Télécharger un document
// @route   GET /api/documents/:id/download
exports.downloadDocument = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, enterpriseId: req.user.entrepriseId });

        if (!document) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        const first = Array.isArray(document.files) ? document.files[0] : null;
        if (!first?.url || !fs.existsSync(first.url)) {
            return res.status(404).json({ message: 'Fichier non trouvé' });
        }

        res.download(first.url, first.name || 'document');
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du téléchargement du document' });
    }
};

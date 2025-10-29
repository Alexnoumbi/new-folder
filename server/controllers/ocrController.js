const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const OCRResult = require('../models/OCRResult');

exports.extractText = async (req, res) => {
    try {
        // Vérifier si un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Aucun fichier image n'a été fourni"
            });
        }

        // Récupérer l'entrepriseId depuis le body ou req.user
        const entrepriseId = req.body.entrepriseId || req.user?.entrepriseId;
        
        if (!entrepriseId) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: "L'ID de l'entreprise est requis"
            });
        }

        // Vérifier le type MIME
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'application/pdf'];
        if (!allowedMimes.includes(req.file.mimetype)) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: "Le fichier doit être une image (JPEG, PNG, GIF, BMP, TIFF) ou un PDF"
            });
        }

        console.log('Starting OCR for file:', req.file.originalname);

        // Configuration Tesseract avec meilleure gestion
        const result = await Tesseract.recognize(
            req.file.path,
            'fra+eng', // French et English
            {
                logger: info => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('OCR Progress:', info);
                    }
                },
                errorHandler: err => {
                    console.error('Tesseract Error:', err);
                }
            }
        );

        console.log('OCR Completed. Confidence:', result.data.confidence);

        // Si le texte est vide
        if (!result.data.text || !result.data.text.trim()) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(422).json({
                success: false,
                message: "Aucun texte n'a pu être extrait de cette image. L'image est peut-être de mauvaise qualité ou ne contient pas de texte lisible."
            });
        }

        // Sauvegarder le résultat OCR dans la base de données
        const ocrResult = new OCRResult({
            fileName: req.file.originalname,
            filePath: req.file.path,
            textContent: result.data.text,
            confidence: result.data.confidence || 0,
            wordsCount: result.data.words?.length || 0,
            language: 'french', // MongoDB text index nécessite 'french' pas 'fra'
            entrepriseId: entrepriseId,
            createdBy: req.user?._id || req.user?.id || null,
            status: 'PROCESSED'
        });

        await ocrResult.save();

        console.log('OCR Result saved to database:', ocrResult._id);

        return res.json({
            success: true,
            data: ocrResult,
            text: result.data.text,
            confidence: result.data.confidence || 0,
            words: result.data.words?.length || 0,
            message: 'Document traité avec succès'
        });
    } catch (error) {
        console.error('Erreur OCR complète:', error);

        // Nettoyer le fichier en cas d'erreur
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Erreur lors de la suppression du fichier:', unlinkError);
            }
        }

        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue lors du traitement de l'image. Vérifiez que l'image est claire et contient du texte lisible.",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Obtenir tous les résultats OCR
exports.getAllOCRResults = async (req, res) => {
    try {
        const { entrepriseId } = req.query;
        
        const filter = {};
        if (entrepriseId) {
            filter.entrepriseId = entrepriseId;
        }

        const results = await OCRResult.find(filter)
            .populate('entrepriseId', 'identification.nomEntreprise nom name')
            .populate('createdBy', 'nom prenom email')
            .sort({ createdAt: -1 })
            .limit(100);

        // Transformer pour le frontend
        const formattedResults = results.map(r => ({
            ...r.toObject(),
            entreprise: {
                _id: r.entrepriseId?._id,
                nom: r.entrepriseId?.identification?.nomEntreprise || r.entrepriseId?.nom || r.entrepriseId?.name || 'Sans nom'
            }
        }));

        res.json({
            success: true,
            data: formattedResults
        });
    } catch (error) {
        console.error('Error fetching OCR results:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des résultats OCR',
            error: error.message
        });
    }
};

// Obtenir un résultat OCR spécifique
exports.getOCRResultById = async (req, res) => {
    try {
        const result = await OCRResult.findById(req.params.id)
            .populate('entrepriseId', 'identification.nomEntreprise nom name')
            .populate('createdBy', 'nom prenom email');

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Résultat OCR non trouvé'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du résultat OCR',
            error: error.message
        });
    }
};

// Mettre à jour le texte d'un résultat OCR
exports.updateOCRResult = async (req, res) => {
    try {
        const { textContent } = req.body;

        const result = await OCRResult.findById(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Résultat OCR non trouvé'
            });
        }

        result.textContent = textContent;
        result.status = 'EDITED';
        await result.save();

        res.json({
            success: true,
            data: result,
            message: 'Résultat OCR mis à jour avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du résultat OCR',
            error: error.message
        });
    }
};

// Supprimer un résultat OCR
exports.deleteOCRResult = async (req, res) => {
    try {
        const result = await OCRResult.findById(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Résultat OCR non trouvé'
            });
        }

        // Supprimer le fichier si il existe
        if (result.filePath && fs.existsSync(result.filePath)) {
            fs.unlinkSync(result.filePath);
        }

        await result.deleteOne();

        res.json({
            success: true,
            message: 'Résultat OCR supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du résultat OCR',
            error: error.message
        });
    }
};

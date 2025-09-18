const Tesseract = require('tesseract.js');
const fs = require('fs');

exports.extractText = async (req, res) => {
    try {
        // Vérifier si un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Aucun fichier image n'a été fourni"
            });
        }

        // Vérifier le type MIME
        if (!req.file.mimetype.startsWith('image/')) {
            // Supprimer le fichier si ce n'est pas une image
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Le fichier doit être une image"
            });
        }

        const result = await Tesseract.recognize(
            req.file.path,
            'fra', // French language
            {
                logger: info => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log(info);
                    }
                }
            }
        );

        // Nettoyer le fichier après traitement
        fs.unlinkSync(req.file.path);

        // Si le texte est vide
        if (!result.data.text.trim()) {
            return res.status(422).json({
                success: false,
                message: "Aucun texte n'a pu être extrait de cette image"
            });
        }

        return res.json({
            success: true,
            text: result.data.text,
            confidence: result.data.confidence,
            words: result.data.words?.length || 0
        });
    } catch (error) {
        console.error('Erreur OCR:', error);

        // Nettoyer le fichier en cas d'erreur
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Erreur lors de la suppression du fichier:', unlinkError);
            }
        }

        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue lors du traitement de l'image",
            error: error.message
        });
    }
};

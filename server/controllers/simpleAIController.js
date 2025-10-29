/**
 * Contrôleur simple pour les services IA légers
 * OCR + Questions/Réponses + Requêtes base de données
 */

const SimpleOCRService = require('../utils/simpleOCRService');
const SimpleQAService = require('../utils/simpleQAService');
const DatabaseQueryService = require('../utils/databaseQueryService');
const multer = require('multer');
const path = require('path');

class SimpleAIController {
    constructor() {
        this.ocrService = new SimpleOCRService();
        this.qaService = new SimpleQAService();
        this.dbQueryService = new DatabaseQueryService();
        
        // Configuration multer pour upload d'images
        this.upload = multer({
            dest: 'uploads/ocr/',
            fileFilter: (req, file, cb) => {
                const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff/;
                const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
                const mimetype = allowedTypes.test(file.mimetype);
                
                if (mimetype && extname) {
                    return cb(null, true);
                } else {
                    cb(new Error('Seules les images sont autorisées'));
                }
            },
            limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
        });
    }

    /**
     * Extraction de texte depuis une image (OCR)
     */
    async extractTextFromImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Aucune image fournie' });
            }

            const { documentType = 'general', language = 'fra+eng' } = req.body;
            const imagePath = req.file.path;

            console.log(`OCR demandé pour: ${imagePath}`);

            // Extraction avec analyse
            const result = await this.ocrService.extractAndAnalyze(imagePath, documentType);

            if (!result.success) {
                return res.status(500).json({ error: result.error });
            }

            res.json({
                success: true,
                filename: req.file.originalname,
                text: result.text,
                analysis: result.analysis,
                documentType: documentType,
                extractedAt: new Date()
            });

        } catch (error) {
            console.error('Erreur OCR:', error);
            res.status(500).json({ error: 'Erreur lors de l\'extraction de texte' });
        }
    }

    /**
     * Questions/Réponses simples
     */
    async askQuestion(req, res) {
        try {
            const { question, enterpriseId } = req.body;

            if (!question) {
                return res.status(400).json({ error: 'Question requise' });
            }

            console.log(`Question posée: ${question}`);

            const response = await this.qaService.processQuestion(question, enterpriseId);

            if (!response.success) {
                return res.status(500).json({ error: response.error });
            }

            res.json({
                success: true,
                question: question,
                answer: response.response,
                type: response.type,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur Q&A:', error);
            res.status(500).json({ error: 'Erreur lors du traitement de la question' });
        }
    }

    /**
     * Requête base de données en langage naturel
     */
    async queryDatabase(req, res) {
        try {
            const { query, enterpriseId } = req.body;

            if (!query) {
                return res.status(400).json({ error: 'Requête requise' });
            }

            // Validation de la requête
            const validation = this.dbQueryService.validateQuery(query);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.error });
            }

            console.log(`Requête DB: ${query}`);

            const results = await this.dbQueryService.processQuery(query, enterpriseId);

            if (!results.success) {
                return res.status(500).json({ error: results.error });
            }

            res.json({
                success: true,
                query: query,
                results: results.results,
                count: results.count,
                type: results.type,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur requête DB:', error);
            res.status(500).json({ error: 'Erreur lors de la requête' });
        }
    }

    /**
     * Suggestions de requêtes
     */
    async getSuggestions(req, res) {
        try {
            const suggestions = this.dbQueryService.getSuggestions();
            
            res.json({
                success: true,
                suggestions: suggestions,
                count: suggestions.length
            });

        } catch (error) {
            console.error('Erreur suggestions:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des suggestions' });
        }
    }

    /**
     * Traitement par lot d'images OCR
     */
    async processBatchOCR(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Aucune image fournie' });
            }

            const { documentType = 'general' } = req.body;
            const imagePaths = req.files.map(file => file.path);

            console.log(`OCR par lot demandé pour ${imagePaths.length} images`);

            const results = await this.ocrService.processBatch(imagePaths, documentType);

            res.json({
                success: true,
                totalFiles: imagePaths.length,
                results: results,
                processedAt: new Date()
            });

        } catch (error) {
            console.error('Erreur OCR par lot:', error);
            res.status(500).json({ error: 'Erreur lors du traitement par lot' });
        }
    }

    /**
     * Analyse rapide d'un document
     */
    async quickAnalyze(req, res) {
        try {
            const { text, type = 'general' } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Texte requis' });
            }

            // Analyse rapide du texte
            const analysis = this.ocrService.analyzeContent(text, type);

            res.json({
                success: true,
                text: text,
                analysis: analysis,
                type: type,
                analyzedAt: new Date()
            });

        } catch (error) {
            console.error('Erreur analyse rapide:', error);
            res.status(500).json({ error: 'Erreur lors de l\'analyse' });
        }
    }

    /**
     * Statut des services IA
     */
    async getStatus(req, res) {
        try {
            const status = {
                ocr: {
                    available: true,
                    languages: this.ocrService.supportedLanguages,
                    service: 'Tesseract.js'
                },
                qa: {
                    available: true,
                    patterns: Object.keys(this.qaService.questionPatterns),
                    service: 'Rule-based'
                },
                database: {
                    available: true,
                    queryTypes: Object.keys(this.dbQueryService.queryPatterns),
                    service: 'MongoDB queries'
                }
            };

            res.json({
                success: true,
                status: status,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Erreur statut:', error);
            res.status(500).json({ error: 'Erreur lors de la vérification du statut' });
        }
    }

    /**
     * Middleware pour upload d'image unique
     */
    uploadSingle() {
        return this.upload.single('image');
    }

    /**
     * Middleware pour upload d'images multiples
     */
    uploadMultiple() {
        return this.upload.array('images', 10); // Max 10 images
    }
}

module.exports = new SimpleAIController();

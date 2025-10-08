const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
    extractText, 
    getAllOCRResults, 
    getOCRResultById,
    updateOCRResult,
    deleteOCRResult
} = require('../controllers/ocrController');

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'application/pdf'];
        if (!allowedMimes.includes(file.mimetype)) {
            return cb(new Error('Seuls les fichiers image (JPEG, PNG, GIF, BMP, TIFF) et PDF sont acceptés.'), false);
        }
        cb(null, true);
    }
});

// Routes d'extraction de texte (accessibles sans authentification)
router.post('/extract', upload.single('image'), extractText);
router.post('/upload', upload.single('file'), extractText); // Alias pour cohérence

// Routes de récupération des résultats
router.get('/results', getAllOCRResults);
router.get('/results/:id', getOCRResultById);

// Routes de modification et suppression
router.put('/results/:id', updateOCRResult);
router.delete('/results/:id', deleteOCRResult);

module.exports = router;

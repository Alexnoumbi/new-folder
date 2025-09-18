const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractText } = require('../controllers/ocrController');
const auth = require('../middleware/auth');

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
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Seuls les fichiers image sont acceptés.'), false);
        }
        cb(null, true);
    }
});

// Route d'extraction de texte
router.post('/extract', auth, upload.single('image'), extractText);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const {
    uploadDocument,
    getDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    downloadDocument
} = require('../controllers/documentController');

// Configuration de multer pour l'upload de documents
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
    }
});

// Routes des documents
router.post('/', auth, upload.single('file'), uploadDocument);
router.get('/', auth, getDocuments);
router.get('/:id', auth, getDocument);
router.put('/:id', auth, updateDocument);
router.delete('/:id', auth, deleteDocument);
router.get('/:id/download', auth, downloadDocument);

module.exports = router;

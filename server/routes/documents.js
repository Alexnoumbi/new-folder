const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    uploadDocument,
    getDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    downloadDocument
} = require('../controllers/documentController');

// Configuration de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Routes documents (accessibles sans authentification)
router.post('/', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.get('/:id/download', downloadDocument);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
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

// Routes documents (protégées par authentification)
router.post('/', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.put('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);
router.get('/:id/download', protect, downloadDocument);

module.exports = router;

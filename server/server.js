const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuration CORS avec x-user-email
// Support de plusieurs origines pour la production
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      // En développement, autoriser localhost
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-email'
  ]
}));

// Middlewares de base
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Routes
const routes = {
  auth: require('./routes/auth'),
  admin: require('./routes/admin'),
  audit: require('./routes/audit'),
  dashboard: require('./routes/dashboard'),
  documents: require('./routes/documents'),
  conventions: require('./routes/conventions'),
  kpis: require('./routes/kpis'),
  visites: require('./routes/visites'),
  reports: require('./routes/reports'),
  ocr: require('./routes/ocr'),
  entreprises: require('./routes/entreprises'),
  users: require('./routes/users'),
  system: require('./routes/system'),
  resultsFramework: require('./routes/resultsFramework'),
  formBuilder: require('./routes/formBuilder'),
  portfolio: require('./routes/portfolio'),
  collaboration: require('./routes/collaboration'),
  enhancedReports: require('./routes/enhancedReports'),
  public: require('./routes/public'),
  indicators: require('./routes/indicators'),
  messages: require('./routes/messages'),
  workflows: require('./routes/workflows'),
  aiChat: require('./routes/aiChat'),
  hybridAI: require('./routes/hybridAI'),
  optimizedAssistant: require('./routes/optimizedAssistant'),
  advancedAssistant: require('./routes/advancedAssistant'),
  enhancedAssistant: require('./routes/enhancedAssistant')
};

// Configuration des routes
app.use('/api/public', routes.public); // Routes publiques (sans auth)
app.use('/api/auth', routes.auth);
app.use('/api/admin', routes.admin);
app.use('/api/audit', routes.audit);
app.use('/api/dashboard', routes.dashboard);
app.use('/api/documents', routes.documents);
app.use('/api/conventions', routes.conventions);
app.use('/api/kpis', routes.kpis);
app.use('/api/visites', routes.visites);
app.use('/api/reports', routes.reports);
app.use('/api/ocr', routes.ocr);
app.use('/api/entreprises', routes.entreprises);
app.use('/api/users', routes.users);
app.use('/api/system', routes.system);
app.use('/api/results-framework', routes.resultsFramework);
app.use('/api/form-builder', routes.formBuilder);
app.use('/api/portfolios', routes.portfolio);
app.use('/api/collaboration', routes.collaboration);
app.use('/api/enhanced-reports', routes.enhancedReports);
app.use('/api/indicators', routes.indicators);
app.use('/api/messages', routes.messages);
app.use('/api/workflows', routes.workflows);
app.use('/api/ai-chat', routes.aiChat);
app.use('/api/hybrid-ai', routes.hybridAI);
app.use('/api/assistant', routes.optimizedAssistant);
app.use('/api/advanced-assistant', routes.advancedAssistant);
app.use('/api/enhanced-assistant', routes.enhancedAssistant);

// Servir les fichiers uploadés
const uploadsPath = path.join(__dirname, 'uploads');
// S'assurer que le dossier existe
const fs = require('fs');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ Dossier uploads créé');
}

// Route dédiée pour servir les fichiers via /api/uploads
app.get('/api/uploads/:filename', (req, res) => {
  // Récupérer le nom du fichier
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, filename);
  
  console.log('📥 Requête pour fichier:', filename);
  console.log('📁 Chemin complet:', filePath);
  
  // Sécurité : empêcher l'accès aux fichiers en dehors du dossier uploads
  const normalizedPath = path.normalize(filePath);
  const normalizedUploadsPath = path.normalize(uploadsPath);
  if (!normalizedPath.startsWith(normalizedUploadsPath)) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }
  
  // Vérifier que le fichier existe
  if (!fs.existsSync(filePath)) {
    console.log('❌ Fichier non trouvé:', filePath);
    return res.status(404).json({
      success: false,
      message: 'Fichier non trouvé',
      path: filePath
    });
  }
  
  // Envoyer le fichier avec les bons headers
  res.sendFile(filePath, {
    headers: {
      'Content-Type': getContentType(filePath)
    }
  }, (err) => {
    if (err) {
      console.error('Erreur lors de l\'envoi du fichier:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'envoi du fichier'
        });
      }
    } else {
      console.log('✅ Fichier servi:', filename);
    }
  });
});

// Fonction helper pour déterminer le Content-Type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// Route directe pour rétrocompatibilité
app.use('/uploads', express.static(uploadsPath));

console.log('📁 Fichiers statiques servis depuis:', uploadsPath);
console.log('🌐 Route /api/uploads/:filename accessible');
console.log('🌐 Route /uploads accessible (rétrocompatibilité)');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('🔍 Vérifiez que MongoDB est en cours d\'exécution');
    } else if (error.message.includes('Authentication failed')) {
      console.log('🔑 Vérifiez vos identifiants MongoDB dans le fichier .env');
    } else if (error.message.includes('whitelist')) {
      console.log('🌐 Votre adresse IP (102.244.178.68) doit être autorisée dans MongoDB Atlas');
      console.log('➡️ Visitez https://cloud.mongodb.com et ajoutez votre IP dans Network Access');
    }
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 CORS configuré pour: ${allowedOrigins.join(', ')}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

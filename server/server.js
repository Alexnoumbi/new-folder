const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuration CORS avec x-user-email
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
  system: require('./routes/system')
};

// Configuration des routes
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

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  console.log(`🌐 CORS configuré pour: localhost`);
});

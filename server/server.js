const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration du CORS
app.use(cors({
  origin: (origin, callback) => {
    // Permettre l'accès depuis Flutter (pas d'origine) et localhost
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    // En production, vous pouvez ajouter votre domaine Flutter ici
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());

// Configuration MongoDB avec fallback automatique
let MONGODB_URI = process.env.MONGODB_URI;

// Si pas d'URI configurée, essayer MongoDB local
if (!MONGODB_URI) {
  console.log('⚠️ Aucune URI MongoDB configurée, utilisation de MongoDB local');
  MONGODB_URI = 'mongodb://localhost:27017/myapp';
}

// Détecter le type de base de données
const isLocalDB = MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1');
const dbType = isLocalDB ? 'Locale' : 'Atlas';

// Configuration de la limitation de taux
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use(limiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000, // Timeout de 10 secondes (augmenté)
  socketTimeoutMS: 45000, // Timeout de socket de 45 secondes
  connectTimeoutMS: 10000, // Timeout de connexion de 10 secondes
  maxPoolSize: 10, // Taille maximale du pool de connexions
  minPoolSize: 5, // Taille minimale du pool de connexions
  maxIdleTimeMS: 30000, // Temps d'inactivité avant fermeture de connexion
  family: 4, // Forcer IPv4
})
.then(() => {
  console.log('✅ Connexion à MongoDB établie avec succès');
  console.log(`📊 Base de données: ${dbType}`);
})
.catch(err => {
  console.error('❌ Erreur de connexion à MongoDB :', err.message);
  console.log('⚠️ Le serveur continue sans base de données (mode dégradé)');
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const entrepriseRoutes = require('./routes/entreprises');
const kpisRoutes = require('./routes/kpis');
const documentsRoutes = require('./routes/documents');
const visitesRoutes = require('./routes/visites');
const conventionRoutes = require('./routes/conventions');
const indicatorRoutes = require('./routes/indicators');
const adminRoutes = require('./routes/admin');
const reportsRoutes = require('./routes/reports');

// Use routes with proper prefixes - SANS AUTHENTIFICATION
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/entreprises', entrepriseRoutes);
app.use('/api/entreprise', entrepriseRoutes); // Route au singulier pour les statistiques
app.use('/api/kpis', kpisRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/visites', visitesRoutes);
app.use('/api/conventions', conventionRoutes);
app.use('/api/indicators', indicatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Serveur opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Route de téléchargement des rapports
app.get('/api/reports/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads/reports', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, filename);
  } else {
    res.status(404).json({ message: 'Fichier non trouvé' });
  }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Socket.io configuration
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.io connection handler - SANS AUTHENTIFICATION
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.io disponible`);
  console.log(`🌐 CORS configuré pour: localhost et 127.0.0.1`);
  console.log(`📊 Base de données: ${dbType}`);
});
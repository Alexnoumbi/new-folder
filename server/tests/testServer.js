const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:3000'],
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

// Routes de test (seulement les routes essentielles)
const routes = {
  auth: require('../routes/auth'),
  admin: require('../routes/admin'),
  entreprises: require('../routes/entreprises'),
  dashboard: require('../routes/dashboard'),
  messages: require('../routes/messages'),
  reports: require('../routes/reports')
};

// Configuration des routes
app.use('/api/auth', routes.auth);
app.use('/api/admin', routes.admin);
app.use('/api/entreprises', routes.entreprises);
app.use('/api/dashboard', routes.dashboard);
app.use('/api/messages', routes.messages);
app.use('/api/reports', routes.reports);

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

module.exports = app;


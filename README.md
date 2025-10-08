# TrackImpact Monitor

<div align="center">
  <img src="frontend/public/logo.svg" alt="TrackImpact Logo" width="200"/>
  
  <h3>Plateforme Moderne de Monitoring et Évaluation d'Impact</h3>
  
  [![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/trackimpact/monitor)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/react-19.1.1-blue.svg)](https://reactjs.org/)
</div>

## 📋 Table des Matières

- [À propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Contribution](#contribution)
- [Support](#support)

## 🎯 À propos

**TrackImpact Monitor** est une plateforme digitale complète pour le suivi, la gestion et l'évaluation de l'impact des projets de développement. Inspirée des meilleures pratiques de TolaData, notre solution offre:

- 📊 **Collecte de données** - Formulaires dynamiques et imports automatiques
- 📈 **Gestion d'indicateurs** - Suivi KPI et cadres de résultats
- 🎨 **Dashboards avancés** - Visualisations interactives en temps réel
- 📁 **Gestion de portfolio** - Vue consolidée multi-projets
- 🤝 **Collaboration** - Discussions, tâches et workflows d'approbation
- 📑 **Rapports personnalisés** - Exports PDF, Excel et formats multiples

## ✨ Fonctionnalités

### 1. **Cadre de Résultats & Théorie du Changement**
- Création de cadres logiques (Logframe)
- Théorie du changement intégrée
- Hiérarchie Impact → Outcomes → Outputs → Activities
- Gestion des risques et hypothèses
- Suivi des parties prenantes

### 2. **Collecte de Données Avancée**
- Form Builder drag-and-drop
- 20+ types de champs (texte, nombre, localisation, signature, etc.)
- Logique conditionnelle
- Mode hors-ligne
- Intégrations: KoboToolbox, ODK, Google Forms

### 3. **Gestion de Portfolio**
- Vue consolidée multi-projets
- Indicateurs agrégés (somme, moyenne, pondérée)
- Budget consolidé et suivi financier
- Analyse des bénéficiaires
- Leçons apprises et bonnes pratiques

### 4. **Dashboards & Visualisations**
- Métriques en temps réel
- Graphiques interactifs (Area, Bar, Pie, Radar)
- Analyse de performance
- Suivi des activités
- Tableaux de bord personnalisables

### 5. **Collaboration & Workflows**
- Discussions contextuelles
- Gestion de tâches
- Workflows d'approbation multi-niveaux
- Notifications intelligentes
- SLA et escalade automatique

### 6. **Rapports & Exports**
- Exports PDF professionnels
- Exports Excel multi-feuilles
- Rapports personnalisés
- Templates réutilisables
- Planification automatique

## 🛠 Technologies

### Backend
- **Runtime**: Node.js 14+
- **Framework**: Express.js
- **Base de données**: MongoDB
- **ODM**: Mongoose
- **Authentification**: JWT
- **Validation**: Express-validator
- **Génération PDF**: PDFKit
- **Génération Excel**: ExcelJS
- **OCR**: Tesseract.js
- **Sécurité**: Helmet, bcrypt

### Frontend
- **Framework**: React 19.1.1
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) 7.x
- **State Management**: Redux Toolkit
- **Routing**: React Router 6
- **Forms**: Formik + Yup
- **Charts**: Recharts
- **Date**: date-fns
- **HTTP Client**: Axios
- **Real-time**: Socket.io

## 📦 Installation

### Prérequis
```bash
- Node.js >= 14.0.0
- MongoDB >= 4.4
- npm ou yarn
```

### 1. Cloner le repository
```bash
git clone https://github.com/trackimpact/monitor.git
cd monitor
```

### 2. Installation Backend
```bash
cd server
npm install
```

### 3. Installation Frontend
```bash
cd frontend
npm install
```

### 4. Configuration
Créer un fichier `.env` dans le dossier `server`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/trackimpact

# JWT
JWT_SECRET=votre_secret_jwt_super_securise
JWT_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 5. Démarrage

#### Backend
```bash
cd server
npm run dev
```

#### Frontend
```bash
cd frontend
npm start
```

L'application sera accessible sur:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏗 Architecture

```
trackimpact-monitor/
├── server/                 # Backend Node.js/Express
│   ├── controllers/       # Contrôleurs de routes
│   ├── models/           # Modèles Mongoose
│   ├── routes/           # Définitions des routes
│   ├── middleware/       # Middlewares personnalisés
│   ├── utils/            # Utilitaires
│   └── server.js         # Point d'entrée backend
│
├── frontend/             # Frontend React/TypeScript
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   ├── services/    # Services API
│   │   ├── store/       # Redux store
│   │   ├── theme/       # Configuration thème
│   │   ├── types/       # Types TypeScript
│   │   └── utils/       # Utilitaires
│   ├── public/          # Fichiers statiques
│   └── package.json
│
└── docs/                # Documentation
```

## 📡 API Documentation

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
```

### Results Framework
```http
GET    /api/results-framework
POST   /api/results-framework
GET    /api/results-framework/:id
PUT    /api/results-framework/:id
DELETE /api/results-framework/:id
POST   /api/results-framework/:id/outcomes
POST   /api/results-framework/:id/outputs
POST   /api/results-framework/:id/activities
```

### Form Builder
```http
GET    /api/forms
POST   /api/forms
GET    /api/forms/:id
PUT    /api/forms/:id
POST   /api/forms/:id/submit
GET    /api/forms/:id/submissions
POST   /api/forms/:id/submissions/:submissionId/approve
```

### Portfolio Management
```http
GET    /api/portfolios
POST   /api/portfolios
GET    /api/portfolios/:id
PUT    /api/portfolios/:id
POST   /api/portfolios/:id/projects
POST   /api/portfolios/:id/calculate-indicators
GET    /api/portfolios/:id/summary-report
```

### Collaboration
```http
GET    /api/collaboration/discussions
POST   /api/collaboration/discussions
POST   /api/collaboration/discussions/:id/messages
GET    /api/collaboration/workflows/my-approvals
POST   /api/collaboration/workflows/instances/:id/approve
```

### Enhanced Reports
```http
GET    /api/enhanced-reports/portfolio/:portfolioId/pdf
GET    /api/enhanced-reports/portfolio/:portfolioId/excel
GET    /api/enhanced-reports/framework/:frameworkId/pdf
GET    /api/enhanced-reports/form/:formId/submissions/excel
POST   /api/enhanced-reports/consolidated
```

Pour plus de détails, consultez [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## 👥 Contribution

Les contributions sont les bienvenues ! Veuillez consulter [CONTRIBUTING.md](docs/CONTRIBUTING.md) pour plus de détails.

### Processus de contribution
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus d'informations.

## 🤝 Support

- 📧 Email: support@trackimpact.com
- 📚 Documentation: [docs.trackimpact.com](https://docs.trackimpact.com)
- 💬 Discord: [discord.gg/trackimpact](https://discord.gg/trackimpact)
- 🐛 Issues: [GitHub Issues](https://github.com/trackimpact/monitor/issues)

## 🙏 Remerciements

- Inspiré par [TolaData](https://www.toladata.com)
- Icônes par [Material Icons](https://mui.com/material-ui/material-icons/)
- Charts par [Recharts](https://recharts.org/)

---

<div align="center">
  Fait avec ❤️ par l'équipe TrackImpact
</div>


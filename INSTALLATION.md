# 🚀 Guide d'Installation - TrackImpact Monitor

## Dépendances Nécessaires

### Backend (serveur Node.js)

Les dépendances suivantes doivent être ajoutées au fichier `server/package.json` :

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "exceljs": "^4.4.0",
    "express": "^4.18.2",
    "express-async-handler": "^1.2.0",
    "express-rate-limit": "^7.5.1",
    "express-validator": "^7.2.1",
    "helmet": "^7.2.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.18.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.8",
    "pdfkit": "^0.17.2",
    "socket.io": "^4.8.1",
    "tesseract.js": "^4.1.1",
    "uuid": "^9.0.1"
  }
}
```

### Frontend (React TypeScript)

Les dépendances suivantes sont déjà présentes mais vérifiez les versions :

```json
{
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/icons-material": "^7.3.2",
    "@mui/material": "^7.3.2",
    "@mui/x-date-pickers": "^8.11.1",
    "axios": "^1.11.0",
    "date-fns": "^4.1.0",
    "formik": "^2.4.6",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^6.30.1",
    "recharts": "^3.1.2",
    "socket.io-client": "^4.8.1",
    "typescript": "^4.9.5"
  }
}
```

## 📦 Installation Étape par Étape

### 1. Cloner et Préparer

```bash
# Naviguer vers votre projet
cd "D:\api-gestion-main\New folder"

# Mettre à jour le nom dans package.json
# Remplacer "myapp-backend" par "trackimpact-backend"
```

### 2. Installer les Dépendances Backend

```bash
cd server
npm install
```

### 3. Installer les Dépendances Frontend

```bash
cd ../frontend
npm install
```

### 4. Configuration Environnement

#### Créer `server/.env`

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/trackimpact
# OU pour MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trackimpact?retryWrites=true&w=majority

# JWT
JWT_SECRET=votre-super-secret-jwt-a-changer-absolument
JWT_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (Optionnel pour l'instant)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-app

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,xls,xlsx
```

#### Créer `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
```

### 5. Créer les Dossiers Nécessaires

```bash
# Dans le dossier server
mkdir -p uploads
mkdir -p logs

# Dans le dossier frontend
mkdir -p build
```

### 6. Mettre à Jour le Logo

Le logo a été créé dans `frontend/public/logo.svg`. Vérifiez qu'il est bien présent.

### 7. Démarrer les Services

#### Terminal 1 - MongoDB (si local)

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

#### Terminal 2 - Backend

```bash
cd server
npm run dev
```

Vous devriez voir :
```
✅ Connecté à MongoDB Atlas
🚀 Serveur démarré sur le port 5000
🌐 CORS configuré pour: localhost
```

#### Terminal 3 - Frontend

```bash
cd frontend
npm start
```

Le navigateur devrait s'ouvrir automatiquement sur http://localhost:3000

## ✅ Vérification de l'Installation

### 1. Page d'Accueil
- Accédez à http://localhost:3000
- Vous devriez voir la nouvelle page d'accueil TrackImpact
- Le logo doit s'afficher
- Les sections doivent être visibles

### 2. Backend API
- Accédez à http://localhost:5000/api/auth/login (devrait retourner une erreur attendue)
- Vérifiez les logs dans le terminal backend

### 3. Connexion MongoDB
- Vérifiez dans le terminal backend: "✅ Connecté à MongoDB"

## 🔧 Résolution des Problèmes Courants

### Problème: Module non trouvé

```bash
# Solution: Réinstaller les dépendances
cd server
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Problème: MongoDB ne se connecte pas

```bash
# Vérifier si MongoDB est lancé
# Windows
net start MongoDB

# Linux
sudo systemctl status mongod

# Mac
brew services start mongodb-community
```

### Problème: Port déjà utilisé

```bash
# Changer le port dans server/.env
PORT=5001

# Puis redémarrer le backend
```

### Problème: CORS Error

Vérifiez que `server/.env` contient :
```env
CORS_ORIGIN=http://localhost:3000
```

## 📋 Checklist Post-Installation

- [ ] MongoDB connecté avec succès
- [ ] Backend démarré sur port 5000
- [ ] Frontend accessible sur port 3000
- [ ] Page d'accueil s'affiche correctement
- [ ] Logo visible
- [ ] Possibilité de s'inscrire/se connecter
- [ ] Dashboard accessible après connexion

## 🎯 Prochaines Étapes

1. **Tester les Fonctionnalités**
   - Créer un compte
   - Créer un projet
   - Tester le form builder
   - Créer un portfolio

2. **Personnalisation**
   - Modifier les couleurs dans `frontend/src/theme/modernTheme.ts`
   - Adapter les textes de la page d'accueil
   - Configurer l'email

3. **Déploiement**
   - Suivre le guide `docs/DEPLOYMENT_GUIDE.md`
   - Configurer un domaine
   - Activer HTTPS

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans les terminaux
2. Consultez la documentation complète
3. Vérifiez les fichiers .env
4. Assurez-vous que toutes les dépendances sont installées

---

## 🎉 Félicitations !

Votre application TrackImpact Monitor est maintenant installée et prête à l'emploi !

Pour plus d'informations, consultez :
- [README.md](README.md) - Vue d'ensemble
- [docs/USER_GUIDE.md](docs/USER_GUIDE.md) - Guide utilisateur
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) - Déploiement
- [docs/CHANGELOG.md](docs/CHANGELOG.md) - Changements
- [REFONTE_COMPLETE.md](REFONTE_COMPLETE.md) - Récapitulatif complet

---

*Dernière mise à jour: Octobre 2025*


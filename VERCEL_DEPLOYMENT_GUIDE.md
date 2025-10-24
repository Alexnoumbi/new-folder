# Guide de Déploiement Vercel

## Configuration ajoutée

J'ai ajouté tous les fichiers de configuration nécessaires pour déployer votre application sur Vercel :

### Fichiers créés/modifiés :

1. **`vercel.json`** - Configuration principale de Vercel
2. **`package.json`** - Scripts de build et configuration du projet principal
3. **`.vercelignore`** - Fichiers à ignorer lors du déploiement
4. **`frontend/.vercelignore`** - Fichiers à ignorer pour le frontend
5. **`server/.vercelignore`** - Fichiers à ignorer pour le serveur
6. **Mise à jour des `package.json`** du frontend et du serveur

## Étapes de déploiement

### 1. Préparation
```bash
# Installer toutes les dépendances
npm run install:all
```

### 2. Variables d'environnement
Créez un fichier `.env` à la racine du projet avec vos variables d'environnement :
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
# Ajoutez toutes vos autres variables d'environnement
```

### 3. Déploiement sur Vercel

#### Option A : Via l'interface Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub
3. Importez votre repository
4. Vercel détectera automatiquement la configuration

#### Option B : Via CLI Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

### 4. Configuration des variables d'environnement sur Vercel
1. Dans le dashboard Vercel, allez dans Settings > Environment Variables
2. Ajoutez toutes vos variables d'environnement :
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - Toutes les autres variables nécessaires

### 5. Configuration MongoDB Atlas
Assurez-vous que votre base de données MongoDB Atlas :
- Est accessible depuis n'importe quelle IP (0.0.0.0/0)
- A un utilisateur avec les permissions appropriées
- Utilise une connexion string valide

## Structure de déploiement

Vercel va :
1. **Frontend** : Builder l'application React et la servir comme site statique
2. **Backend** : Déployer le serveur Node.js comme fonction serverless
3. **API Routes** : Toutes les routes `/api/*` seront dirigées vers votre serveur

## URLs générées

Après déploiement, vous aurez :
- **Frontend** : `https://your-app.vercel.app`
- **API** : `https://your-app.vercel.app/api/*`

## Scripts disponibles

```bash
# Installer toutes les dépendances
npm run install:all

# Build pour la production
npm run build

# Développement local
npm run dev

# Build spécifique Vercel
npm run vercel-build
```

## Dépannage

### Problèmes courants :
1. **Variables d'environnement manquantes** : Vérifiez que toutes les variables sont configurées dans Vercel
2. **Erreurs de build** : Vérifiez les logs de build dans le dashboard Vercel
3. **Problèmes de CORS** : Assurez-vous que votre configuration CORS inclut le domaine Vercel

### Logs et monitoring :
- Utilisez le dashboard Vercel pour voir les logs
- Activez les fonctionnalités de monitoring si nécessaire

## Notes importantes

- Vercel utilise des fonctions serverless, donc votre backend doit être compatible
- Les uploads de fichiers sont limités (10MB max par défaut)
- Les connexions de base de données doivent être optimisées pour les fonctions serverless
- Considérez utiliser MongoDB Atlas pour une meilleure compatibilité

## Support

En cas de problème, consultez :
- [Documentation Vercel](https://vercel.com/docs)
- [Logs de déploiement](https://vercel.com/docs/concepts/projects/overview#viewing-build-logs)
- [Variables d'environnement](https://vercel.com/docs/concepts/projects/environment-variables)

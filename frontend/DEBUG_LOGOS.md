# 🔍 Guide de débogage - Logos qui ne s'affichent pas

## ✅ Corrections apportées

1. **Amélioration de la détection d'environnement** dans `getApiBaseUrl()`
2. **Ajout de logs de débogage** pour voir les URLs générées
3. **Vérification automatique** que le dossier `uploads` existe côté serveur
4. **Amélioration de la configuration CORS** pour la production

## 🔍 Comment diagnostiquer le problème

### 1. Ouvrir la console du navigateur (F12)

Dans la console, vous devriez voir des logs comme :
```
[getImageUrl] URL construite: http://localhost:5000/uploads/logo-123.png depuis: /uploads/logo-123.png base: http://localhost:5000
```

### 2. Vérifier les erreurs réseau

Dans l'onglet **Network** (Réseau) du navigateur :
- Cherchez la requête vers `/uploads/logo-xxx.png`
- Vérifiez le **Status Code** :
  - ✅ **200** = Fichier trouvé et chargé
  - ❌ **404** = Fichier non trouvé
  - ❌ **403** = Permission refusée
  - ❌ **CORS error** = Problème de CORS

### 3. Vérifier côté serveur

Dans la console du serveur Node.js, vous devriez voir :
```
📁 Fichiers statiques servis depuis: D:\api-gestion-main\New folder\server\uploads
🌐 Route /uploads accessible
```

### 4. Tester l'URL directement

Ouvrez dans votre navigateur :
- **Local** : `http://localhost:5000/uploads/logo-123.png` (remplacez par le nom réel)
- **Production** : `https://votre-domaine.com/uploads/logo-123.png`

## 🐛 Problèmes courants et solutions

### Problème 1 : 404 Not Found

**Symptômes :**
- Console : `[getImageUrl] URL construite: http://localhost:5000/uploads/logo.png`
- Network : Status 404

**Solutions :**
1. Vérifier que le fichier existe dans `server/uploads/`
2. Vérifier le nom du fichier dans la base de données
3. Vérifier que le chemin dans la DB est correct (`/uploads/nom-fichier.png`)

### Problème 2 : CORS Error

**Symptômes :**
- Console : `Access to image at '...' from origin '...' has been blocked by CORS policy`

**Solutions :**
1. Vérifier la configuration CORS dans `server/server.js`
2. Ajouter votre domaine frontend dans `FRONTEND_URL` ou `origin` dans CORS
3. En production, s'assurer que le backend autorise le domaine frontend

### Problème 3 : Mixed Content

**Symptômes :**
- Console : `Mixed Content: The page was loaded over HTTPS, but requested an insecure resource 'http://...'`

**Solutions :**
1. S'assurer que le backend est en HTTPS en production
2. Utiliser `https://` pour toutes les URLs en production

### Problème 4 : Le logo n'existe pas dans la base

**Symptômes :**
- `entreprise.logo` est `null` ou `undefined`
- Pas de logs dans la console

**Solutions :**
1. Vérifier que l'entreprise a bien un logo uploadé
2. Vérifier dans MongoDB : `db.entreprises.findOne({_id: ObjectId("...")})`
3. Re-uploader le logo si nécessaire

## 🧪 Test rapide

### Test 1 : Vérifier que le serveur sert les fichiers

```bash
# Dans le navigateur, ouvrir :
http://localhost:5000/uploads/test.txt

# Si ça fonctionne, créer un fichier test :
echo "test" > server/uploads/test.txt
```

### Test 2 : Vérifier l'URL générée

Dans la console du navigateur :
```javascript
// Tester manuellement
import { getImageUrl } from './utils/imageUtils';
console.log(getImageUrl('/uploads/logo-123.png'));
// Devrait afficher: http://localhost:5000/uploads/logo-123.png
```

### Test 3 : Vérifier dans la base de données

```javascript
// Dans MongoDB ou via une requête API
GET /api/entreprises/:id
// Vérifier le champ "logo" dans la réponse
```

## 📋 Checklist de vérification

- [ ] Le dossier `server/uploads/` existe
- [ ] Les fichiers logo sont bien dans `server/uploads/`
- [ ] Le serveur affiche les logs de démarrage (`📁 Fichiers statiques servis depuis...`)
- [ ] La console du navigateur affiche les logs `[getImageUrl]`
- [ ] L'URL dans la console est correcte
- [ ] L'URL fonctionne quand on l'ouvre directement dans le navigateur
- [ ] Pas d'erreurs CORS dans la console
- [ ] Le champ `logo` existe dans la base de données
- [ ] Le chemin du logo commence par `/uploads/`

## 🔧 Commandes utiles

### Vérifier les fichiers dans uploads
```bash
# Windows PowerShell
dir server\uploads

# Linux/Mac
ls -la server/uploads
```

### Vérifier les logs du serveur
Regardez les logs au démarrage du serveur pour voir :
- Le chemin du dossier uploads
- Si la route `/uploads` est accessible

## 📞 Si le problème persiste

1. **Copiez les logs de la console** (navigateur et serveur)
2. **Notez l'URL exacte** qui est générée (visible dans les logs)
3. **Testez l'URL directement** dans le navigateur
4. **Vérifiez les permissions** du dossier uploads
5. **Vérifiez la configuration** de votre déploiement (Vercel, Netlify, etc.)

## 💡 Note importante

En production, si le frontend et le backend sont sur des domaines différents, vous devez :
1. Configurer `REACT_APP_API_URL` avec l'URL complète du backend
2. Configurer CORS sur le backend pour autoriser le domaine frontend
3. Ou utiliser un proxy (Vercel/Netlify) pour servir les fichiers


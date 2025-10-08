# Guide de Déploiement - TrackImpact Monitor

## Table des Matières
1. [Prérequis](#prérequis)
2. [Déploiement Local](#déploiement-local)
3. [Déploiement Production](#déploiement-production)
4. [Docker](#docker)
5. [Cloud Providers](#cloud-providers)
6. [Sécurité](#sécurité)
7. [Monitoring](#monitoring)

---

## 1. Prérequis

### Logiciels Requis
- **Node.js**: >= 14.0.0
- **MongoDB**: >= 4.4
- **npm** ou **yarn**
- **Git**

### Systèmes Supportés
- Ubuntu 20.04+ / Debian 10+
- CentOS 7+ / RHEL 8+
- macOS 10.15+
- Windows 10+ (avec WSL2 recommandé)

---

## 2. Déploiement Local

### Installation

```bash
# Cloner le repository
git clone https://github.com/trackimpact/monitor.git
cd trackimpact-monitor

# Installer les dépendances backend
cd server
npm install

# Installer les dépendances frontend
cd ../frontend
npm install
```

### Configuration

#### Backend (.env)
```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/trackimpact
MONGODB_USER=admin
MONGODB_PASSWORD=secure_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Serveur
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Email
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,xls,xlsx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
```

### Démarrage

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## 3. Déploiement Production

### Build Frontend

```bash
cd frontend
npm run build
```

Le build sera dans `frontend/build/`

### Configuration Production Backend

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/trackimpact?retryWrites=true&w=majority

# Security
JWT_SECRET=generate-a-very-strong-secret-key-here
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=https://yourdomain.com

# SSL/TLS
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

### PM2 (Process Manager)

#### Installation
```bash
npm install -g pm2
```

#### Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'trackimpact-api',
    script: './server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

#### Démarrage
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Commandes Utiles
```bash
pm2 list              # Liste des processus
pm2 logs             # Voir les logs
pm2 monit            # Monitoring
pm2 restart all      # Redémarrer
pm2 stop all         # Arrêter
pm2 delete all       # Supprimer
```

### Nginx (Reverse Proxy)

#### Installation
```bash
sudo apt update
sudo apt install nginx
```

#### Configuration (/etc/nginx/sites-available/trackimpact)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Frontend
    location / {
        root /var/www/trackimpact/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket (Socket.io)
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
```

#### Activer le site
```bash
sudo ln -s /etc/nginx/sites-available/trackimpact /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL avec Let's Encrypt

```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

---

## 4. Docker

### Dockerfile Backend (server/Dockerfile)
```dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Dockerfile Frontend (frontend/Dockerfile)
```dockerfile
FROM node:14-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose (docker-compose.yml)
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:4.4
    container_name: trackimpact-mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: trackimpact
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"
    networks:
      - trackimpact-network

  backend:
    build: ./server
    container_name: trackimpact-backend
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/trackimpact?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    volumes:
      - ./server/uploads:/app/uploads
    networks:
      - trackimpact-network

  frontend:
    build: ./frontend
    container_name: trackimpact-frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - trackimpact-network

volumes:
  mongodb_data:

networks:
  trackimpact-network:
    driver: bridge
```

### Démarrage Docker
```bash
# Build et démarrage
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêt
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

## 5. Cloud Providers

### AWS (Elastic Beanstalk)

1. **Installation AWS CLI**
```bash
pip install awscli
aws configure
```

2. **Installation EB CLI**
```bash
pip install awsebcli
```

3. **Initialisation**
```bash
cd server
eb init trackimpact-api --platform node.js --region us-east-1
```

4. **Déploiement**
```bash
eb create trackimpact-prod
eb deploy
```

### Heroku

1. **Installation Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Création App**
```bash
heroku create trackimpact-api
heroku addons:create mongolab:sandbox
```

3. **Configuration**
```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
```

4. **Déploiement**
```bash
git push heroku main
```

### DigitalOcean App Platform

1. Connecter votre repository GitHub
2. Configurer les variables d'environnement
3. Sélectionner la région
4. Déployer

### Azure

1. **Installation Azure CLI**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

2. **Créer App Service**
```bash
az webapp up --name trackimpact-api --runtime "NODE|14-lts"
```

---

## 6. Sécurité

### Bonnes Pratiques

1. **Variables d'Environnement**
   - Ne jamais committer les .env
   - Utiliser des secrets managers (AWS Secrets, Azure Key Vault)
   - Rotation régulière des secrets

2. **Base de Données**
   - Activer l'authentification MongoDB
   - Utiliser SSL/TLS pour les connexions
   - Sauvegardes automatiques quotidiennes
   - Restreindre les IPs autorisées

3. **HTTPS/SSL**
   - Certificats SSL obligatoires en production
   - HSTS headers
   - Redirection HTTP → HTTPS

4. **Rate Limiting**
   - Configurer express-rate-limit
   - Limiter les tentatives de login
   - Protection DDoS au niveau CDN

5. **Validation**
   - Valider toutes les entrées
   - Sanitiser les données
   - Protection XSS et SQL injection

### Checklist Sécurité

- [ ] HTTPS activé avec certificat valide
- [ ] Pare-feu configuré (UFW/iptables)
- [ ] MongoDB authentifié et sécurisé
- [ ] Variables d'environnement sécurisées
- [ ] Rate limiting activé
- [ ] Helmet.js configuré
- [ ] CORS correctement configuré
- [ ] Logs de sécurité activés
- [ ] Sauvegardes automatiques
- [ ] Monitoring des intrusions

---

## 7. Monitoring

### PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### New Relic

```bash
npm install newrelic
```

```javascript
// server.js
require('newrelic');
```

### Sentry (Error Tracking)

```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### MongoDB Atlas Monitoring

- Activer les alertes de performance
- Configurer les seuils d'utilisation
- Monitoring des connexions
- Slow query logs

### Logs

**Winston Logger**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Uptime Monitoring

Services recommandés:
- **UptimeRobot**: Gratuit, ping toutes les 5 min
- **Pingdom**: Monitoring avancé
- **StatusCake**: Alternative gratuite

---

## Maintenance

### Mises à Jour

```bash
# Backend
cd server
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

### Sauvegardes MongoDB

```bash
# Backup
mongodump --uri="mongodb://user:pass@host/dbname" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://user:pass@host/dbname" /backup/20231015
```

### Script de Sauvegarde Automatique
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"
DB_NAME="trackimpact"

mongodump --uri="${MONGODB_URI}" --out="${BACKUP_DIR}/${DATE}"

# Garder seulement les 30 derniers jours
find ${BACKUP_DIR} -type d -mtime +30 -exec rm -rf {} \;

# Upload vers S3 (optionnel)
aws s3 sync ${BACKUP_DIR}/${DATE} s3://trackimpact-backups/${DATE}
```

**Cron Job** (tous les jours à 2h du matin)
```bash
0 2 * * * /home/user/backup.sh >> /var/log/backup.log 2>&1
```

---

## Support

Pour assistance:
- 📧 devops@trackimpact.com
- 📚 Documentation: docs.trackimpact.com
- 🐛 Issues: github.com/trackimpact/monitor/issues

---

*Dernière mise à jour: Octobre 2025*


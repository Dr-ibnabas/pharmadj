# Guide d'installation et déploiement

## Installation locale (développement)

### Prérequis

- **Node.js** 20 ou plus
- **PostgreSQL** 15 ou plus
- **Git**

### Étapes

#### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd pharma-app
```

#### 2. Installer les dépendances

```bash
npm install
```

#### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Éditer `.env` et au minimum définir :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pharmadj"
JWT_SECRET="<générer une clé aléatoire de 64+ caractères>"
REFRESH_TOKEN_SECRET="<autre clé aléatoire>"
```

Pour générer des secrets sécurisés :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 4. Créer la base de données

```bash
# Créer la DB
createdb pharmadj

# Appliquer les migrations Prisma
cd packages/database
npx prisma migrate dev --name init
npx prisma generate

# Charger les données de démonstration
npm run seed
```

#### 5. Lancer l'application

```bash
# Depuis la racine
npm run dev
```

- Frontend : http://localhost:5173
- API : http://localhost:3000/api

### Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | admin@pharma.dj | Admin@2026 |
| Pharmacien | pharmacien@pharma.dj | Pharma@2026 |
| Caissier | caissier@pharma.dj | Caisse@2026 |

---

## Déploiement Docker (production)

### Avec Docker Compose

#### 1. Préparer l'environnement

```bash
cp .env.example .env
# Éditer .env avec valeurs de production
```

⚠️ **IMPORTANT** : Changez TOUS les secrets par défaut.

#### 2. Construire et lancer

```bash
docker-compose up -d --build
```

#### 3. Initialiser la base

```bash
docker-compose exec api npx prisma migrate deploy --schema=/app/packages/database/prisma/schema.prisma
docker-compose exec api npm run seed --workspace=@pharma/database
```

#### 4. Vérifier

```bash
docker-compose ps
curl http://localhost:3000/api/health
```

---

## Déploiement manuel (serveur dédié)

### Configuration recommandée

- **CPU** : 2 cœurs minimum
- **RAM** : 4 Go minimum
- **Disque** : 50 Go (avec sauvegardes)
- **OS** : Ubuntu 22.04 LTS

### Stack production

```
Internet
    ↓
[Nginx] (reverse proxy + HTTPS)
    ↓
[PM2] (process manager)
    ├── API Node.js (port 3000)
    └── Static files React (port 80)
    ↓
[PostgreSQL] (port 5432)
```

### Installation

```bash
# Mise à jour
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql-15

# Nginx
sudo apt install -y nginx

# PM2
sudo npm install -g pm2

# Cloner et installer
git clone <repo> /var/www/pharma-app
cd /var/www/pharma-app
npm install --production
npm run build

# Configuration DB
sudo -u postgres createuser pharma
sudo -u postgres createdb pharmadj -O pharma
sudo -u postgres psql -c "ALTER USER pharma WITH PASSWORD 'mot-de-passe-fort';"

# Migrations
cd packages/database
npx prisma migrate deploy
npm run seed

# Démarrage avec PM2
cd /var/www/pharma-app
pm2 start apps/api/dist/server.js --name pharma-api
pm2 save
pm2 startup
```

### Configuration Nginx

```nginx
server {
    listen 80;
    server_name pharmacie.dj;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pharmacie.dj;

    ssl_certificate /etc/letsencrypt/live/pharmacie.dj/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pharmacie.dj/privkey.pem;

    # Frontend statique
    root /var/www/pharma-app/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Sauvegardes

### Script de sauvegarde quotidienne

```bash
#!/bin/bash
# /usr/local/bin/backup-pharma.sh

BACKUP_DIR="/var/backups/pharmadj"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Sauvegarde DB
pg_dump -U pharma pharmadj | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Sauvegarde uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/pharma-app/uploads

# Garder 30 jours
find $BACKUP_DIR -mtime +30 -delete

# Optionnel : envoyer vers S3
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://votre-bucket/
```

Crontab :
```
0 2 * * * /usr/local/bin/backup-pharma.sh
```

---

## Mises à jour

```bash
cd /var/www/pharma-app
git pull
npm install --production
npm run build
cd packages/database && npx prisma migrate deploy
pm2 restart pharma-api
```

---

## Dépannage

### L'API ne démarre pas
```bash
pm2 logs pharma-api
```

### Erreur de connexion DB
```bash
sudo systemctl status postgresql
psql -U pharma -d pharmadj -h localhost
```

### Performance dégradée
```bash
# Voir les requêtes lentes
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

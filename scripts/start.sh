#!/bin/bash
# Script de démarrage rapide PharmaDJ
# Usage: ./scripts/start.sh

set -e

echo "🚀 Démarrage de PharmaDJ..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installez Node.js 20+ : https://nodejs.org/"
    exit 1
fi

# Vérifier .env
if [ ! -f .env ]; then
    echo "⚠️  Fichier .env manquant, copie depuis .env.example"
    cp .env.example .env
    echo "📝 Éditez .env avec vos paramètres avant de continuer"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
cd packages/database
npx prisma generate
cd ../..

echo "✅ Prêt ! Lancez 'npm run dev' pour démarrer"

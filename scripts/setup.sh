#!/bin/bash
# Script de démarrage rapide pour Pharma App
# Usage : ./scripts/setup.sh

set -e

echo "================================================"
echo "  Pharma App - Installation"
echo "================================================"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installez Node.js 20+ : https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ requise (vous avez : $(node -v))"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Vérifier Docker (optionnel)
if command -v docker &> /dev/null; then
    echo "✅ Docker $(docker -v | cut -d' ' -f3 | sed 's/,//')"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker non détecté (vous devrez installer PostgreSQL manuellement)"
    DOCKER_AVAILABLE=false
fi

echo ""
echo "📦 Installation des dépendances..."
npm install

echo ""
echo "📋 Configuration de l'environnement..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Fichier .env créé (vérifiez les valeurs avant de continuer)"
else
    echo "✅ Fichier .env déjà présent"
fi

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo ""
    echo "🐳 Démarrage de PostgreSQL via Docker..."
    docker compose up -d postgres
    
    echo "⏳ Attente du démarrage de PostgreSQL (10s)..."
    sleep 10
fi

echo ""
echo "🗄️  Migration de la base de données..."
cd packages/database
npx prisma generate
npx prisma migrate dev --name init
echo ""
echo "🌱 Import des données de démonstration..."
npm run seed
cd ../..

echo ""
echo "================================================"
echo "  ✅ Installation terminée !"
echo "================================================"
echo ""
echo "Pour démarrer l'application :"
echo "  npm run dev"
echo ""
echo "Comptes de démonstration :"
echo "  • admin@pharma.dj / Admin@2026"
echo "  • pharmacien@pharma.dj / Pharma@2026"
echo "  • caissier@pharma.dj / Caisse@2026"
echo ""
echo "URLs :"
echo "  • Frontend : http://localhost:5173"
echo "  • API      : http://localhost:3001"
echo ""

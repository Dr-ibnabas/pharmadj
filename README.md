# PharmaDJ — Logiciel de Gestion de Pharmacie

Logiciel complet de gestion d'officine adapté au contexte djiboutien.

## Stack Technique

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS
- **Backend** : Node.js + Express + TypeScript
- **Base de données** : PostgreSQL 15 + Prisma ORM
- **Authentification** : JWT + Refresh Tokens
- **Mode hors ligne** : Service Worker + IndexedDB

## Structure du Monorepo

```
pharma-app/
├── apps/
│   ├── web/          # Application React (frontend)
│   └── api/          # API Express (backend)
├── packages/
│   ├── shared/       # Types et schémas partagés
│   └── database/     # Schéma Prisma et migrations
├── docs/             # Documentation
└── scripts/          # Scripts utilitaires
```

## Modules Fonctionnels

1. **Authentification** — Gestion utilisateurs et permissions
2. **Catalogue produits** — Médicaments avec DCI, dosages, lots
3. **Stocks et péremption** — FEFO, alertes automatiques
4. **Achats** — Fournisseurs, commandes, réceptions
5. **Ventes et caisse** — Encaissement, multi-paiement
6. **Ordonnances** — Prescriptions, stupéfiants, interactions
7. **Clients/Patients** — Dossiers médicaux, fidélité
8. **Tiers payants** — CNSS, mutuelles, assurances
9. **Comptabilité** — Tableaux de bord, rapports
10. **Paramétrage** — Configuration pharmacie

## Démarrage Rapide

### Prérequis
- Node.js 20+
- PostgreSQL 15+
- pnpm (recommandé) ou npm

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd pharma-app

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Initialiser la base de données
pnpm db:migrate
pnpm db:seed

# Lancer en développement
pnpm dev
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- API : http://localhost:3000
- Documentation API : http://localhost:3000/api/docs

## Comptes de Démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@pharma.dj | Admin@2026 |
| Pharmacien | pharmacien@pharma.dj | Pharma@2026 |
| Caissier | caissier@pharma.dj | Caisse@2026 |

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Guide utilisateur](./docs/GUIDE_UTILISATEUR.md)
- [API Reference](./docs/API.md)
- [Déploiement](./docs/DEPLOIEMENT.md)

## Licence

Propriétaire — Tous droits réservés

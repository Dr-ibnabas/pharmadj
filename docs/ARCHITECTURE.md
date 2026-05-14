# Architecture PharmaDJ

## Vue d'ensemble

PharmaDJ est une application web full-stack en architecture monorepo, conçue pour la gestion d'une officine de pharmacie à Djibouti.

## Architecture technique

### Stack

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React 18 + TypeScript + Vite                          │ │
│  │  ├── Tailwind CSS (UI)                                 │ │
│  │  ├── Zustand (state global)                            │ │
│  │  ├── TanStack Query (data fetching)                    │ │
│  │  └── React Router (navigation)                         │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                              ↕ HTTPS / JWT
┌──────────────────────────────────────────────────────────────┐
│                      SERVEUR API                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Node.js 20 + Express + TypeScript                     │ │
│  │  ├── Authentification JWT                              │ │
│  │  ├── Validation Zod                                    │ │
│  │  ├── Rate limiting + Helmet (sécurité)                 │ │
│  │  └── Winston (logging)                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                              ↕ Prisma ORM
┌──────────────────────────────────────────────────────────────┐
│                       BASE DE DONNÉES                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL 15                                         │ │
│  │  ├── 25+ tables                                        │ │
│  │  ├── Contraintes d'intégrité                           │ │
│  │  └── Index optimisés                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Modules métier

### 1. Authentification & RBAC
5 rôles : `ADMIN`, `PHARMACIEN_TITULAIRE`, `PHARMACIEN_ADJOINT`, `PREPARATEUR`, `CAISSIER`. Chaque endpoint vérifie les permissions via le middleware `authorize`.

### 2. Catalogue produits
Champs essentiels : DCI, dosage, forme galénique, statut (vente libre / sur ordonnance / stupéfiant), prix d'achat, prix de vente, TVA, stock minimum.

### 3. Stocks et lots (FEFO)
Le système applique automatiquement le principe FEFO (First Expired First Out) : à chaque sortie de stock, le lot dont la date de péremption est la plus proche est sélectionné en premier.

### 4. Ventes & caisse
- Recherche produit instantanée
- Multi-paiements (espèces, carte, D-Money, Waafi, crédit, tiers payant)
- Ordonnances liées
- Programme de fidélité automatique

### 5. Achats
Cycle complet : commande → réception → lot → stock.

### 6. Tiers payants
Configuration par mutuelle avec taux de prise en charge. Calcul automatique part patient / part organisme.

## Sécurité

### Authentification
- JWT access token (15 min)
- Refresh token (7 jours, rotatif, stocké en DB)
- Mots de passe : bcrypt cost 12
- Blocage automatique après 5 tentatives échouées (30 min)

### Validation
- Zod côté frontend ET backend
- Sanitization automatique des inputs

### Audit
Toutes les actions sensibles sont loguées dans `journal_audit` :
- Identifiant utilisateur
- Action et entité
- Données avant/après
- IP et user-agent

### Rate limiting
100 requêtes/minute par IP sur /api.

## Mode hors ligne

L'architecture prévoit (à implémenter) :
- Service Worker pour cache de l'application
- IndexedDB pour stockage local des ventes
- File de synchronisation au retour de la connexion
- Résolution de conflits par timestamps

## Performance

### Backend
- Connection pooling Prisma
- Requêtes paginées par défaut
- Index sur les champs de recherche fréquente

### Frontend
- Code splitting par route
- Cache TanStack Query (30s par défaut)
- Optimistic updates pour la caisse

## Sauvegardes

### Recommandations production
1. Sauvegarde PostgreSQL toutes les heures (`pg_dump`)
2. Réplication vers serveur secondaire
3. Backup chiffré quotidien sur S3
4. Test de restauration mensuel

## Déploiement

Voir [DEPLOIEMENT.md](./DEPLOIEMENT.md).

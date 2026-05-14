# API REST PharmaDJ

Base URL : `http://localhost:3000/api`

## Authentification

Toutes les routes sauf `/auth/login` nécessitent un header :
```
Authorization: Bearer <accessToken>
```

### POST /auth/login
```json
{
  "email": "admin@pharma.dj",
  "motDePasse": "Admin@2026"
}
```

Réponse :
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "utilisateur": { "id": "...", "email": "...", "role": "ADMIN" }
  }
}
```

### POST /auth/refresh
```json
{ "refreshToken": "eyJ..." }
```

### POST /auth/logout
```json
{ "refreshToken": "eyJ..." }
```

### GET /auth/me
Retourne l'utilisateur actuel.

## Produits

### GET /produits
Query params : `page`, `limit`, `search`, `familleId`, `laboratoireId`, `statut`

### GET /produits/recherche?q=doli
Recherche rapide pour la caisse.

### GET /produits/:id

### POST /produits
```json
{
  "nomCommercial": "Doliprane 500mg",
  "dci": "Paracétamol",
  "dosage": "500mg",
  "formeGalenique": "COMPRIME",
  "prixAchatHT": 800,
  "prixVenteTTC": 1200,
  "tauxTVA": 0,
  "stockMinimum": 20,
  "statut": "VENTE_LIBRE"
}
```

### PUT /produits/:id
### DELETE /produits/:id

## Stock

### POST /stock/lots
```json
{
  "produitId": "uuid",
  "numeroLot": "L2026-001",
  "quantiteInitiale": 100,
  "datePeremption": "2027-12-31",
  "prixAchatLot": 800
}
```

### POST /stock/ajuster
### GET /stock/peremptions?jours=90
### GET /stock/ruptures
### GET /stock/historique/:produitId

## Ventes

### POST /ventes
```json
{
  "clientId": "uuid (optionnel)",
  "ordonnanceId": "uuid (optionnel)",
  "lignes": [
    {
      "produitId": "uuid",
      "quantite": 2,
      "prixUnitaireTTC": 1200,
      "tauxTVA": 0,
      "remise": 0
    }
  ],
  "paiements": [
    { "mode": "ESPECES", "montant": 2400 }
  ]
}
```

### GET /ventes
### GET /ventes/:id
### GET /ventes/statistiques/jour?date=2026-05-10

## Clients

### GET /clients?search=...
### GET /clients/:id
### POST /clients
### PUT /clients/:id

## Ordonnances

### GET /ordonnances
### GET /ordonnances/:id
### POST /ordonnances

## Achats

### GET /achats/fournisseurs
### POST /achats/fournisseurs
### GET /achats/commandes
### POST /achats/commandes

## Références

### GET /references/familles
### GET /references/laboratoires
### GET /references/mutuelles
### GET /references/configuration

## Dashboard

### GET /dashboard/dashboard
Statistiques globales temps réel.

### GET /dashboard/top-produits?limit=10&jours=30
### GET /dashboard/ventes-par-jour?jours=14

## Codes de réponse

- `200` OK
- `201` Created
- `400` Validation error
- `401` Non authentifié
- `403` Permissions insuffisantes
- `404` Non trouvé
- `409` Conflit (ex: doublon)
- `422` Erreur métier (ex: stock insuffisant)
- `429` Rate limit
- `500` Erreur serveur

## Format d'erreur standard

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": [
      { "field": "email", "message": "Email invalide" }
    ]
  }
}
```

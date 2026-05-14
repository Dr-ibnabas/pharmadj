# Guide utilisateur PharmaDJ

## Première connexion

1. Ouvrez votre navigateur à l'adresse de l'application
2. Connectez-vous avec votre email et mot de passe
3. À la première connexion, changez votre mot de passe (Profil → Sécurité)

## Tableau de bord

Vue d'ensemble en temps réel :
- **Chiffre d'affaires** du jour et du mois
- **Alertes** : ruptures de stock, péremptions imminentes
- **Top 5 des produits** vendus
- **Graphique** des ventes des 14 derniers jours
- **Répartition** par mode de paiement

## Module Caisse

L'écran principal pour l'encaissement quotidien.

### Réaliser une vente

1. **Rechercher un produit**
   - Tapez les premières lettres du nom commercial
   - Ou scannez le code-barres
   - Ou tapez le DCI

2. **Ajouter au panier**
   - Cliquez sur le produit
   - Ajustez la quantité avec + et −
   - Pour supprimer : icône poubelle

3. **Encaisser**
   - Cliquez sur "Encaisser"
   - Choisissez le mode de paiement :
     - **Espèces** : saisir le montant reçu, le rendu se calcule automatiquement
     - **Carte bancaire** : montant exact
     - **D-Money / Waafi** : noter la référence de transaction
   - Validez

### Astuces

- Le panier reste rempli même si vous quittez la page (sauf après validation)
- Pour ajouter rapidement : cliquez plusieurs fois sur le même produit
- Les produits "Sur ordonnance" sont marqués d'un badge orange

## Module Produits

### Consulter le catalogue

- Liste paginée de tous les produits
- Recherche par nom, DCI ou code-barres
- Affichage du stock actuel et alertes de rupture

### Ajouter un produit (ADMIN/Pharmacien)

1. Bouton "Nouveau produit"
2. Remplir les champs obligatoires :
   - Nom commercial
   - DCI
   - Forme galénique
   - Prix d'achat HT et prix de vente TTC
   - Stock minimum
3. Optionnel mais recommandé :
   - Code-barres (pour scan rapide)
   - Laboratoire
   - Famille thérapeutique
   - Emplacement physique

## Module Stock & Lots

### Ajouter du stock

1. À chaque réception de marchandise :
   - Ouvrir le produit concerné
   - "Nouveau lot"
   - Renseigner :
     - **Numéro de lot** (sur la boîte fournisseur)
     - **Date de péremption** (obligatoire)
     - **Quantité reçue**
     - **Prix d'achat du lot**

### Le système FEFO

- À chaque vente, le système choisit automatiquement le lot dont la péremption est la plus proche
- Aucune action manuelle nécessaire

### Inventaire physique

1. Module Stock → Inventaire
2. Scanner ou rechercher chaque produit
3. Saisir la quantité physique
4. Le système calcule l'écart automatiquement
5. Validation par le pharmacien titulaire

## Module Péremptions

Vue prioritaire des produits à risque :

- **Rouge** : déjà périmés (à retirer immédiatement)
- **Orange** : moins de 30 jours
- **Jaune** : moins de 90 jours
- **Vert** : situation normale

Conduite à tenir :
- **Périmés** : retirer du stock, motif "Périmé", destruction selon procédure
- **< 30 jours** : promouvoir la vente, négocier reprise fournisseur
- **< 90 jours** : suivre l'écoulement

## Module Clients

### Créer un client

Champs essentiels :
- Nom et prénom
- Téléphone (pour SMS de suivi)
- Date de naissance (calcul posologies)

Champs médicaux importants :
- **Allergies** : affichées en rouge à chaque vente
- **Pathologies chroniques**
- **Traitements en cours**

### Mutuelle / CNSS

1. Sélectionner la mutuelle dans le menu déroulant
2. Saisir le numéro d'adhérent
3. Lors de la vente, basculez en mode "Tiers payant"
4. Le système calcule automatiquement la part patient et la part organisme

### Programme de fidélité

- 1 point gagné pour chaque 100 FDJ d'achat
- Points cumulables sur le compte client
- À utiliser comme remise lors d'une prochaine vente

## Module Ordonnances

### Saisir une ordonnance

1. Module Ordonnances → Nouvelle
2. Sélectionner le patient (ou créer)
3. Sélectionner le prescripteur (Dr X)
4. Date de l'ordonnance
5. Photographier l'ordonnance (caméra du PC ou tablette)
6. Saisir les médicaments prescrits

### Délivrance

1. Lors de la vente, lier la vente à l'ordonnance
2. Le système marque les médicaments comme délivrés
3. Pour les ordonnances renouvelables, possibilité de délivrance partielle

### Stupéfiants

Pour les médicaments classés stupéfiants :
- Numérotation séquentielle inviolable
- Nom du patient OBLIGATOIRE
- Nom du prescripteur OBLIGATOIRE
- Registre consultable par les autorités

## Module Achats

### Créer une commande fournisseur

1. Module Achats → Nouvelle commande
2. Sélectionner le fournisseur
3. Date de livraison prévue
4. Pour chaque ligne :
   - Choisir le produit
   - Quantité commandée
   - Prix unitaire HT
5. Statut : **Brouillon** → **Envoyée**

### Réception de marchandise

1. Ouvrir la commande
2. "Nouvelle réception"
3. Vérifier le bon de livraison
4. Pour chaque produit reçu :
   - Quantité réelle reçue
   - **Numéro de lot** (à reporter sur les boîtes)
   - **Date de péremption**
5. Validation : la marchandise entre en stock

## Clôture de caisse (fin de journée)

1. Module Caisse → Clôture
2. Le système affiche :
   - Total ventes par mode de paiement
   - Solde de caisse théorique (espèces)
3. Saisir l'espèces physique compté
4. L'écart est calculé
5. Justifier les écarts > 100 FDJ
6. Validation : la caisse est clôturée

## Rapports et exports

### Rapports disponibles

- Journal des ventes (par jour, semaine, mois)
- Journal de caisse
- État des stocks valorisé
- Inventaire valorisé
- Bordereaux mutuelles
- Top produits / clients
- Marge brute par famille

### Export

Tous les rapports sont exportables en :
- **PDF** (impression)
- **Excel** (analyse)

## Bonnes pratiques quotidiennes

### Le matin
- Vérifier les alertes du tableau de bord
- Consulter les péremptions urgentes
- Préparer les commandes fournisseurs

### En continu
- Utiliser systématiquement la caisse (pas de vente "à la main")
- Saisir le numéro de lot ET la péremption pour CHAQUE entrée
- Lier les ventes aux clients quand c'est possible
- Photographier les ordonnances stupéfiants

### Le soir
- Clôturer la caisse
- Vérifier le rapport du jour
- Sauvegarder (si manuel)

## Support

En cas de problème :
1. Notez le message d'erreur exact
2. Notez l'heure de l'incident
3. Contactez l'administrateur système

## Raccourcis clavier

- `F1` : Aide
- `F2` : Rechercher un produit (caisse)
- `F3` : Nouveau client
- `F12` : Encaisser
- `Échap` : Annuler / Fermer modal

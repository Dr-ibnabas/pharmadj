import { z } from 'zod';

// ============================================
// AUTHENTIFICATION
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const changerMotDePasseSchema = z.object({
  ancienMotDePasse: z.string(),
  nouveauMotDePasse: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[a-z]/, 'Au moins une minuscule')
    .regex(/[0-9]/, 'Au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial'),
});

// ============================================
// UTILISATEURS
// ============================================

export const RoleEnum = z.enum([
  'ADMIN',
  'PHARMACIEN_TITULAIRE',
  'PHARMACIEN_ADJOINT',
  'PREPARATEUR',
  'CAISSIER',
]);

export const utilisateurSchema = z.object({
  email: z.string().email(),
  nom: z.string().min(2),
  prenom: z.string().min(2),
  telephone: z.string().optional(),
  role: RoleEnum,
  motDePasse: z.string().min(8),
});

export type UtilisateurInput = z.infer<typeof utilisateurSchema>;

// ============================================
// PRODUITS
// ============================================

export const FormeGaleniqueEnum = z.enum([
  'COMPRIME',
  'GELULE',
  'SIROP',
  'POMMADE',
  'CREME',
  'GEL',
  'INJECTABLE',
  'SUPPOSITOIRE',
  'GOUTTES',
  'SPRAY',
  'PATCH',
  'POUDRE',
  'AUTRE',
]);

export const StatutProduitEnum = z.enum([
  'VENTE_LIBRE',
  'SUR_ORDONNANCE',
  'STUPEFIANT',
  'LISTE_I',
  'LISTE_II',
]);

export const produitSchema = z.object({
  codeBarres: z.string().optional(),
  nomCommercial: z.string().min(1, 'Nom commercial requis'),
  dci: z.string().optional(),
  dosage: z.string().optional(),
  formeGalenique: FormeGaleniqueEnum,
  conditionnement: z.string().optional(),
  laboratoireId: z.string().uuid().optional(),
  familleId: z.string().uuid().optional(),
  classeATC: z.string().optional(),
  statut: StatutProduitEnum.default('VENTE_LIBRE'),
  produitFroid: z.boolean().default(false),
  prixAchatHT: z.number().positive('Prix d\'achat doit être positif'),
  tauxTVA: z.number().min(0).max(100).default(0),
  prixVenteTTC: z.number().positive('Prix de vente doit être positif'),
  stockMinimum: z.number().int().min(0).default(0),
  stockMaximum: z.number().int().positive().optional(),
  pointCommande: z.number().int().min(0).default(0),
  emplacement: z.string().optional(),
});

export type ProduitInput = z.infer<typeof produitSchema>;

// ============================================
// LOTS
// ============================================

export const lotSchema = z.object({
  produitId: z.string().uuid(),
  numeroLot: z.string().min(1),
  quantiteInitiale: z.number().int().positive(),
  datePeremption: z.coerce.date(),
  prixAchatLot: z.number().positive(),
});

export type LotInput = z.infer<typeof lotSchema>;

// ============================================
// VENTES
// ============================================

export const ModePaiementEnum = z.enum([
  'ESPECES',
  'CARTE_BANCAIRE',
  'D_MONEY',
  'WAAFI',
  'CREDIT_CLIENT',
  'TIERS_PAYANT',
  'CHEQUE',
  'VIREMENT',
]);

export const ligneVenteSchema = z.object({
  produitId: z.string().uuid(),
  lotId: z.string().uuid().optional(),
  quantite: z.number().int().positive(),
  prixUnitaireTTC: z.number().positive(),
  tauxTVA: z.number().min(0).max(100),
  remise: z.number().min(0).default(0),
});

export const paiementSchema = z.object({
  mode: ModePaiementEnum,
  montant: z.number().positive(),
  reference: z.string().optional(),
});

export const venteSchema = z.object({
  clientId: z.string().uuid().optional(),
  ordonnanceId: z.string().uuid().optional(),
  lignes: z.array(ligneVenteSchema).min(1, 'Au moins une ligne requise'),
  paiements: z.array(paiementSchema).min(1, 'Au moins un paiement requis'),
  notes: z.string().optional(),
});

export type VenteInput = z.infer<typeof venteSchema>;
export type LigneVenteInput = z.infer<typeof ligneVenteSchema>;
export type PaiementInput = z.infer<typeof paiementSchema>;

// ============================================
// CLIENTS
// ============================================

export const SexeEnum = z.enum(['HOMME', 'FEMME']);

export const clientSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  dateNaissance: z.coerce.date().optional(),
  sexe: SexeEnum.optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  poids: z.number().positive().optional(),
  taille: z.number().positive().optional(),
  groupeSanguin: z.string().optional(),
  allergies: z.string().optional(),
  pathologiesChroniques: z.string().optional(),
  traitementsEnCours: z.string().optional(),
  notes: z.string().optional(),
  carteCNSS: z.string().optional(),
  mutuelleId: z.string().uuid().optional(),
  numeroAdherent: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

// ============================================
// FOURNISSEURS
// ============================================

export const fournisseurSchema = z.object({
  raisonSociale: z.string().min(1),
  nif: z.string().optional(),
  rccm: z.string().optional(),
  contactPrincipal: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().default('Djibouti'),
  conditionsPaiement: z.string().optional(),
  delaiLivraison: z.number().int().positive().optional(),
});

export type FournisseurInput = z.infer<typeof fournisseurSchema>;

// ============================================
// COMMANDES ACHAT
// ============================================

export const ligneCommandeSchema = z.object({
  produitId: z.string().uuid(),
  quantiteCommandee: z.number().int().positive(),
  prixUnitaireHT: z.number().positive(),
  tauxTVA: z.number().min(0).max(100),
});

export const commandeAchatSchema = z.object({
  fournisseurId: z.string().uuid(),
  dateLivraisonPrevue: z.coerce.date().optional(),
  lignes: z.array(ligneCommandeSchema).min(1),
  notes: z.string().optional(),
});

export type CommandeAchatInput = z.infer<typeof commandeAchatSchema>;

// ============================================
// ORDONNANCES
// ============================================

export const ordonnanceSchema = z.object({
  clientId: z.string().uuid(),
  prescripteurId: z.string().uuid().optional(),
  dateOrdonnance: z.coerce.date(),
  dateValidite: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type OrdonnanceInput = z.infer<typeof ordonnanceSchema>;

// ============================================
// RÉPONSES API
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ============================================
// UTILITAIRES
// ============================================

export const formatFDJ = (montant: number): string => {
  return new Intl.NumberFormat('fr-DJ', {
    style: 'currency',
    currency: 'DJF',
    minimumFractionDigits: 0,
  }).format(montant);
};

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

export const formatDateTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

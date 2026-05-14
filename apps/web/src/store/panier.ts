import { create } from 'zustand';

export interface Produit {
  id: string;
  codeInterne: string;
  nomCommercial: string;
  dci?: string;
  dosage?: string;
  prixVenteTTC: number;
  tauxTVA: number;
  stockTotal?: number;
  statut: string;
}

export interface LignePanier {
  produit: Produit;
  quantite: number;
  remise: number;
}

interface PanierState {
  lignes: LignePanier[];
  clientId: string | null;
  ordonnanceId: string | null;
  remiseGlobale: number;
  ajouter: (produit: Produit, quantite?: number) => void;
  retirer: (produitId: string) => void;
  modifierQuantite: (produitId: string, quantite: number) => void;
  modifierRemise: (produitId: string, remise: number) => void;
  vider: () => void;
  setClient: (id: string | null) => void;
  setOrdonnance: (id: string | null) => void;
  setRemiseGlobale: (montant: number) => void;
  totalHT: () => number;
  totalTVA: () => number;
  totalTTC: () => number;
  nombreArticles: () => number;
}

export const usePanierStore = create<PanierState>((set, get) => ({
  lignes: [],
  clientId: null,
  ordonnanceId: null,
  remiseGlobale: 0,

  ajouter: (produit, quantite = 1) => {
    set((state) => {
      const existante = state.lignes.find((l) => l.produit.id === produit.id);
      if (existante) {
        return {
          lignes: state.lignes.map((l) =>
            l.produit.id === produit.id
              ? { ...l, quantite: l.quantite + quantite }
              : l
          ),
        };
      }
      return { lignes: [...state.lignes, { produit, quantite, remise: 0 }] };
    });
  },

  retirer: (produitId) => {
    set((state) => ({
      lignes: state.lignes.filter((l) => l.produit.id !== produitId),
    }));
  },

  modifierQuantite: (produitId, quantite) => {
    if (quantite <= 0) {
      get().retirer(produitId);
      return;
    }
    set((state) => ({
      lignes: state.lignes.map((l) =>
        l.produit.id === produitId ? { ...l, quantite } : l
      ),
    }));
  },

  modifierRemise: (produitId, remise) => {
    set((state) => ({
      lignes: state.lignes.map((l) =>
        l.produit.id === produitId ? { ...l, remise: Math.max(0, remise) } : l
      ),
    }));
  },

  vider: () => set({ lignes: [], clientId: null, ordonnanceId: null, remiseGlobale: 0 }),
  setClient: (id) => set({ clientId: id }),
  setOrdonnance: (id) => set({ ordonnanceId: id }),
  setRemiseGlobale: (montant) => set({ remiseGlobale: Math.max(0, montant) }),

  totalHT: () => {
    const { lignes, remiseGlobale } = get();
    const total = lignes.reduce((sum, l) => {
      const ttc = l.produit.prixVenteTTC * l.quantite - l.remise;
      const ht = ttc / (1 + l.produit.tauxTVA / 100);
      return sum + ht;
    }, 0);
    return Math.max(0, total - remiseGlobale / (1 + 0));
  },

  totalTVA: () => {
    const { lignes } = get();
    return lignes.reduce((sum, l) => {
      const ttc = l.produit.prixVenteTTC * l.quantite - l.remise;
      const ht = ttc / (1 + l.produit.tauxTVA / 100);
      return sum + (ttc - ht);
    }, 0);
  },

  totalTTC: () => {
    const { lignes, remiseGlobale } = get();
    const total = lignes.reduce((sum, l) => {
      return sum + (l.produit.prixVenteTTC * l.quantite - l.remise);
    }, 0);
    return Math.max(0, total - remiseGlobale);
  },

  nombreArticles: () => get().lignes.reduce((sum, l) => sum + l.quantite, 0),
}));

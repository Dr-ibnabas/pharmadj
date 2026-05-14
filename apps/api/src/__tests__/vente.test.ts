import { describe, it, expect } from 'vitest';

/**
 * Tests pour les calculs de vente : remises, TVA, multi-paiements
 */
describe('Calculs de vente', () => {
  interface LigneVente {
    quantite: number;
    prixUnitaire: number;
    remisePct?: number;
    tauxTva: number;
  }

  function calculerLigne(ligne: LigneVente) {
    const sousTotal = ligne.quantite * ligne.prixUnitaire;
    const montantRemise = sousTotal * ((ligne.remisePct || 0) / 100);
    const totalHT = sousTotal - montantRemise;
    const tva = totalHT * (ligne.tauxTva / 100);
    const totalTTC = totalHT + tva;
    return { sousTotal, montantRemise, totalHT, tva, totalTTC };
  }

  function calculerVente(lignes: LigneVente[], remiseGlobalePct = 0) {
    const totaux = lignes.reduce(
      (acc, ligne) => {
        const calc = calculerLigne(ligne);
        return {
          totalHT: acc.totalHT + calc.totalHT,
          totalTVA: acc.totalTVA + calc.tva,
          totalTTC: acc.totalTTC + calc.totalTTC,
        };
      },
      { totalHT: 0, totalTVA: 0, totalTTC: 0 }
    );

    const remiseGlobale = totaux.totalTTC * (remiseGlobalePct / 100);
    const aPayer = totaux.totalTTC - remiseGlobale;

    return { ...totaux, remiseGlobale, aPayer };
  }

  it('calcule correctement une ligne sans remise', () => {
    const calc = calculerLigne({
      quantite: 2,
      prixUnitaire: 1000,
      tauxTva: 10,
    });
    expect(calc.sousTotal).toBe(2000);
    expect(calc.totalHT).toBe(2000);
    expect(calc.tva).toBe(200);
    expect(calc.totalTTC).toBe(2200);
  });

  it('applique correctement une remise par ligne', () => {
    const calc = calculerLigne({
      quantite: 1,
      prixUnitaire: 1000,
      remisePct: 10,
      tauxTva: 10,
    });
    expect(calc.montantRemise).toBe(100);
    expect(calc.totalHT).toBe(900);
    expect(calc.tva).toBe(90);
    expect(calc.totalTTC).toBe(990);
  });

  it('calcule le total d\'une vente multi-lignes', () => {
    const vente = calculerVente([
      { quantite: 2, prixUnitaire: 500, tauxTva: 10 },
      { quantite: 1, prixUnitaire: 1000, tauxTva: 10 },
    ]);
    expect(vente.totalHT).toBe(2000);
    expect(vente.totalTVA).toBe(200);
    expect(vente.totalTTC).toBe(2200);
    expect(vente.aPayer).toBe(2200);
  });

  it('applique une remise globale', () => {
    const vente = calculerVente(
      [{ quantite: 1, prixUnitaire: 10000, tauxTva: 10 }],
      5
    );
    expect(vente.totalTTC).toBe(11000);
    expect(vente.remiseGlobale).toBe(550);
    expect(vente.aPayer).toBe(10450);
  });
});

describe('Calculs de monnaie', () => {
  function calculerRendu(aPayer: number, recu: number): number {
    if (recu < aPayer) {
      throw new Error('Montant reçu insuffisant');
    }
    return recu - aPayer;
  }

  it('calcule le rendu correctement', () => {
    expect(calculerRendu(2200, 5000)).toBe(2800);
    expect(calculerRendu(1000, 1000)).toBe(0);
  });

  it('rejette un paiement insuffisant', () => {
    expect(() => calculerRendu(2000, 1500)).toThrow('Montant reçu insuffisant');
  });
});

describe('Multi-paiements', () => {
  interface Paiement {
    mode: string;
    montant: number;
  }

  function valideMultiPaiement(aPayer: number, paiements: Paiement[]): boolean {
    const total = paiements.reduce((sum, p) => sum + p.montant, 0);
    return Math.abs(total - aPayer) < 0.01;
  }

  it('valide un paiement unique', () => {
    expect(valideMultiPaiement(2000, [{ mode: 'ESPECES', montant: 2000 }])).toBe(true);
  });

  it('valide un paiement combiné espèces + mobile money', () => {
    const valide = valideMultiPaiement(5000, [
      { mode: 'ESPECES', montant: 2000 },
      { mode: 'D_MONEY', montant: 3000 },
    ]);
    expect(valide).toBe(true);
  });

  it('rejette un paiement incomplet', () => {
    const valide = valideMultiPaiement(5000, [
      { mode: 'ESPECES', montant: 2000 },
      { mode: 'D_MONEY', montant: 1000 },
    ]);
    expect(valide).toBe(false);
  });
});

describe('Tiers payant - calcul part patient/organisme', () => {
  function calculerPartTiersPayant(
    montantTotal: number,
    tauxPriseEnCharge: number
  ): { partOrganisme: number; partPatient: number } {
    const partOrganisme = Math.round(montantTotal * (tauxPriseEnCharge / 100));
    const partPatient = montantTotal - partOrganisme;
    return { partOrganisme, partPatient };
  }

  it('calcule la part CNSS à 80%', () => {
    const { partOrganisme, partPatient } = calculerPartTiersPayant(10000, 80);
    expect(partOrganisme).toBe(8000);
    expect(partPatient).toBe(2000);
  });

  it('calcule la part mutuelle à 100%', () => {
    const { partOrganisme, partPatient } = calculerPartTiersPayant(5000, 100);
    expect(partOrganisme).toBe(5000);
    expect(partPatient).toBe(0);
  });

  it('gère les arrondis correctement', () => {
    const { partOrganisme, partPatient } = calculerPartTiersPayant(333, 70);
    expect(partOrganisme + partPatient).toBe(333);
  });
});

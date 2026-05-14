import { describe, it, expect } from 'vitest';

/**
 * Tests pour la logique FEFO (First Expired First Out)
 * Garantit que les lots les plus proches de la péremption sortent en premier
 */
describe('Logique FEFO (First Expired First Out)', () => {
  interface Lot {
    id: string;
    datePeremption: Date;
    quantite: number;
  }

  function trierFEFO(lots: Lot[]): Lot[] {
    return [...lots].sort((a, b) => 
      a.datePeremption.getTime() - b.datePeremption.getTime()
    );
  }

  function consommerStock(lots: Lot[], quantiteVoulue: number): Lot[] {
    const lotsTries = trierFEFO(lots);
    const sortie: Lot[] = [];
    let restant = quantiteVoulue;

    for (const lot of lotsTries) {
      if (restant <= 0) break;
      const aPrendre = Math.min(lot.quantite, restant);
      sortie.push({ ...lot, quantite: aPrendre });
      restant -= aPrendre;
    }

    if (restant > 0) {
      throw new Error('Stock insuffisant');
    }

    return sortie;
  }

  it('trie les lots par date de péremption croissante', () => {
    const lots: Lot[] = [
      { id: 'L3', datePeremption: new Date('2027-12-01'), quantite: 10 },
      { id: 'L1', datePeremption: new Date('2026-06-01'), quantite: 5 },
      { id: 'L2', datePeremption: new Date('2027-01-01'), quantite: 20 },
    ];

    const tries = trierFEFO(lots);
    expect(tries[0].id).toBe('L1');
    expect(tries[1].id).toBe('L2');
    expect(tries[2].id).toBe('L3');
  });

  it('consomme le lot le plus proche de la péremption en premier', () => {
    const lots: Lot[] = [
      { id: 'L1', datePeremption: new Date('2026-06-01'), quantite: 5 },
      { id: 'L2', datePeremption: new Date('2027-01-01'), quantite: 20 },
    ];

    const sortie = consommerStock(lots, 3);
    expect(sortie.length).toBe(1);
    expect(sortie[0].id).toBe('L1');
    expect(sortie[0].quantite).toBe(3);
  });

  it('utilise plusieurs lots si nécessaire', () => {
    const lots: Lot[] = [
      { id: 'L1', datePeremption: new Date('2026-06-01'), quantite: 5 },
      { id: 'L2', datePeremption: new Date('2027-01-01'), quantite: 20 },
    ];

    const sortie = consommerStock(lots, 10);
    expect(sortie.length).toBe(2);
    expect(sortie[0].id).toBe('L1');
    expect(sortie[0].quantite).toBe(5);
    expect(sortie[1].id).toBe('L2');
    expect(sortie[1].quantite).toBe(5);
  });

  it('lève une erreur si stock insuffisant', () => {
    const lots: Lot[] = [
      { id: 'L1', datePeremption: new Date('2026-06-01'), quantite: 5 },
    ];

    expect(() => consommerStock(lots, 10)).toThrow('Stock insuffisant');
  });
});

describe('Calculs de péremption', () => {
  function joursAvantPeremption(date: Date): number {
    const maintenant = new Date();
    const diff = date.getTime() - maintenant.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function statutPeremption(date: Date): string {
    const jours = joursAvantPeremption(date);
    if (jours < 0) return 'PERIME';
    if (jours < 30) return 'CRITIQUE';
    if (jours < 90) return 'ATTENTION';
    return 'OK';
  }

  it('détecte un produit périmé', () => {
    const dateHier = new Date();
    dateHier.setDate(dateHier.getDate() - 1);
    expect(statutPeremption(dateHier)).toBe('PERIME');
  });

  it('détecte une péremption critique (< 30 jours)', () => {
    const dans15Jours = new Date();
    dans15Jours.setDate(dans15Jours.getDate() + 15);
    expect(statutPeremption(dans15Jours)).toBe('CRITIQUE');
  });

  it('détecte une péremption proche (< 90 jours)', () => {
    const dans60Jours = new Date();
    dans60Jours.setDate(dans60Jours.getDate() + 60);
    expect(statutPeremption(dans60Jours)).toBe('ATTENTION');
  });

  it('détecte un produit OK (> 90 jours)', () => {
    const dans6Mois = new Date();
    dans6Mois.setMonth(dans6Mois.getMonth() + 6);
    expect(statutPeremption(dans6Mois)).toBe('OK');
  });
});

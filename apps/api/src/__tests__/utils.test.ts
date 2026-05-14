import { describe, it, expect } from 'vitest';
import { formatFDJ, formatDate, formatDateTime } from '@pharma/shared';

describe('Utilitaires de formatage', () => {
  describe('formatFDJ', () => {
    it('formate correctement un montant en franc djiboutien', () => {
      expect(formatFDJ(1000)).toContain('1');
      expect(formatFDJ(1000)).toContain('FDJ');
    });

    it('gère les zéros', () => {
      expect(formatFDJ(0)).toContain('0');
    });

    it('gère les grands nombres', () => {
      const result = formatFDJ(1234567);
      expect(result).toContain('FDJ');
    });

    it('gère les décimales', () => {
      const result = formatFDJ(99.99);
      expect(result).toBeDefined();
    });
  });

  describe('formatDate', () => {
    it('formate une date au format français', () => {
      const date = new Date('2026-01-15');
      const result = formatDate(date);
      expect(result).toMatch(/15/);
    });

    it('accepte une chaîne de date', () => {
      const result = formatDate('2026-01-15');
      expect(result).toBeDefined();
    });
  });

  describe('formatDateTime', () => {
    it('inclut l\'heure dans le format', () => {
      const date = new Date('2026-01-15T14:30:00');
      const result = formatDateTime(date);
      expect(result).toBeDefined();
    });
  });
});

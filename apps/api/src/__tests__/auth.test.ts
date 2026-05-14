import { describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Service Authentification', () => {
  describe('Hashage des mots de passe', () => {
    it('hash un mot de passe avec bcrypt', async () => {
      const password = 'Test@2026';
      const hash = await bcrypt.hash(password, 12);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('vérifie un mot de passe correctement', async () => {
      const password = 'Test@2026';
      const hash = await bcrypt.hash(password, 12);
      const valide = await bcrypt.compare(password, hash);
      expect(valide).toBe(true);
    });

    it('rejette un mauvais mot de passe', async () => {
      const password = 'Test@2026';
      const hash = await bcrypt.hash(password, 12);
      const valide = await bcrypt.compare('Mauvais@2026', hash);
      expect(valide).toBe(false);
    });
  });

  describe('JWT', () => {
    const SECRET = 'test-secret-key-for-tests-only';

    it('génère un token JWT valide', () => {
      const payload = { userId: '123', role: 'CAISSIER' };
      const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
      expect(token).toBeDefined();
      expect(token.split('.').length).toBe(3);
    });

    it('vérifie un token JWT valide', () => {
      const payload = { userId: '123', role: 'CAISSIER' };
      const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, SECRET) as any;
      expect(decoded.userId).toBe('123');
      expect(decoded.role).toBe('CAISSIER');
    });

    it('rejette un token avec mauvais secret', () => {
      const payload = { userId: '123' };
      const token = jwt.sign(payload, SECRET, { expiresIn: '1h' });
      expect(() => jwt.verify(token, 'mauvais-secret')).toThrow();
    });

    it('rejette un token expiré', () => {
      const payload = { userId: '123' };
      const token = jwt.sign(payload, SECRET, { expiresIn: '-1h' });
      expect(() => jwt.verify(token, SECRET)).toThrow();
    });
  });
});

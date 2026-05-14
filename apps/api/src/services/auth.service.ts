import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@pharma/database';
import { config } from '../config';
import { generateTokens } from '../middleware/auth';
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from '../utils/errors';
import { logger } from '../utils/logger';

const MAX_TENTATIVES = 5;
const DUREE_BLOCAGE_MS = 30 * 60 * 1000;

export class AuthService {
  static async login(email: string, motDePasse: string, ipAddress?: string) {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!utilisateur) {
      logger.warn('Tentative login avec email inconnu', { email, ipAddress });
      throw new AuthenticationError('Email ou mot de passe incorrect');
    }

    if (!utilisateur.actif) {
      throw new AuthenticationError('Compte désactivé. Contactez l\'administrateur.');
    }

    if (utilisateur.bloqueJusqu && utilisateur.bloqueJusqu > new Date()) {
      const minutesRestantes = Math.ceil(
        (utilisateur.bloqueJusqu.getTime() - Date.now()) / 60000
      );
      throw new AuthenticationError(
        `Compte temporairement bloqué. Réessayez dans ${minutesRestantes} minutes.`
      );
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);

    if (!motDePasseValide) {
      const tentatives = utilisateur.tentativesEchouees + 1;
      const updates: { tentativesEchouees: number; bloqueJusqu?: Date } = {
        tentativesEchouees: tentatives,
      };

      if (tentatives >= MAX_TENTATIVES) {
        updates.bloqueJusqu = new Date(Date.now() + DUREE_BLOCAGE_MS);
        logger.warn('Compte bloqué après tentatives échouées', { email, tentatives });
      }

      await prisma.utilisateur.update({
        where: { id: utilisateur.id },
        data: updates,
      });

      throw new AuthenticationError('Email ou mot de passe incorrect');
    }

    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: {
        tentativesEchouees: 0,
        bloqueJusqu: null,
        derniereConnexion: new Date(),
      },
    });

    const { accessToken, refreshToken } = generateTokens({
      userId: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
    });

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        utilisateurId: utilisateur.id,
        expiresAt: refreshExpiresAt,
      },
    });

    logger.info('Connexion réussie', { email, role: utilisateur.role });

    return {
      accessToken,
      refreshToken,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
      },
    };
  }

  static async refresh(refreshToken: string) {
    let payload: { userId: string };
    
    try {
      payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
    } catch {
      throw new AuthenticationError('Refresh token invalide');
    }

    const tokenEnBase = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { utilisateur: true },
    });

    if (!tokenEnBase || tokenEnBase.revokedAt || tokenEnBase.expiresAt < new Date()) {
      throw new AuthenticationError('Refresh token invalide ou expiré');
    }

    const tokens = generateTokens({
      userId: tokenEnBase.utilisateur.id,
      email: tokenEnBase.utilisateur.email,
      role: tokenEnBase.utilisateur.role,
    });

    await prisma.refreshToken.update({
      where: { id: tokenEnBase.id },
      data: { revokedAt: new Date() },
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        utilisateurId: tokenEnBase.utilisateur.id,
        expiresAt,
      },
    });

    return tokens;
  }

  static async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  static async changerMotDePasse(
    userId: string,
    ancienMotDePasse: string,
    nouveauMotDePasse: string
  ) {
    const utilisateur = await prisma.utilisateur.findUnique({ where: { id: userId } });
    if (!utilisateur) throw new NotFoundError('Utilisateur introuvable');

    const valide = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);
    if (!valide) throw new ValidationError('Ancien mot de passe incorrect');

    const memeMotDePasse = await bcrypt.compare(nouveauMotDePasse, utilisateur.motDePasse);
    if (memeMotDePasse) {
      throw new ValidationError('Le nouveau mot de passe doit être différent');
    }

    const hash = await bcrypt.hash(nouveauMotDePasse, config.bcrypt.cost);
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 90);

    await prisma.utilisateur.update({
      where: { id: userId },
      data: {
        motDePasse: hash,
        dateExpirationMdp: expiration,
      },
    });

    await prisma.refreshToken.updateMany({
      where: { utilisateurId: userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    logger.info('Mot de passe modifié', { userId });
  }
}

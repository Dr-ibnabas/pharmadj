import { Request, Response, NextFunction } from 'express';
import { prisma } from '@pharma/database';
import { logger } from '../utils/logger';

const ACTIONS_SENSIBLES = [
  'POST', 'PUT', 'PATCH', 'DELETE'
];

const ROUTES_SENSIBLES = [
  '/auth/login',
  '/auth/logout',
  '/utilisateurs',
  '/produits',
  '/lots',
  '/ventes',
  '/ordonnances',
  '/clients',
  '/configuration',
];

export const auditLog = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const isSensitive = 
      ACTIONS_SENSIBLES.includes(req.method) ||
      ROUTES_SENSIBLES.some((route) => req.path.includes(route));

    if (isSensitive && req.user) {
      const entite = req.path.split('/')[2] || 'unknown';
      const action = `${req.method} ${req.path}`;
      
      await prisma.journalAudit.create({
        data: {
          utilisateurId: req.user.userId,
          action,
          entite,
          entiteId: req.params.id || null,
          details: {
            method: req.method,
            path: req.path,
            body: sanitizeBody(req.body),
            query: req.query,
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent') || null,
        },
      });
    }
  } catch (err) {
    logger.error('Erreur lors de l\'enregistrement audit', { error: err });
  }
  next();
};

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const sanitized = { ...body as Record<string, unknown> };
  const sensitiveFields = ['motDePasse', 'password', 'token', 'refreshToken'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }
  return sanitized;
}

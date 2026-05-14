import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error';
import { auditLog } from './middleware/audit';

import authRoutes from './routes/auth.routes';
import produitsRoutes from './routes/produits.routes';
import ventesRoutes from './routes/ventes.routes';
import stockRoutes from './routes/stock.routes';
import clientsRoutes from './routes/clients.routes';
import achatsRoutes from './routes/achats.routes';
import ordonnancesRoutes from './routes/ordonnances.routes';
import referencesRoutes from './routes/references.routes';
import dashboardRoutes from './routes/dashboard.routes';

export const createApp = (): Express => {
  const app = express();

  // Sécurité
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  
  app.use(cors(config.cors));
  app.use(compression());

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Trop de requêtes, réessayez dans quelques instants',
      },
    },
  });
  app.use('/api', limiter);

  // Audit log
  app.use('/api', auditLog);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        env: config.env,
        version: '1.0.0',
      },
    });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/produits', produitsRoutes);
  app.use('/api/ventes', ventesRoutes);
  app.use('/api/stock', stockRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/achats', achatsRoutes);
  app.use('/api/ordonnances', ordonnancesRoutes);
  app.use('/api/references', referencesRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 404 et erreurs
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const startServer = async () => {
  try {
    validateConfig();
    
    const app = createApp();

    app.listen(config.port, config.host, () => {
      logger.info(`🚀 API démarrée sur http://${config.host}:${config.port}`);
      logger.info(`📊 Environnement : ${config.env}`);
      logger.info(`🔍 Health check : http://${config.host}:${config.port}/api/health`);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM reçu, arrêt en cours...');
      process.exit(0);
    });
  } catch (err) {
    logger.error('Erreur au démarrage du serveur', { error: err });
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

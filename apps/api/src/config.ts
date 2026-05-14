import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.API_PORT || '3000', 10),
  host: process.env.API_HOST || '0.0.0.0',

  database: {
    url: process.env.DATABASE_URL!,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  bcrypt: {
    cost: parseInt(process.env.BCRYPT_COST || '12', 10),
  },

  pharmacie: {
    nom: process.env.PHARMACIE_NOM || 'Pharmacie',
    adresse: process.env.PHARMACIE_ADRESSE || '',
    telephone: process.env.PHARMACIE_TELEPHONE || '',
    email: process.env.PHARMACIE_EMAIL || '',
    devise: process.env.DEVISE || 'FDJ',
    tvaDefaut: parseFloat(process.env.TVA_DEFAUT || '0'),
  },

  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CORS_ORIGIN?.split(',') || []
      : true,
    credentials: true,
  },

  rateLimit: {
    windowMs: 60 * 1000,
    max: 100,
  },

  upload: {
    maxFileSize: 5 * 1024 * 1024,
    uploadDir: path.resolve(__dirname, '../../uploads'),
  },
};

export const validateConfig = () => {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length > 0 && config.env === 'production') {
    throw new Error(`Variables d'environnement manquantes : ${missing.join(', ')}`);
  }
};

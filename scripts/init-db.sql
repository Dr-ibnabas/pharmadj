-- Script d'initialisation PostgreSQL pour PharmaDJ
-- Ce script est exécuté automatiquement au premier démarrage du container

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configuration locale
SET timezone = 'Africa/Djibouti';

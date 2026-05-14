import { Router } from 'express';
import { prisma } from '@pharma/database';
import { authenticate, authorize } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

// FAMILLES
router.get('/familles', async (_req, res, next) => {
  try {
    const familles = await prisma.familleProduit.findMany({
      orderBy: { nom: 'asc' },
    });
    res.json({ success: true, data: familles });
  } catch (err) {
    next(err);
  }
});

router.post('/familles', authorize('ADMIN', 'PHARMACIEN_TITULAIRE'), async (req, res, next) => {
  try {
    const schema = z.object({
      code: z.string().min(2),
      nom: z.string().min(2),
      description: z.string().optional(),
      parentId: z.string().uuid().optional(),
    });
    const data = schema.parse(req.body);
    const famille = await prisma.familleProduit.create({ data });
    res.status(201).json({ success: true, data: famille });
  } catch (err) {
    next(err);
  }
});

// LABORATOIRES
router.get('/laboratoires', async (_req, res, next) => {
  try {
    const laboratoires = await prisma.laboratoire.findMany({
      orderBy: { nom: 'asc' },
    });
    res.json({ success: true, data: laboratoires });
  } catch (err) {
    next(err);
  }
});

router.post('/laboratoires', authorize('ADMIN', 'PHARMACIEN_TITULAIRE'), async (req, res, next) => {
  try {
    const schema = z.object({
      nom: z.string().min(1),
      pays: z.string().optional(),
      contact: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      telephone: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const labo = await prisma.laboratoire.create({ data });
    res.status(201).json({ success: true, data: labo });
  } catch (err) {
    next(err);
  }
});

// MUTUELLES
router.get('/mutuelles', async (_req, res, next) => {
  try {
    const mutuelles = await prisma.mutuelle.findMany({
      orderBy: { nom: 'asc' },
    });
    res.json({ success: true, data: mutuelles });
  } catch (err) {
    next(err);
  }
});

router.post('/mutuelles', authorize('ADMIN', 'PHARMACIEN_TITULAIRE'), async (req, res, next) => {
  try {
    const schema = z.object({
      nom: z.string().min(1),
      contact: z.string().optional(),
      telephone: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      adresse: z.string().optional(),
      tauxPriseEnCharge: z.number().min(0).max(100),
      conventionne: z.boolean().default(true),
    });
    const data = schema.parse(req.body);
    const mutuelle = await prisma.mutuelle.create({ data });
    res.status(201).json({ success: true, data: mutuelle });
  } catch (err) {
    next(err);
  }
});

// CONFIGURATION
router.get('/configuration', async (_req, res, next) => {
  try {
    const configs = await prisma.configuration.findMany();
    const configMap = configs.reduce((acc, c) => {
      acc[c.cle] = c.valeur;
      return acc;
    }, {} as Record<string, string>);
    res.json({ success: true, data: configMap });
  } catch (err) {
    next(err);
  }
});

router.put('/configuration/:cle', authorize('ADMIN'), async (req, res, next) => {
  try {
    const schema = z.object({ valeur: z.string() });
    const { valeur } = schema.parse(req.body);
    const config = await prisma.configuration.upsert({
      where: { cle: req.params.cle },
      update: { valeur },
      create: { cle: req.params.cle, valeur },
    });
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from 'express';
import { prisma } from '@pharma/database';
import { authenticate, authorize } from '../middleware/auth';
import { ordonnanceSchema } from '@pharma/shared';
import { NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate);

async function genererNumeroOrdonnance(): Promise<string> {
  const annee = new Date().getFullYear();
  const count = await prisma.ordonnance.count({
    where: { dateOrdonnance: { gte: new Date(`${annee}-01-01`) } },
  });
  return `ORD-${annee}-${(count + 1).toString().padStart(5, '0')}`;
}

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const clientId = req.query.clientId as string;

    const where = clientId ? { clientId } : {};

    const [ordonnances, total] = await Promise.all([
      prisma.ordonnance.findMany({
        where,
        include: {
          client: { select: { nom: true, prenom: true, numeroClient: true } },
          prescripteur: true,
          _count: { select: { ventes: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateOrdonnance: 'desc' },
      }),
      prisma.ordonnance.count({ where }),
    ]);

    res.json({
      success: true,
      data: ordonnances,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        prescripteur: true,
        ventes: { include: { lignes: { include: { produit: true } } } },
      },
    });
    if (!ordonnance) throw new NotFoundError('Ordonnance introuvable');
    res.json({ success: true, data: ordonnance });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authorize('ADMIN', 'PHARMACIEN_TITULAIRE', 'PHARMACIEN_ADJOINT'),
  async (req, res, next) => {
    try {
      const data = ordonnanceSchema.parse(req.body);
      const numero = await genererNumeroOrdonnance();

      const ordonnance = await prisma.ordonnance.create({
        data: {
          ...data,
          numero,
          utilisateurId: req.user!.userId,
        },
        include: {
          client: true,
          prescripteur: true,
        },
      });
      res.status(201).json({ success: true, data: ordonnance });
    } catch (err) {
      next(err);
    }
  }
);

// PRESCRIPTEURS
router.get('/prescripteurs/liste', async (_req, res, next) => {
  try {
    const prescripteurs = await prisma.prescripteur.findMany({
      orderBy: { nom: 'asc' },
    });
    res.json({ success: true, data: prescripteurs });
  } catch (err) {
    next(err);
  }
});

export default router;

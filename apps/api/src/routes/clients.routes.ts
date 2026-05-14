import { Router } from 'express';
import { prisma } from '@pharma/database';
import { authenticate } from '../middleware/auth';
import { clientSchema } from '@pharma/shared';
import { NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate);

async function genererNumeroClient(): Promise<string> {
  const dernier = await prisma.client.findFirst({
    orderBy: { numeroClient: 'desc' },
    select: { numeroClient: true },
  });
  if (!dernier) return 'C0001';
  const num = parseInt(dernier.numeroClient.substring(1), 10) + 1;
  return `C${num.toString().padStart(4, '0')}`;
}

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const where = search
      ? {
          OR: [
            { nom: { contains: search, mode: 'insensitive' as const } },
            { prenom: { contains: search, mode: 'insensitive' as const } },
            { telephone: { contains: search } },
            { numeroClient: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: { mutuelle: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      success: true,
      data: clients,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        mutuelle: true,
        ventes: {
          take: 10,
          orderBy: { dateVente: 'desc' },
          include: { lignes: true },
        },
        ordonnances: {
          take: 10,
          orderBy: { dateOrdonnance: 'desc' },
          include: { prescripteur: true },
        },
      },
    });
    if (!client) throw new NotFoundError('Client introuvable');
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = clientSchema.parse(req.body);
    const numeroClient = await genererNumeroClient();
    const client = await prisma.client.create({
      data: { ...data, numeroClient },
      include: { mutuelle: true },
    });
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = clientSchema.partial().parse(req.body);
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data,
      include: { mutuelle: true },
    });
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
});

export default router;

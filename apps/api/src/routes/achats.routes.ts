import { Router } from 'express';
import { prisma } from '@pharma/database';
import { authenticate, authorize } from '../middleware/auth';
import { fournisseurSchema, commandeAchatSchema } from '@pharma/shared';
import { NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate);

// FOURNISSEURS
router.get('/fournisseurs', async (req, res, next) => {
  try {
    const search = req.query.search as string;
    const where = search
      ? {
          OR: [
            { raisonSociale: { contains: search, mode: 'insensitive' as const } },
            { contactPrincipal: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : { actif: true };

    const fournisseurs = await prisma.fournisseur.findMany({
      where,
      orderBy: { raisonSociale: 'asc' },
    });
    res.json({ success: true, data: fournisseurs });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/fournisseurs',
  authorize('ADMIN', 'PHARMACIEN_TITULAIRE', 'PHARMACIEN_ADJOINT'),
  async (req, res, next) => {
    try {
      const data = fournisseurSchema.parse(req.body);
      const fournisseur = await prisma.fournisseur.create({ data });
      res.status(201).json({ success: true, data: fournisseur });
    } catch (err) {
      next(err);
    }
  }
);

router.put('/fournisseurs/:id', authorize('ADMIN', 'PHARMACIEN_TITULAIRE'), async (req, res, next) => {
  try {
    const data = fournisseurSchema.partial().parse(req.body);
    const fournisseur = await prisma.fournisseur.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: fournisseur });
  } catch (err) {
    next(err);
  }
});

// COMMANDES ACHAT
async function genererNumeroCommande(): Promise<string> {
  const annee = new Date().getFullYear();
  const count = await prisma.commandeAchat.count({
    where: { dateCommande: { gte: new Date(`${annee}-01-01`) } },
  });
  return `BC-${annee}-${(count + 1).toString().padStart(4, '0')}`;
}

router.get('/commandes', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const statut = req.query.statut as string;

    const where = statut ? { statut: statut as any } : {};

    const [commandes, total] = await Promise.all([
      prisma.commandeAchat.findMany({
        where,
        include: {
          fournisseur: true,
          _count: { select: { lignes: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateCommande: 'desc' },
      }),
      prisma.commandeAchat.count({ where }),
    ]);

    res.json({
      success: true,
      data: commandes,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/commandes/:id', async (req, res, next) => {
  try {
    const commande = await prisma.commandeAchat.findUnique({
      where: { id: req.params.id },
      include: {
        fournisseur: true,
        lignes: { include: { produit: true } },
        receptions: { include: { lots: true } },
      },
    });
    if (!commande) throw new NotFoundError('Commande introuvable');
    res.json({ success: true, data: commande });
  } catch (err) {
    next(err);
  }
});

router.post('/commandes', authorize('ADMIN', 'PHARMACIEN_TITULAIRE', 'PHARMACIEN_ADJOINT'), async (req, res, next) => {
  try {
    const data = commandeAchatSchema.parse(req.body);
    const numero = await genererNumeroCommande();

    let totalHT = 0;
    let totalTVA = 0;

    const lignesAvecTotaux = data.lignes.map((l) => {
      const total = l.quantiteCommandee * l.prixUnitaireHT;
      const tva = total * (l.tauxTVA / 100);
      totalHT += total;
      totalTVA += tva;
      return { ...l, totalHT: total };
    });

    const commande = await prisma.commandeAchat.create({
      data: {
        numero,
        fournisseurId: data.fournisseurId,
        dateLivraisonPrevue: data.dateLivraisonPrevue,
        notes: data.notes,
        totalHT,
        totalTVA,
        totalTTC: totalHT + totalTVA,
        lignes: { create: lignesAvecTotaux },
      },
      include: {
        fournisseur: true,
        lignes: { include: { produit: true } },
      },
    });

    res.status(201).json({ success: true, data: commande });
  } catch (err) {
    next(err);
  }
});

export default router;

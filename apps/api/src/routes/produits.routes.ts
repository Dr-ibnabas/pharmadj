import { Router } from 'express';
import { ProduitService } from '../services/produit.service';
import { authenticate, authorize } from '../middleware/auth';
import { produitSchema } from '@pharma/shared';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const result = await ProduitService.lister({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      search: req.query.search as string,
      familleId: req.query.familleId as string,
      laboratoireId: req.query.laboratoireId as string,
      statut: req.query.statut as string,
      sortBy: (req.query.sortBy as string) || 'nomCommercial',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
    });
    res.json({ success: true, data: result.produits, meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    }});
  } catch (err) {
    next(err);
  }
});

router.get('/recherche', async (req, res, next) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const produits = await ProduitService.rechercheRapide(query, limit);
    res.json({ success: true, data: produits });
  } catch (err) {
    next(err);
  }
});

router.get('/statistiques', async (_req, res, next) => {
  try {
    const stats = await ProduitService.statistiques();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const produit = await ProduitService.obtenir(req.params.id);
    res.json({ success: true, data: produit });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authorize('ADMIN', 'PHARMACIEN_TITULAIRE', 'PHARMACIEN_ADJOINT'),
  async (req, res, next) => {
    try {
      const data = produitSchema.parse(req.body);
      const produit = await ProduitService.creer(data);
      res.status(201).json({ success: true, data: produit });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authorize('ADMIN', 'PHARMACIEN_TITULAIRE', 'PHARMACIEN_ADJOINT'),
  async (req, res, next) => {
    try {
      const data = produitSchema.partial().parse(req.body);
      const produit = await ProduitService.modifier(req.params.id, data);
      res.json({ success: true, data: produit });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authorize('ADMIN', 'PHARMACIEN_TITULAIRE'),
  async (req, res, next) => {
    try {
      await ProduitService.desactiver(req.params.id);
      res.json({ success: true, message: 'Produit désactivé' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

import { Router } from 'express';
import { StockService } from '../services/stock.service';
import { authenticate, authorize } from '../middleware/auth';
import { lotSchema } from '@pharma/shared';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

router.post(
  '/lots',
  authorize('ADMIN', 'PHARMACIEN_TITULAIRE', 'PHARMACIEN_ADJOINT', 'PREPARATEUR'),
  async (req, res, next) => {
    try {
      const data = lotSchema.parse(req.body);
      const lot = await StockService.creerLot({
        ...data,
        utilisateurId: req.user!.userId,
      });
      res.status(201).json({ success: true, data: lot });
    } catch (err) {
      next(err);
    }
  }
);

const ajusterSchema = z.object({
  produitId: z.string().uuid(),
  lotId: z.string().uuid(),
  nouvelleQuantite: z.number().int().min(0),
  motif: z.string().min(3),
});

router.post(
  '/ajuster',
  authorize('ADMIN', 'PHARMACIEN_TITULAIRE', 'PHARMACIEN_ADJOINT'),
  async (req, res, next) => {
    try {
      const data = ajusterSchema.parse(req.body);
      const lot = await StockService.ajusterStock({
        ...data,
        utilisateurId: req.user!.userId,
      });
      res.json({ success: true, data: lot });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/peremptions', async (req, res, next) => {
  try {
    const jours = parseInt(req.query.jours as string) || 90;
    const lots = await StockService.lotsBientotPerimes(jours);
    res.json({ success: true, data: lots });
  } catch (err) {
    next(err);
  }
});

router.get('/ruptures', async (_req, res, next) => {
  try {
    const produits = await StockService.produitsEnRupture();
    res.json({ success: true, data: produits });
  } catch (err) {
    next(err);
  }
});

router.get('/historique/:produitId', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const historique = await StockService.historique(req.params.produitId, limit);
    res.json({ success: true, data: historique });
  } catch (err) {
    next(err);
  }
});

export default router;

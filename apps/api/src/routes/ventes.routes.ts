import { Router } from 'express';
import { VenteService } from '../services/vente.service';
import { authenticate, authorize } from '../middleware/auth';
import { venteSchema } from '@pharma/shared';

const router = Router();

router.use(authenticate);

router.post('/', async (req, res, next) => {
  try {
    const data = venteSchema.parse(req.body);
    const vente = await VenteService.creer(data, req.user!.userId);
    res.status(201).json({ success: true, data: vente });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await VenteService.lister({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      dateDebut: req.query.dateDebut ? new Date(req.query.dateDebut as string) : undefined,
      dateFin: req.query.dateFin ? new Date(req.query.dateFin as string) : undefined,
      clientId: req.query.clientId as string,
      utilisateurId: req.query.utilisateurId as string,
      statut: req.query.statut as string,
    });
    res.json({
      success: true,
      data: result.ventes,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/statistiques/jour', async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const stats = await VenteService.statistiquesJour(date);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const vente = await VenteService.obtenir(req.params.id);
    res.json({ success: true, data: vente });
  } catch (err) {
    next(err);
  }
});

export default router;

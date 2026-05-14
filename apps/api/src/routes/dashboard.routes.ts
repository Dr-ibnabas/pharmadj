import { Router } from 'express';
import { prisma } from '@pharma/database';
import { authenticate } from '../middleware/auth';
import { VenteService } from '../services/vente.service';
import { StockService } from '../services/stock.service';
import { ProduitService } from '../services/produit.service';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (_req, res, next) => {
  try {
    const aujourdhui = new Date();
    const debut = new Date(aujourdhui.setHours(0, 0, 0, 0));
    const fin = new Date(aujourdhui.setHours(23, 59, 59, 999));

    const debutMois = new Date();
    debutMois.setDate(1);
    debutMois.setHours(0, 0, 0, 0);

    const [
      ventesAujourdhui,
      ventesMois,
      statsProduits,
      ruptures,
      peremptions,
      totalClients,
    ] = await Promise.all([
      VenteService.statistiquesJour(),
      prisma.vente.aggregate({
        where: { dateVente: { gte: debutMois }, statut: 'VALIDEE' },
        _sum: { totalTTC: true },
        _count: true,
      }),
      ProduitService.statistiques(),
      StockService.produitsEnRupture(),
      StockService.lotsBientotPerimes(30),
      prisma.client.count(),
    ]);

    res.json({
      success: true,
      data: {
        aujourdhui: ventesAujourdhui,
        mois: {
          totalTTC: Number(ventesMois._sum.totalTTC || 0),
          nombreVentes: ventesMois._count,
        },
        produits: statsProduits,
        alertes: {
          ruptures: ruptures.length,
          peremptionsProches: peremptions.length,
        },
        clients: { total: totalClients },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/top-produits', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const jours = parseInt(req.query.jours as string) || 30;
    
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - jours);

    const topProduits = await prisma.$queryRaw<
      Array<{ produit_id: string; nom: string; total_quantite: bigint; total_ca: number }>
    >`
      SELECT 
        lv.produit_id,
        p.nom_commercial as nom,
        SUM(lv.quantite)::bigint as total_quantite,
        SUM(lv.total_ttc)::numeric as total_ca
      FROM lignes_vente lv
      JOIN produits p ON p.id = lv.produit_id
      JOIN ventes v ON v.id = lv.vente_id
      WHERE v.date_vente >= ${dateDebut}
      AND v.statut = 'VALIDEE'
      GROUP BY lv.produit_id, p.nom_commercial
      ORDER BY total_ca DESC
      LIMIT ${limit}
    `;

    res.json({
      success: true,
      data: topProduits.map((p) => ({
        produitId: p.produit_id,
        nom: p.nom,
        quantite: Number(p.total_quantite),
        chiffreAffaires: Number(p.total_ca),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/ventes-par-jour', async (req, res, next) => {
  try {
    const jours = parseInt(req.query.jours as string) || 30;
    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - jours);

    const data = await prisma.$queryRaw<
      Array<{ jour: Date; total: number; nombre: bigint }>
    >`
      SELECT 
        DATE(date_vente) as jour,
        SUM(total_ttc)::numeric as total,
        COUNT(*)::bigint as nombre
      FROM ventes
      WHERE date_vente >= ${dateDebut}
      AND statut = 'VALIDEE'
      GROUP BY DATE(date_vente)
      ORDER BY jour ASC
    `;

    res.json({
      success: true,
      data: data.map((d) => ({
        jour: d.jour,
        total: Number(d.total),
        nombre: Number(d.nombre),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;

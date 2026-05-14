import { prisma } from '@pharma/database';
import { StockService } from './stock.service';
import { BusinessError, NotFoundError } from '../utils/errors';
import { TypeMouvement, type Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import type { VenteInput } from '@pharma/shared';

export class VenteService {
  static async genererNumero(): Promise<string> {
    const aujourdhui = new Date();
    const debut = new Date(aujourdhui.setHours(0, 0, 0, 0));
    const fin = new Date(aujourdhui.setHours(23, 59, 59, 999));

    const count = await prisma.vente.count({
      where: { dateVente: { gte: debut, lte: fin } },
    });

    const dateStr = new Date()
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '');
    
    return `V${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
  }

  static async creer(data: VenteInput, utilisateurId: string) {
    return prisma.$transaction(async (tx) => {
      let totalHT = 0;
      let totalTVA = 0;
      let totalRemise = 0;
      let totalTTC = 0;

      const lignesAvecLots: Array<{
        produitId: string;
        lotId: string;
        quantite: number;
        prixUnitaireTTC: number;
        tauxTVA: number;
        remise: number;
        totalTTC: number;
      }> = [];

      for (const ligne of data.lignes) {
        const produit = await tx.produit.findUnique({
          where: { id: ligne.produitId },
        });
        if (!produit) {
          throw new NotFoundError(`Produit ${ligne.produitId} introuvable`);
        }

        const allocations = await StockService.selectionnerLotsFEFO(
          ligne.produitId,
          ligne.quantite,
          tx
        );

        for (const alloc of allocations) {
          const totalLigneTTC = alloc.quantite * ligne.prixUnitaireTTC - 
            (ligne.remise * alloc.quantite / ligne.quantite);
          const totalLigneHT = totalLigneTTC / (1 + ligne.tauxTVA / 100);
          const tvaLigne = totalLigneTTC - totalLigneHT;

          totalHT += totalLigneHT;
          totalTVA += tvaLigne;
          totalRemise += (ligne.remise * alloc.quantite / ligne.quantite);
          totalTTC += totalLigneTTC;

          lignesAvecLots.push({
            produitId: ligne.produitId,
            lotId: alloc.lotId,
            quantite: alloc.quantite,
            prixUnitaireTTC: ligne.prixUnitaireTTC,
            tauxTVA: ligne.tauxTVA,
            remise: ligne.remise * alloc.quantite / ligne.quantite,
            totalTTC: totalLigneTTC,
          });

          await tx.lot.update({
            where: { id: alloc.lotId },
            data: { quantiteRestante: { decrement: alloc.quantite } },
          });
        }
      }

      const totalPaiements = data.paiements.reduce((sum, p) => sum + p.montant, 0);
      if (Math.abs(totalPaiements - totalTTC) > 0.01) {
        throw new BusinessError(
          `Le total des paiements (${totalPaiements}) ne correspond pas au total de la vente (${totalTTC})`,
          'PAIEMENT_INVALIDE'
        );
      }

      const numero = await this.genererNumero();

      const vente = await tx.vente.create({
        data: {
          numero,
          clientId: data.clientId,
          ordonnanceId: data.ordonnanceId,
          utilisateurId,
          totalHT,
          totalTVA,
          totalRemise,
          totalTTC,
          partPatient: totalTTC,
          notes: data.notes,
          lignes: {
            create: lignesAvecLots,
          },
          paiements: {
            create: data.paiements,
          },
        },
        include: {
          lignes: { include: { produit: true, lot: true } },
          paiements: true,
          client: true,
        },
      });

      for (const ligne of lignesAvecLots) {
        await tx.mouvementStock.create({
          data: {
            type: TypeMouvement.SORTIE_VENTE,
            produitId: ligne.produitId,
            lotId: ligne.lotId,
            quantite: -ligne.quantite,
            reference: vente.numero,
            utilisateurId,
          },
        });
      }

      if (data.clientId) {
        const points = Math.floor(Number(totalTTC) / 100);
        await tx.client.update({
          where: { id: data.clientId },
          data: { pointsFidelite: { increment: points } },
        });
      }

      logger.info('Vente créée', { numero, totalTTC, utilisateurId });
      return vente;
    });
  }

  static async lister(params: {
    page?: number;
    limit?: number;
    dateDebut?: Date;
    dateFin?: Date;
    clientId?: string;
    utilisateurId?: string;
    statut?: string;
  }) {
    const { page = 1, limit = 20 } = params;
    const where: Prisma.VenteWhereInput = {};

    if (params.dateDebut || params.dateFin) {
      where.dateVente = {};
      if (params.dateDebut) where.dateVente.gte = params.dateDebut;
      if (params.dateFin) where.dateVente.lte = params.dateFin;
    }
    if (params.clientId) where.clientId = params.clientId;
    if (params.utilisateurId) where.utilisateurId = params.utilisateurId;
    if (params.statut) where.statut = params.statut as Prisma.EnumStatutVenteFilter;

    const [ventes, total] = await Promise.all([
      prisma.vente.findMany({
        where,
        include: {
          client: { select: { nom: true, prenom: true, numeroClient: true } },
          utilisateur: { select: { nom: true, prenom: true } },
          paiements: true,
          _count: { select: { lignes: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateVente: 'desc' },
      }),
      prisma.vente.count({ where }),
    ]);

    return { ventes, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async obtenir(id: string) {
    const vente = await prisma.vente.findUnique({
      where: { id },
      include: {
        client: true,
        ordonnance: { include: { prescripteur: true } },
        utilisateur: { select: { nom: true, prenom: true } },
        lignes: { include: { produit: true, lot: true } },
        paiements: true,
      },
    });
    if (!vente) throw new NotFoundError('Vente introuvable');
    return vente;
  }

  static async statistiquesJour(date: Date = new Date()) {
    const debut = new Date(date);
    debut.setHours(0, 0, 0, 0);
    const fin = new Date(date);
    fin.setHours(23, 59, 59, 999);

    const ventes = await prisma.vente.findMany({
      where: { dateVente: { gte: debut, lte: fin }, statut: 'VALIDEE' },
      include: { paiements: true },
    });

    const totaux = {
      nombreVentes: ventes.length,
      totalTTC: 0,
      totalHT: 0,
      totalTVA: 0,
      paiements: {
        especes: 0,
        carte: 0,
        mobile: 0,
        credit: 0,
        tiers: 0,
      },
    };

    for (const v of ventes) {
      totaux.totalTTC += Number(v.totalTTC);
      totaux.totalHT += Number(v.totalHT);
      totaux.totalTVA += Number(v.totalTVA);

      for (const p of v.paiements) {
        const m = Number(p.montant);
        switch (p.mode) {
          case 'ESPECES': totaux.paiements.especes += m; break;
          case 'CARTE_BANCAIRE': totaux.paiements.carte += m; break;
          case 'D_MONEY':
          case 'WAAFI': totaux.paiements.mobile += m; break;
          case 'CREDIT_CLIENT': totaux.paiements.credit += m; break;
          case 'TIERS_PAYANT': totaux.paiements.tiers += m; break;
        }
      }
    }
    return totaux;
  }
}

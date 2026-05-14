import { prisma } from '@pharma/database';
import { TypeMouvement, type Prisma } from '@prisma/client';
import { NotFoundError, BusinessError } from '../utils/errors';
import { logger } from '../utils/logger';

export class StockService {
  /**
   * FEFO : First Expired First Out
   * Sélectionne automatiquement le lot avec la date de péremption la plus proche
   */
  static async selectionnerLotsFEFO(
    produitId: string,
    quantite: number,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    
    const lots = await client.lot.findMany({
      where: {
        produitId,
        quantiteRestante: { gt: 0 },
        datePeremption: { gt: new Date() },
      },
      orderBy: { datePeremption: 'asc' },
    });

    const stockDisponible = lots.reduce((sum, l) => sum + l.quantiteRestante, 0);
    
    if (stockDisponible < quantite) {
      throw new BusinessError(
        `Stock insuffisant. Disponible : ${stockDisponible}, demandé : ${quantite}`,
        'STOCK_INSUFFISANT'
      );
    }

    const allocations: { lotId: string; quantite: number }[] = [];
    let restant = quantite;

    for (const lot of lots) {
      if (restant <= 0) break;
      const aPrendre = Math.min(restant, lot.quantiteRestante);
      allocations.push({ lotId: lot.id, quantite: aPrendre });
      restant -= aPrendre;
    }

    return allocations;
  }

  static async sortirStock(
    params: {
      produitId: string;
      quantite: number;
      type: TypeMouvement;
      utilisateurId: string;
      motif?: string;
      reference?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    const allocations = await this.selectionnerLotsFEFO(params.produitId, params.quantite, tx);

    for (const alloc of allocations) {
      await client.lot.update({
        where: { id: alloc.lotId },
        data: { quantiteRestante: { decrement: alloc.quantite } },
      });

      await client.mouvementStock.create({
        data: {
          type: params.type,
          produitId: params.produitId,
          lotId: alloc.lotId,
          quantite: -alloc.quantite,
          motif: params.motif,
          reference: params.reference,
          utilisateurId: params.utilisateurId,
        },
      });
    }

    return allocations;
  }

  static async creerLot(data: {
    produitId: string;
    numeroLot: string;
    quantiteInitiale: number;
    datePeremption: Date;
    prixAchatLot: number;
    receptionId?: string;
    utilisateurId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const produit = await tx.produit.findUnique({ where: { id: data.produitId } });
      if (!produit) throw new NotFoundError('Produit introuvable');

      if (data.datePeremption <= new Date()) {
        throw new BusinessError('La date de péremption doit être future');
      }

      const lot = await tx.lot.create({
        data: {
          produitId: data.produitId,
          numeroLot: data.numeroLot,
          quantiteInitiale: data.quantiteInitiale,
          quantiteRestante: data.quantiteInitiale,
          datePeremption: data.datePeremption,
          prixAchatLot: data.prixAchatLot,
          receptionId: data.receptionId,
        },
      });

      await tx.mouvementStock.create({
        data: {
          type: TypeMouvement.ENTREE_ACHAT,
          produitId: data.produitId,
          lotId: lot.id,
          quantite: data.quantiteInitiale,
          motif: 'Entrée stock',
          utilisateurId: data.utilisateurId,
        },
      });

      logger.info('Nouveau lot créé', {
        lotId: lot.id,
        produitId: data.produitId,
        quantite: data.quantiteInitiale,
      });

      return lot;
    });
  }

  static async ajusterStock(params: {
    produitId: string;
    lotId: string;
    nouvelleQuantite: number;
    motif: string;
    utilisateurId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const lot = await tx.lot.findUnique({ where: { id: params.lotId } });
      if (!lot) throw new NotFoundError('Lot introuvable');

      const ecart = params.nouvelleQuantite - lot.quantiteRestante;
      if (ecart === 0) return lot;

      const lotMaj = await tx.lot.update({
        where: { id: params.lotId },
        data: { quantiteRestante: params.nouvelleQuantite },
      });

      await tx.mouvementStock.create({
        data: {
          type: ecart > 0 ? TypeMouvement.AJUSTEMENT_POSITIF : TypeMouvement.AJUSTEMENT_NEGATIF,
          produitId: params.produitId,
          lotId: params.lotId,
          quantite: ecart,
          motif: params.motif,
          utilisateurId: params.utilisateurId,
        },
      });

      return lotMaj;
    });
  }

  static async lotsBientotPerimes(joursAlerte = 90) {
    const dateLimite = new Date();
    dateLimite.setDate(dateLimite.getDate() + joursAlerte);

    return prisma.lot.findMany({
      where: {
        quantiteRestante: { gt: 0 },
        datePeremption: { lte: dateLimite },
      },
      include: { produit: true },
      orderBy: { datePeremption: 'asc' },
    });
  }

  static async produitsEnRupture() {
    const produits = await prisma.produit.findMany({
      where: { actif: true },
      include: {
        lots: {
          where: { quantiteRestante: { gt: 0 } },
        },
      },
    });

    return produits
      .map((p) => ({
        ...p,
        stockTotal: p.lots.reduce((sum, l) => sum + l.quantiteRestante, 0),
      }))
      .filter((p) => p.stockTotal <= p.stockMinimum);
  }

  static async historique(produitId: string, limit = 50) {
    return prisma.mouvementStock.findMany({
      where: { produitId },
      include: {
        lot: true,
        utilisateur: {
          select: { nom: true, prenom: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

import { prisma } from '@pharma/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import type { ProduitInput } from '@pharma/shared';
import type { Prisma } from '@prisma/client';

export class ProduitService {
  static async genererCodeInterne(): Promise<string> {
    const dernier = await prisma.produit.findFirst({
      orderBy: { codeInterne: 'desc' },
      select: { codeInterne: true },
    });

    if (!dernier) return 'P0001';

    const num = parseInt(dernier.codeInterne.substring(1), 10) + 1;
    return `P${num.toString().padStart(4, '0')}`;
  }

  static async creer(data: ProduitInput) {
    if (data.codeBarres) {
      const existe = await prisma.produit.findUnique({
        where: { codeBarres: data.codeBarres },
      });
      if (existe) {
        throw new ConflictError('Un produit avec ce code-barres existe déjà');
      }
    }

    const codeInterne = await this.genererCodeInterne();

    return prisma.produit.create({
      data: {
        ...data,
        codeInterne,
      },
      include: {
        laboratoire: true,
        famille: true,
      },
    });
  }

  static async lister(params: {
    page?: number;
    limit?: number;
    search?: string;
    familleId?: string;
    laboratoireId?: string;
    statut?: string;
    actif?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      familleId,
      laboratoireId,
      statut,
      actif = true,
      sortBy = 'nomCommercial',
      sortOrder = 'asc',
    } = params;

    const where: Prisma.ProduitWhereInput = { actif };

    if (search) {
      where.OR = [
        { nomCommercial: { contains: search, mode: 'insensitive' } },
        { dci: { contains: search, mode: 'insensitive' } },
        { codeBarres: { contains: search } },
        { codeInterne: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (familleId) where.familleId = familleId;
    if (laboratoireId) where.laboratoireId = laboratoireId;
    if (statut) where.statut = statut as Prisma.EnumStatutProduitFilter;

    const [produits, total] = await Promise.all([
      prisma.produit.findMany({
        where,
        include: {
          laboratoire: true,
          famille: true,
          lots: {
            where: { quantiteRestante: { gt: 0 } },
            orderBy: { datePeremption: 'asc' },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.produit.count({ where }),
    ]);

    const produitsAvecStock = produits.map((p) => ({
      ...p,
      stockTotal: p.lots.reduce((sum, lot) => sum + lot.quantiteRestante, 0),
      stockBas: p.lots.reduce((sum, lot) => sum + lot.quantiteRestante, 0) <= p.stockMinimum,
    }));

    return {
      produits: produitsAvecStock,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async obtenir(id: string) {
    const produit = await prisma.produit.findUnique({
      where: { id },
      include: {
        laboratoire: true,
        famille: true,
        lots: {
          orderBy: { datePeremption: 'asc' },
        },
      },
    });

    if (!produit) throw new NotFoundError('Produit introuvable');

    const stockTotal = produit.lots
      .filter((l) => l.quantiteRestante > 0)
      .reduce((sum, lot) => sum + lot.quantiteRestante, 0);

    return { ...produit, stockTotal };
  }

  static async rechercheRapide(query: string, limit = 10) {
    if (query.length < 2) return [];

    return prisma.produit.findMany({
      where: {
        actif: true,
        OR: [
          { nomCommercial: { contains: query, mode: 'insensitive' } },
          { dci: { contains: query, mode: 'insensitive' } },
          { codeBarres: { equals: query } },
          { codeInterne: { equals: query.toUpperCase() } },
        ],
      },
      include: {
        lots: {
          where: { quantiteRestante: { gt: 0 } },
          orderBy: { datePeremption: 'asc' },
        },
      },
      take: limit,
      orderBy: { nomCommercial: 'asc' },
    });
  }

  static async modifier(id: string, data: Partial<ProduitInput>) {
    const existe = await prisma.produit.findUnique({ where: { id } });
    if (!existe) throw new NotFoundError('Produit introuvable');

    return prisma.produit.update({
      where: { id },
      data,
      include: {
        laboratoire: true,
        famille: true,
      },
    });
  }

  static async desactiver(id: string) {
    return prisma.produit.update({
      where: { id },
      data: { actif: false },
    });
  }

  static async statistiques() {
    const [totalProduits, totalActifs, totalLots, ruptures] = await Promise.all([
      prisma.produit.count(),
      prisma.produit.count({ where: { actif: true } }),
      prisma.lot.count({ where: { quantiteRestante: { gt: 0 } } }),
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint as count
        FROM produits p
        WHERE p.actif = true
        AND (
          SELECT COALESCE(SUM(quantite_restante), 0)
          FROM lots
          WHERE produit_id = p.id
        ) <= p.stock_minimum
      `,
    ]);

    return {
      totalProduits,
      totalActifs,
      totalLots,
      enRupture: Number(ruptures[0]?.count || 0),
    };
  }
}

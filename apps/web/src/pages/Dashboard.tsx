import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  AlertTriangle,
  Users,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api';
import { formatFDJ, formatDate } from '@/lib/format';
import { LoadingPage } from '@/components/Spinner';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/dashboard');
      return data.data;
    },
    refetchInterval: 60000,
  });

  const { data: ventesParJour } = useQuery({
    queryKey: ['ventes-par-jour'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/ventes-par-jour', { jours: 14 });
      return data.data;
    },
  });

  const { data: topProduits } = useQuery({
    queryKey: ['top-produits'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/top-produits', { limit: 5 });
      return data.data;
    },
  });

  if (isLoading || !data) return <LoadingPage />;

  const stats = [
    {
      label: 'CA aujourd\'hui',
      value: formatFDJ(data.aujourdhui.totalTTC),
      icon: TrendingUp,
      color: 'bg-primary-500',
      detail: `${data.aujourdhui.nombreVentes} ventes`,
    },
    {
      label: 'CA du mois',
      value: formatFDJ(data.mois.totalTTC),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      detail: `${data.mois.nombreVentes} ventes`,
    },
    {
      label: 'Produits actifs',
      value: data.produits.totalActifs.toString(),
      icon: Package,
      color: 'bg-purple-500',
      detail: `${data.produits.totalLots} lots`,
    },
    {
      label: 'Total clients',
      value: data.clients.total.toString(),
      icon: Users,
      color: 'bg-amber-500',
      detail: 'Fidélisés',
    },
  ];

  const chartData = (ventesParJour || []).map((v: any) => ({
    jour: formatDate(v.jour).substring(0, 5),
    total: Number(v.total),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de votre pharmacie</p>
      </div>

      {/* Alertes */}
      {(data.alertes.ruptures > 0 || data.alertes.peremptionsProches > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.alertes.ruptures > 0 && (
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">
                    {data.alertes.ruptures} produit(s) en rupture
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    Stock en dessous du minimum requis
                  </p>
                </div>
                <a href="/stock" className="text-red-600 hover:text-red-800">
                  <ArrowUpRight size={20} />
                </a>
              </div>
            </div>
          )}
          {data.alertes.peremptionsProches > 0 && (
            <div className="card bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <Calendar className="text-amber-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900">
                    {data.alertes.peremptionsProches} lot(s) bientôt périmé(s)
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Péremption dans moins de 30 jours
                  </p>
                </div>
                <a href="/peremptions" className="text-amber-600 hover:text-amber-800">
                  <ArrowUpRight size={20} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.detail}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique ventes */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Ventes — 14 derniers jours</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="jour" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  formatter={(value: number) => formatFDJ(value)}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#287d50"
                  strokeWidth={2}
                  dot={{ fill: '#287d50' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Aucune donnée de vente disponible
            </div>
          )}
        </div>

        {/* Top produits */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Top 5 produits</h3>
          {topProduits && topProduits.length > 0 ? (
            <ul className="space-y-3">
              {topProduits.map((p: any, i: number) => (
                <li key={p.produitId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.nom}</p>
                    <p className="text-xs text-gray-500">{p.quantite} unités</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatFDJ(p.chiffreAffaires)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              Aucune vente enregistrée
            </p>
          )}
        </div>
      </div>

      {/* Modes de paiement */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Paiements aujourd'hui</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Espèces', value: data.aujourdhui.paiements.especes, color: 'text-green-600' },
            { label: 'Carte', value: data.aujourdhui.paiements.carte, color: 'text-blue-600' },
            { label: 'Mobile', value: data.aujourdhui.paiements.mobile, color: 'text-purple-600' },
            { label: 'Crédit', value: data.aujourdhui.paiements.credit, color: 'text-amber-600' },
            { label: 'Tiers payant', value: data.aujourdhui.paiements.tiers, color: 'text-rose-600' },
          ].map((p) => (
            <div key={p.label}>
              <p className="text-xs text-gray-500">{p.label}</p>
              <p className={`text-lg font-semibold ${p.color}`}>{formatFDJ(p.value)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

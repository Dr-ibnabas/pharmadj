import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, joursAvantPeremption, statutPeremption } from '@/lib/format';
import { LoadingPage } from '@/components/Spinner';

const STATUT_PEREMPTION = {
  perime: { label: 'Périmé', class: 'badge-danger' },
  urgent: { label: 'Urgent', class: 'badge-danger' },
  attention: { label: 'Attention', class: 'badge-warning' },
  ok: { label: 'OK', class: 'badge-success' },
};

export function PeremptionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['peremptions'],
    queryFn: async () => {
      const { data } = await api.get('/stock/peremptions', { jours: 180 });
      return data.data;
    },
  });

  if (isLoading) return <LoadingPage />;

  const lots = (data || []).sort((a: any, b: any) =>
    new Date(a.datePeremption).getTime() - new Date(b.datePeremption).getTime()
  );

  const grouped = {
    perime: lots.filter((l: any) => statutPeremption(l.datePeremption) === 'perime'),
    urgent: lots.filter((l: any) => statutPeremption(l.datePeremption) === 'urgent'),
    attention: lots.filter((l: any) => statutPeremption(l.datePeremption) === 'attention'),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Péremptions</h1>
        <p className="text-gray-600 mt-1">Suivi des dates de péremption des lots</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
              <AlertTriangle className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-red-700">Périmés</p>
              <p className="text-2xl font-bold text-red-900">{grouped.perime.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-amber-700">{`< 30 jours`}</p>
              <p className="text-2xl font-bold text-amber-900">{grouped.urgent.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-yellow-700">{`< 90 jours`}</p>
              <p className="text-2xl font-bold text-yellow-900">{grouped.attention.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Produit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Lot</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Péremption</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Quantité</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Délai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lots.map((lot: any) => {
                const j = joursAvantPeremption(lot.datePeremption);
                const s = statutPeremption(lot.datePeremption);
                return (
                  <tr key={lot.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{lot.produit.nomCommercial}</p>
                      <p className="text-xs text-gray-500">{lot.produit.codeInterne}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{lot.numeroLot}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(lot.datePeremption)}</td>
                    <td className="px-4 py-3">
                      <span className={STATUT_PEREMPTION[s].class}>
                        {STATUT_PEREMPTION[s].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {lot.quantiteRestante}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {j < 0 ? `${Math.abs(j)} j en retard` : `${j} j`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {lots.length === 0 && (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucun lot bientôt périmé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

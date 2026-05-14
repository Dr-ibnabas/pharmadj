import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import { api } from '@/lib/api';
import { formatFDJ, formatDateTime } from '@/lib/format';
import { LoadingPage } from '@/components/Spinner';

export function VentesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['ventes', page],
    queryFn: async () => {
      const { data } = await api.get('/ventes', { page, limit: 20 });
      return { ventes: data.data, meta: data.meta };
    },
  });

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Ventes</h1>
        <p className="text-gray-600 mt-1">{data?.meta.total || 0} ventes enregistrées</p>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">N°</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Caissier</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Articles</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.ventes.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{v.numero}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(v.dateVente)}</td>
                  <td className="px-4 py-3 text-sm">
                    {v.client ? `${v.client.prenom} ${v.client.nom}` : <span className="text-gray-400">Anonyme</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {v.utilisateur.prenom} {v.utilisateur.nom}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{v._count.lignes}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatFDJ(Number(v.totalTTC))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.ventes.length === 0 && (
            <div className="text-center py-12">
              <Receipt size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucune vente enregistrée</p>
            </div>
          )}
        </div>

        {data && data.meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {data.meta.page} sur {data.meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary text-sm py-1"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.meta.totalPages}
                className="btn-secondary text-sm py-1"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Boxes, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { formatFDJ, formatDate } from '@/lib/format';
import { LoadingPage } from '@/components/Spinner';

export function StockPage() {
  const { data: ruptures, isLoading } = useQuery({
    queryKey: ['ruptures'],
    queryFn: async () => {
      const { data } = await api.get('/stock/ruptures');
      return data.data;
    },
  });

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Stock & Lots</h1>
        <p className="text-gray-600 mt-1">Gestion des stocks par lots avec FEFO automatique</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-amber-500" />
          Produits en rupture ou stock bas ({ruptures?.length || 0})
        </h2>

        {ruptures && ruptures.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Produit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Stock actuel</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Stock min.</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Point cmd.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ruptures.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{p.codeInterne}</td>
                    <td className="px-4 py-3 font-medium">{p.nomCommercial}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${p.stockTotal === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {p.stockTotal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">{p.stockMinimum}</td>
                    <td className="px-4 py-3 text-right text-sm">{p.pointCommande}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Boxes size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun produit en rupture</p>
          </div>
        )}
      </div>
    </div>
  );
}

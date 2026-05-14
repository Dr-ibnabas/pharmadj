import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { LoadingPage } from '@/components/Spinner';

export function OrdonnancesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['ordonnances'],
    queryFn: async () => {
      const { data } = await api.get('/ordonnances', { page: 1, limit: 50 });
      return data.data;
    },
  });

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Ordonnances</h1>
          <p className="text-gray-600 mt-1">{data?.length || 0} ordonnances enregistrées</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">N°</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Prescripteur</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Délivrances</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-medium">{o.numero}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(o.dateOrdonnance)}</td>
                  <td className="px-4 py-3">
                    {o.client.prenom} {o.client.nom}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {o.prescripteur ? `Dr ${o.prescripteur.nom}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{o._count?.ventes || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!data || data.length === 0) && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucune ordonnance enregistrée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

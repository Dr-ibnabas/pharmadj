import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Users, Award } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { LoadingPage } from '@/components/Spinner';

export function ClientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, search],
    queryFn: async () => {
      const { data } = await api.get('/clients', { page, limit: 20, search });
      return { clients: data.data, meta: data.meta };
    },
  });

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">{data?.meta.total || 0} clients enregistrés</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          Nouveau client
        </button>
      </div>

      <div className="card !p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher par nom, prénom, téléphone..."
            className="input pl-11"
          />
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">N°</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Nom</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Téléphone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Mutuelle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Fidélité</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.clients.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{c.numeroClient}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {c.prenom} {c.nom}
                    </p>
                    {c.allergies && (
                      <p className="text-xs text-red-600">⚠ Allergies : {c.allergies}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.telephone || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    {c.mutuelle ? (
                      <span className="badge-info">{c.mutuelle.nom}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Award size={14} className="text-amber-500" />
                      <span className="font-medium">{c.pointsFidelite} pts</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.clients.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucun client trouvé</p>
            </div>
          )}
        </div>

        {data && data.meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {data.meta.page} sur {data.meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn-secondary text-sm py-1">
                Précédent
              </button>
              <button onClick={() => setPage(page + 1)} disabled={page === data.meta.totalPages} className="btn-secondary text-sm py-1">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

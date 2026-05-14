import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Package, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { formatFDJ } from '@/lib/format';
import { LoadingPage } from '@/components/Spinner';
import { useAuthStore } from '@/store/auth';

const STATUT_LABELS: Record<string, { label: string; class: string }> = {
  VENTE_LIBRE: { label: 'Vente libre', class: 'badge-info' },
  SUR_ORDONNANCE: { label: 'Sur ordonnance', class: 'badge-warning' },
  STUPEFIANT: { label: 'Stupéfiant', class: 'badge-danger' },
  LISTE_I: { label: 'Liste I', class: 'badge-warning' },
  LISTE_II: { label: 'Liste II', class: 'badge-warning' },
};

export function ProduitsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { hasRole } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['produits', page, search],
    queryFn: async () => {
      const { data } = await api.get('/produits', { page, limit: 20, search });
      return { produits: data.data, meta: data.meta };
    },
  });

  if (isLoading) return <LoadingPage />;

  const peutAjouter = hasRole('ADMIN', 'PHARMACIEN_TITULAIRE', 'PHARMACIEN_ADJOINT');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600 mt-1">{data?.meta.total || 0} produits référencés</p>
        </div>
        {peutAjouter && (
          <button className="btn-primary">
            <Plus size={18} />
            Nouveau produit
          </button>
        )}
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
            placeholder="Rechercher par nom, DCI, code-barres..."
            className="input pl-11"
          />
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Produit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">DCI / Dosage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Prix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.produits.map((p: any) => {
                const statut = STATUT_LABELS[p.statut] || STATUT_LABELS.VENTE_LIBRE;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.codeInterne}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.nomCommercial}</p>
                      {p.laboratoire && (
                        <p className="text-xs text-gray-500">{p.laboratoire.nom}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.dci || '—'}
                      {p.dosage && <span className="ml-1 text-gray-500">{p.dosage}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statut.class}>{statut.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.stockBas && <AlertCircle size={14} className="text-amber-500" />}
                        <span className={`font-medium ${p.stockBas ? 'text-amber-700' : 'text-gray-900'}`}>
                          {p.stockTotal || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatFDJ(Number(p.prixVenteTTC))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {data?.produits.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucun produit trouvé</p>
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

import { useQuery } from '@tanstack/react-query';
import { Truck } from 'lucide-react';
import { api } from '@/lib/api';
import { formatFDJ, formatDate } from '@/lib/format';
import { LoadingPage } from '@/components/Spinner';

const STATUT_CMD: Record<string, { label: string; class: string }> = {
  BROUILLON: { label: 'Brouillon', class: 'badge-info' },
  ENVOYEE: { label: 'Envoyée', class: 'badge-warning' },
  PARTIELLEMENT_RECUE: { label: 'Partielle', class: 'badge-warning' },
  RECUE: { label: 'Reçue', class: 'badge-success' },
  ANNULEE: { label: 'Annulée', class: 'badge-danger' },
};

export function AchatsPage() {
  const { data: commandes, isLoading } = useQuery({
    queryKey: ['commandes'],
    queryFn: async () => {
      const { data } = await api.get('/achats/commandes', { page: 1, limit: 50 });
      return data.data;
    },
  });

  const { data: fournisseurs } = useQuery({
    queryKey: ['fournisseurs'],
    queryFn: async () => {
      const { data } = await api.get('/achats/fournisseurs');
      return data.data;
    },
  });

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Achats</h1>
        <p className="text-gray-600 mt-1">Commandes et fournisseurs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Fournisseurs actifs</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{fournisseurs?.length || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Commandes en cours</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {commandes?.filter((c: any) => ['ENVOYEE', 'PARTIELLEMENT_RECUE'].includes(c.statut)).length || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total commandé</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{commandes?.length || 0}</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Commandes récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">N°</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Fournisseur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Statut</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Montant TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commandes?.map((c: any) => {
                const s = STATUT_CMD[c.statut] || STATUT_CMD.BROUILLON;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono font-medium">{c.numero}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(c.dateCommande)}</td>
                    <td className="px-4 py-3">{c.fournisseur.raisonSociale}</td>
                    <td className="px-4 py-3">
                      <span className={s.class}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatFDJ(Number(c.totalTTC))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!commandes || commandes.length === 0) && (
            <div className="text-center py-12">
              <Truck size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucune commande enregistrée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

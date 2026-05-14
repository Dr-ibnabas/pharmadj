import { useQuery } from '@tanstack/react-query';
import { Settings, Building2, Banknote, Users as UsersIcon, Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { LoadingPage } from '@/components/Spinner';

export function ParametresPage() {
  const { data: config, isLoading } = useQuery({
    queryKey: ['configuration'],
    queryFn: async () => {
      const { data } = await api.get('/references/configuration');
      return data.data;
    },
  });

  if (isLoading) return <LoadingPage />;

  const sections = [
    {
      icon: Building2,
      title: 'Informations pharmacie',
      description: 'Nom, adresse, contact, NIF, RCCM',
      items: [
        { label: 'Nom', value: config?.PHARMACIE_NOM || '—' },
        { label: 'Adresse', value: config?.PHARMACIE_ADRESSE || '—' },
        { label: 'Téléphone', value: config?.PHARMACIE_TELEPHONE || '—' },
        { label: 'Email', value: config?.PHARMACIE_EMAIL || '—' },
      ],
    },
    {
      icon: Banknote,
      title: 'Comptabilité',
      description: 'Devise, TVA, fidélité',
      items: [
        { label: 'Devise', value: config?.DEVISE || 'FDJ' },
        { label: 'TVA par défaut', value: `${config?.TVA_DEFAUT || 0}%` },
        { label: 'Ratio fidélité', value: `1 pt / ${config?.POINTS_FIDELITE_RATIO || 100} FDJ` },
      ],
    },
    {
      icon: Bell,
      title: 'Alertes',
      description: 'Configuration des notifications',
      items: [
        { label: 'Alerte péremption', value: `${config?.PEREMPTION_ALERTE_JOURS || 90} jours` },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Configuration générale de la pharmacie</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="card">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Icon size={20} className="text-primary-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
              <dl className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <dt className="text-sm text-gray-600">{item.label}</dt>
                    <dd className="text-sm font-medium text-gray-900">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  X,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { formatFDJ } from '@/lib/format';
import { usePanierStore, type Produit } from '@/store/panier';
import { Spinner } from '@/components/Spinner';

export function CaissePage() {
  const queryClient = useQueryClient();
  const [recherche, setRecherche] = useState('');
  const [showPaiement, setShowPaiement] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    lignes,
    ajouter,
    retirer,
    modifierQuantite,
    vider,
    totalTTC,
    nombreArticles,
  } = usePanierStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data: produits, isLoading: chargementRecherche } = useQuery({
    queryKey: ['recherche-produit', recherche],
    queryFn: async () => {
      if (recherche.length < 2) return [];
      const { data } = await api.get('/produits/recherche', { q: recherche, limit: 8 });
      return data.data;
    },
    enabled: recherche.length >= 2,
  });

  const validerVente = useMutation({
    mutationFn: async (paiements: { mode: string; montant: number }[]) => {
      const lignesAPI = lignes.map((l) => ({
        produitId: l.produit.id,
        quantite: l.quantite,
        prixUnitaireTTC: l.produit.prixVenteTTC,
        tauxTVA: l.produit.tauxTVA,
        remise: l.remise,
      }));

      const { data } = await api.post('/ventes', {
        lignes: lignesAPI,
        paiements,
      });
      return data.data;
    },
    onSuccess: (vente) => {
      toast.success(`Vente ${vente.numero} validée !`);
      vider();
      setShowPaiement(false);
      setRecherche('');
      inputRef.current?.focus();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => {
      // toast géré par l'intercepteur
    },
  });

  const handleAjouterProduit = (p: any) => {
    const stockTotal = p.lots?.reduce((sum: number, l: any) => sum + l.quantiteRestante, 0) || 0;
    if (stockTotal === 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    const produit: Produit = {
      id: p.id,
      codeInterne: p.codeInterne,
      nomCommercial: p.nomCommercial,
      dci: p.dci,
      dosage: p.dosage,
      prixVenteTTC: Number(p.prixVenteTTC),
      tauxTVA: Number(p.tauxTVA),
      stockTotal,
      statut: p.statut,
    };
    ajouter(produit);
    setRecherche('');
    inputRef.current?.focus();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-7rem)]">
      {/* Recherche & catalogue */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="card !p-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Code-barres, nom commercial, DCI..."
              className="input pl-11 text-base py-3"
              autoComplete="off"
            />
          </div>

          {recherche.length >= 2 && (
            <div className="mt-3">
              {chargementRecherche ? (
                <div className="py-4 text-center"><Spinner /></div>
              ) : produits && produits.length > 0 ? (
                <ul className="space-y-1 max-h-64 overflow-y-auto">
                  {produits.map((p: any) => {
                    const stock = p.lots?.reduce((s: number, l: any) => s + l.quantiteRestante, 0) || 0;
                    return (
                      <li key={p.id}>
                        <button
                          onClick={() => handleAjouterProduit(p)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {p.nomCommercial}
                              {p.dosage && <span className="text-gray-500 ml-1">{p.dosage}</span>}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {p.dci || p.codeInterne} • Stock: {stock}
                              {p.statut === 'SUR_ORDONNANCE' && (
                                <span className="ml-2 badge-warning text-xs">Ordonnance</span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary-700">
                              {formatFDJ(Number(p.prixVenteTTC))}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="py-4 text-center text-gray-500 text-sm">Aucun produit trouvé</p>
              )}
            </div>
          )}
        </div>

        {/* Articles dans le panier */}
        <div className="card flex-1 overflow-hidden flex flex-col !p-0">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={18} />
              Panier ({nombreArticles()} articles)
            </h2>
            {lignes.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Vider le panier ?')) vider();
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Vider
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {lignes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <ShoppingCart size={48} className="mb-3" />
                <p>Le panier est vide</p>
                <p className="text-sm mt-1">Recherchez un produit pour commencer</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lignes.map((ligne) => (
                  <li key={ligne.produit.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {ligne.produit.nomCommercial}
                          {ligne.produit.dosage && (
                            <span className="text-gray-500 ml-1 text-sm">{ligne.produit.dosage}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFDJ(ligne.produit.prixVenteTTC)} × {ligne.quantite}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => modifierQuantite(ligne.produit.id, ligne.quantite - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white rounded"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-semibold text-sm">{ligne.quantite}</span>
                        <button
                          onClick={() => modifierQuantite(ligne.produit.id, ligne.quantite + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white rounded"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="font-semibold text-gray-900 w-24 text-right">
                        {formatFDJ(ligne.produit.prixVenteTTC * ligne.quantite - ligne.remise)}
                      </p>

                      <button
                        onClick={() => retirer(ligne.produit.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Récapitulatif & paiement */}
      <div className="lg:col-span-2">
        <div className="card sticky top-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Récapitulatif</h2>

          <div className="space-y-2 pb-4 border-b border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Articles</span>
              <span>{nombreArticles()}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-gray-600">Total à payer</span>
            <span className="text-3xl font-bold text-primary-700">
              {formatFDJ(totalTTC())}
            </span>
          </div>

          <button
            onClick={() => setShowPaiement(true)}
            disabled={lignes.length === 0}
            className="btn-primary w-full py-3 text-base"
          >
            Encaisser
          </button>
        </div>
      </div>

      {showPaiement && (
        <PaiementModal
          total={totalTTC()}
          onClose={() => setShowPaiement(false)}
          onValider={(paiements) => validerVente.mutate(paiements)}
          enCours={validerVente.isPending}
        />
      )}
    </div>
  );
}

function PaiementModal({
  total,
  onClose,
  onValider,
  enCours,
}: {
  total: number;
  onClose: () => void;
  onValider: (paiements: { mode: string; montant: number }[]) => void;
  enCours: boolean;
}) {
  const [mode, setMode] = useState('ESPECES');
  const [montant, setMontant] = useState(total);
  const [reference, setReference] = useState('');

  const rendu = mode === 'ESPECES' ? Math.max(0, montant - total) : 0;

  const modes = [
    { id: 'ESPECES', label: 'Espèces', icon: Banknote, color: 'text-green-600' },
    { id: 'CARTE_BANCAIRE', label: 'Carte', icon: CreditCard, color: 'text-blue-600' },
    { id: 'D_MONEY', label: 'D-Money', icon: Smartphone, color: 'text-purple-600' },
    { id: 'WAAFI', label: 'Waafi', icon: Smartphone, color: 'text-orange-600' },
  ];

  const handleValider = () => {
    if (mode === 'ESPECES' && montant < total) {
      toast.error('Montant insuffisant');
      return;
    }
    const montantFinal = mode === 'ESPECES' ? total : montant;
    onValider([{ mode, montant: montantFinal, reference }]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Encaissement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="bg-primary-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">Total à encaisser</p>
          <p className="text-3xl font-bold text-primary-700">{formatFDJ(total)}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Mode de paiement</label>
            <div className="grid grid-cols-2 gap-2">
              {modes.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id);
                      if (m.id !== 'ESPECES') setMontant(total);
                    }}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                      mode === m.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={24} className={m.color} />
                    <span className="text-sm font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === 'ESPECES' && (
            <div>
              <label className="label">Montant reçu</label>
              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                min={total}
                step="50"
                className="input text-lg font-semibold"
                autoFocus
              />
              {rendu > 0 && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  Rendu : {formatFDJ(rendu)}
                </p>
              )}
            </div>
          )}

          {(mode === 'D_MONEY' || mode === 'WAAFI' || mode === 'CARTE_BANCAIRE') && (
            <div>
              <label className="label">Référence transaction (optionnel)</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Numéro de transaction..."
                className="input"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Annuler
          </button>
          <button
            onClick={handleValider}
            disabled={enCours}
            className="btn-primary flex-1"
          >
            {enCours ? <Spinner size={18} /> : <CheckCircle size={18} />}
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}

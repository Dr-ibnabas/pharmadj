import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { PillBottle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, motDePasse);
      toast.success('Connexion réussie');
      navigate('/');
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message || 'Erreur de connexion';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4 shadow-lg">
            <PillBottle size={32} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-gray-900">PharmaDJ</h1>
          <p className="text-gray-600 mt-2">Logiciel de gestion de pharmacie</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className="input"
                placeholder="vous@pharmacie.dj"
              />
            </div>

            <div>
              <label htmlFor="motDePasse" className="label">
                Mot de passe
              </label>
              <input
                id="motDePasse"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">Comptes de démonstration :</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Admin:</strong> admin@pharma.dj / Admin@2026</p>
              <p><strong>Pharmacien:</strong> pharmacien@pharma.dj / Pharma@2026</p>
              <p><strong>Caissier:</strong> caissier@pharma.dj / Caisse@2026</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 PharmaDJ — Tous droits réservés
        </p>
      </div>
    </div>
  );
}

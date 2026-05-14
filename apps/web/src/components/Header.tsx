import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  PHARMACIEN_TITULAIRE: 'Pharmacien titulaire',
  PHARMACIEN_ADJOINT: 'Pharmacien adjoint',
  PREPARATEUR: 'Préparateur',
  CAISSIER: 'Caissier',
};

export function Header() {
  const { utilisateur, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!utilisateur) return null;

  const initiales = `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center text-sm">
              {initiales}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">
                {utilisateur.prenom} {utilisateur.nom}
              </p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[utilisateur.role]}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fade-in">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/profil');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User size={16} />
                Mon profil
              </button>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

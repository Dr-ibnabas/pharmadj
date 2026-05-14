import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export type Role =
  | 'ADMIN'
  | 'PHARMACIEN_TITULAIRE'
  | 'PHARMACIEN_ADJOINT'
  | 'PREPARATEUR'
  | 'CAISSIER';

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
}

interface AuthState {
  utilisateur: Utilisateur | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      utilisateur: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, motDePasse) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, motDePasse });
          const { accessToken, refreshToken, utilisateur } = data.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          set({
            utilisateur,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            await api.post('/auth/logout', { refreshToken });
          }
        } catch (err) {
          // ignorer
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ utilisateur: null, isAuthenticated: false });
        }
      },

      hasRole: (...roles: Role[]) => {
        const user = get().utilisateur;
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    {
      name: 'pharma-auth',
      partialize: (state) => ({
        utilisateur: state.utilisateur,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

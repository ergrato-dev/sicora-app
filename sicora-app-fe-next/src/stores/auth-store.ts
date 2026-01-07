import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'aprendiz' | 'coordinador' | 'administrativo';
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  coordination?: string;
  ficha?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  updateUserStatus: (status: User['status']) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        // Limpiar localStorage
        localStorage.removeItem('auth-storage');
      },

      setUser: (user: User) => {
        set({ user });
      },

      updateUserStatus: (status: User['status']) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, status },
          });
        }
      },
    }),
    {
      name: 'auth-storage', // Nombre para localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

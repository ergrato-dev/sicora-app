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

interface UserState {
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  updateUserStatus: (status: User['status']) => void;
  initializeUser: () => void; // Nueva función para inicializar
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      logout: () => set({ user: null, isAuthenticated: false }),

      updateUserStatus: (status) =>
        set((state) => ({
          user: state.user ? { ...state.user, status } : null,
        })),

      initializeUser: () => {
        const state = get();
        // Si no hay usuario y estamos en desarrollo, usar el demo
        if (!state.user && import.meta.env.DEV) {
          set({ user: demoUser, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'sicora-user-storage', // nombre del localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Usuario demo por defecto para desarrollo
export const demoUser: User = {
  id: '1',
  name: 'María González Rodríguez',
  email: 'maria.gonzalez@sena.edu.co',
  role: 'admin',
  avatar: '',
  status: 'online',
  coordination: 'Administración Central',
};

// Hook para inicializar usuario demo en desarrollo
export const useInitDemoUser = () => {
  const { setUser, user } = useUserStore();

  // Si no hay usuario en desarrollo, usar el demo
  if (!user && import.meta.env.DEV) {
    setUser(demoUser);
  }
};

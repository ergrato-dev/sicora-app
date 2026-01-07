'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * Providers - Wrapper para todos los providers de la aplicación
 *
 * Incluye:
 * - TanStack Query para data fetching
 * - (Futuro) ThemeProvider para dark mode
 * - (Futuro) ToastProvider para notificaciones
 */

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // QueryClient con configuración optimizada
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutos
            staleTime: 5 * 60 * 1000,
            // Cache time: 30 minutos
            gcTime: 30 * 60 * 1000,
            // Reintentar 1 vez en errores
            retry: 1,
            // No refetch automático en focus (mejor UX)
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Reintentar 0 veces en mutaciones
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}

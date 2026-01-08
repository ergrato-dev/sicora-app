/**
 * SICORA - Hook del Dashboard
 *
 * Hook personalizado para obtener datos del dashboard
 * con manejo robusto de errores, estados de carga,
 * y soporte para diferentes roles de usuario.
 *
 * Basado en la guía MANEJO_DE_ERRORES.md
 *
 * @fileoverview Dashboard data hook
 * @module hooks/useDashboard
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { dashboardApi } from '@/lib/api/dashboard';
import {
  AppError,
  getErrorMessage,
  isNetworkError,
  isAuthError,
  logError,
} from '@/lib/errors';
import type {
  StudentDashboardMetrics,
  InstructorDashboardMetrics,
  AdminDashboardMetrics,
  TodaySchedule,
  Alert,
  UserRole,
  StudentAttendanceSummary,
  InstructorAttendanceSummary,
  GlobalAttendanceSummary,
} from '@/types/dashboard.types';

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Estado base de carga
 */
interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Estado del dashboard para aprendiz
 */
interface StudentDashboardState extends LoadingState {
  role: 'aprendiz';
  data: StudentDashboardMetrics | null;
}

/**
 * Estado del dashboard para instructor
 */
interface InstructorDashboardState extends LoadingState {
  role: 'instructor';
  data: InstructorDashboardMetrics | null;
}

/**
 * Estado del dashboard para admin/coordinador
 */
interface AdminDashboardState extends LoadingState {
  role: 'admin' | 'coordinador' | 'administrativo';
  data: AdminDashboardMetrics | null;
}

/**
 * Estado unificado del dashboard
 */
type DashboardState =
  | StudentDashboardState
  | InstructorDashboardState
  | AdminDashboardState;

/**
 * Acciones del hook
 */
interface DashboardActions {
  /** Recargar datos */
  refresh: () => Promise<void>;
  /** Limpiar error */
  clearError: () => void;
  /** Marcar alerta como leída */
  markAlertRead: (alertId: string) => Promise<void>;
}

/**
 * Retorno del hook useDashboard
 */
export type UseDashboardReturn = DashboardState & DashboardActions;

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para obtener datos del dashboard según el rol del usuario
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { data, isLoading, error, refresh } = useDashboard();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <ErrorMessage message={error} onRetry={refresh} />;
 *
 *   return <DashboardContent data={data} />;
 * }
 * ```
 */
export function useDashboard(): UseDashboardReturn {
  const { user, isAuthenticated } = useAuthStore();
  const role = (user?.role || 'aprendiz') as UserRole;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [data, setData] = useState<
    | StudentDashboardMetrics
    | InstructorDashboardMetrics
    | AdminDashboardMetrics
    | null
  >(null);

  /**
   * Cargar datos del dashboard
   */
  const loadDashboard = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para ver el dashboard');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await dashboardApi.getDashboardMetrics(role);
      setData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);

      // Loggear error con contexto
      logError(err, { hook: 'useDashboard', role });

      // Si es error de auth, podría redirigir
      if (isAuthError(err)) {
        // El interceptor del httpClient ya maneja esto
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, role]);

  /**
   * Refresh manual
   */
  const refresh = useCallback(async () => {
    await loadDashboard();
  }, [loadDashboard]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Marcar alerta como leída
   */
  const markAlertRead = useCallback(
    async (alertId: string) => {
      try {
        await dashboardApi.markAlertAsRead(alertId);
        // Actualizar estado local
        if (data && 'alerts' in data) {
          const updatedAlerts = (data.alerts as Alert[]).map((alert) =>
            alert.id === alertId ? { ...alert, read: true } : alert
          );
          setData({ ...data, alerts: updatedAlerts } as typeof data);
        }
      } catch (err) {
        logError(err, { action: 'markAlertRead', alertId });
        // No mostramos error al usuario, es una acción secundaria
      }
    },
    [data]
  );

  // Cargar datos al montar
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Construir estado según el rol
  const state = useMemo((): DashboardState => {
    const baseState = { isLoading, error, lastUpdated };

    switch (role) {
      case 'aprendiz':
        return {
          ...baseState,
          role: 'aprendiz',
          data: data as StudentDashboardMetrics | null,
        };
      case 'instructor':
        return {
          ...baseState,
          role: 'instructor',
          data: data as InstructorDashboardMetrics | null,
        };
      case 'admin':
      case 'coordinador':
      case 'administrativo':
        return {
          ...baseState,
          role: role as 'admin' | 'coordinador' | 'administrativo',
          data: data as AdminDashboardMetrics | null,
        };
      default:
        return {
          ...baseState,
          role: 'aprendiz',
          data: data as StudentDashboardMetrics | null,
        };
    }
  }, [role, isLoading, error, lastUpdated, data]);

  return {
    ...state,
    refresh,
    clearError,
    markAlertRead,
  };
}

// ============================================================================
// HOOKS ESPECÍFICOS
// ============================================================================

/**
 * Hook para obtener solo el horario del día
 */
export function useTodaySchedule() {
  const [schedules, setSchedules] = useState<TodaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dashboardApi.getTodaySchedule();
      setSchedules(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
      logError(err, { hook: 'useTodaySchedule' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { schedules, isLoading, error, refresh: load };
}

/**
 * Hook para obtener alertas del usuario
 */
export function useAlerts(options?: { unreadOnly?: boolean; limit?: number }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [alertsResponse, countResponse] = await Promise.all([
        dashboardApi.getMyAlerts({
          read: options?.unreadOnly ? false : undefined,
          limit: options?.limit || 10,
        }),
        dashboardApi.getUnreadAlertsCount(),
      ]);

      setAlerts(alertsResponse.data.items);
      setUnreadCount(countResponse.data.count);
    } catch (err) {
      setError(getErrorMessage(err));
      logError(err, { hook: 'useAlerts' });
    } finally {
      setIsLoading(false);
    }
  }, [options?.unreadOnly, options?.limit]);

  const markAsRead = useCallback(async (alertId: string) => {
    try {
      await dashboardApi.markAlertAsRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      logError(err, { action: 'markAlertAsRead', alertId });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await dashboardApi.markAllAlertsAsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
      setUnreadCount(0);
    } catch (err) {
      logError(err, { action: 'markAllAlertsAsRead' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    alerts,
    unreadCount,
    isLoading,
    error,
    refresh: load,
    markAsRead,
    markAllAsRead,
  };
}

/**
 * Hook para obtener resumen de asistencia
 */
export function useAttendanceSummary() {
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;

  const [summary, setSummary] = useState<
    | StudentAttendanceSummary
    | InstructorAttendanceSummary
    | GlobalAttendanceSummary
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!role) return;

    setIsLoading(true);
    setError(null);

    try {
      let response;
      switch (role) {
        case 'aprendiz':
          response = await dashboardApi.getStudentAttendanceSummary();
          break;
        case 'instructor':
          response = await dashboardApi.getInstructorAttendanceSummary();
          break;
        default:
          response = await dashboardApi.getGlobalAttendanceSummary();
      }
      setSummary(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
      logError(err, { hook: 'useAttendanceSummary', role });
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    load();
  }, [load]);

  return { summary, isLoading, error, refresh: load };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useDashboard;

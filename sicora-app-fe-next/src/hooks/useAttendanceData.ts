/**
 * SICORA - Hook para Gestión de Asistencia
 *
 * Hook que integra el store de attendance con los API clients
 * para cargar y manipular datos de asistencia.
 *
 * @fileoverview Attendance management hook
 * @module hooks/useAttendanceData
 */

'use client';

import { useCallback, useEffect } from 'react';
import { useAttendanceStore, type StudentForAttendance } from '@/stores/attendanceStore';
import { attendanceApi } from '@/lib/api/attendance';
import { useUserStore } from '@/stores/userStore';
import type {
  AttendanceRecord,
  AttendanceStatus,
  CreateAttendanceRequest,
  BulkAttendanceRequest,
  GenerateQRRequest,
  ReviewJustificationRequest,
} from '@/types/attendance.types';

interface UseAttendanceDataOptions {
  /** Cargar registros automáticamente */
  autoFetch?: boolean;
  /** Cargar alertas automáticamente */
  loadAlerts?: boolean;
  /** Cargar justificaciones automáticamente */
  loadJustifications?: boolean;
  /** ID de grupo específico */
  groupId?: string;
  /** Fecha específica */
  date?: string;
}

interface UseAttendanceDataReturn {
  // Estado
  records: AttendanceRecord[];
  activeSession: ReturnType<typeof useAttendanceStore.getState>['activeSession'];
  activeQR: ReturnType<typeof useAttendanceStore.getState>['activeQR'];
  alerts: ReturnType<typeof useAttendanceStore.getState>['alerts'];
  pendingJustifications: ReturnType<typeof useAttendanceStore.getState>['pendingJustifications'];
  groupSummary: ReturnType<typeof useAttendanceStore.getState>['groupSummary'];
  
  // Loading
  isLoading: boolean;
  isGeneratingQR: boolean;
  isSavingAttendance: boolean;
  error: string | null;
  successMessage: string | null;
  
  // Stats
  sessionStats: ReturnType<ReturnType<typeof useAttendanceStore.getState>['getSessionStats']>;
  unreadAlertsCount: number;
  pendingJustificationsCount: number;
  
  // Acciones - Sesión
  startAttendanceSession: (params: {
    scheduleId: string;
    groupId: string;
    groupCode: string;
    date: string;
    subject?: string;
    venue?: string;
    students: StudentForAttendance[];
  }) => void;
  endAttendanceSession: () => void;
  
  // Acciones - Registro
  markAttendance: (studentId: string, status: AttendanceStatus) => Promise<boolean>;
  markAllAttendance: (status: AttendanceStatus) => Promise<boolean>;
  saveAllAttendance: () => Promise<boolean>;
  
  // Acciones - QR
  generateQR: (params: Omit<GenerateQRRequest, 'schedule_id' | 'academic_group_id'>) => Promise<boolean>;
  refreshQRStatus: () => Promise<void>;
  deactivateQR: () => void;
  
  // Acciones - Justificaciones
  fetchJustifications: () => Promise<void>;
  reviewJustification: (id: string, data: ReviewJustificationRequest) => Promise<boolean>;
  
  // Acciones - Alertas
  fetchAlerts: () => Promise<void>;
  markAlertAsRead: (id: string) => Promise<void>;
  resolveAlert: (id: string, notes?: string) => Promise<boolean>;
  
  // Acciones - Historial
  fetchGroupSummary: (groupId: string) => Promise<void>;
  fetchStudentHistory: (studentId: string) => Promise<void>;
  
  // Refresh
  refreshData: () => Promise<void>;
}

/**
 * Hook para gestión de datos de asistencia
 */
export function useAttendanceData(options: UseAttendanceDataOptions = {}): UseAttendanceDataReturn {
  const {
    autoFetch = false,
    loadAlerts = true,
    loadJustifications = true,
    groupId,
    date,
  } = options;

  // Store state
  const {
    records,
    activeSession,
    activeQR,
    alerts,
    pendingJustifications,
    groupSummary,
    studentHistory,
    filters,
    isLoading,
    isGeneratingQR,
    isSavingAttendance,
    error,
    successMessage,
    // Actions
    startSession,
    endSession,
    updateStudentStatus,
    updateAllStudentsStatus,
    setRecords,
    addRecord,
    setActiveQR,
    clearQR,
    setAlerts,
    markAlertRead,
    resolveAlert: resolveAlertInStore,
    setPendingJustifications,
    updateJustification,
    setGroupSummary,
    setStudentHistory,
    setLoading,
    setGeneratingQR,
    setSavingAttendance,
    setError,
    setSuccessMessage,
    setLastFetchTime,
    // Getters
    getSessionStats,
    getUnreadAlertsCount,
    getPendingJustificationsCount,
    shouldRefetch,
  } = useAttendanceStore();

  const { user } = useUserStore();

  /**
   * Iniciar sesión de asistencia
   */
  const startAttendanceSession = useCallback((params: {
    scheduleId: string;
    groupId: string;
    groupCode: string;
    date: string;
    subject?: string;
    venue?: string;
    students: StudentForAttendance[];
  }) => {
    startSession(params);
  }, [startSession]);

  /**
   * Finalizar sesión de asistencia
   */
  const endAttendanceSession = useCallback(() => {
    endSession();
  }, [endSession]);

  /**
   * Marcar asistencia individual
   */
  const markAttendance = useCallback(async (
    studentId: string,
    status: AttendanceStatus
  ): Promise<boolean> => {
    if (!activeSession) {
      setError('No hay sesión de asistencia activa');
      return false;
    }

    try {
      const request: CreateAttendanceRequest = {
        student_id: studentId,
        schedule_id: activeSession.scheduleId,
        academic_group_id: activeSession.groupId,
        date: activeSession.date,
        status,
        check_in_time: new Date().toTimeString().slice(0, 8),
        check_in_method: 'manual',
      };

      const response = await attendanceApi.createAttendance(request);

      if (response.success && response.data) {
        updateStudentStatus(studentId, status, response.data.data.id);
        addRecord(response.data.data);
        return true;
      } else {
        setError(response.message || 'Error al registrar asistencia');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return false;
    }
  }, [activeSession, updateStudentStatus, addRecord, setError]);

  /**
   * Marcar todos los estudiantes con un estado
   */
  const markAllAttendance = useCallback(async (status: AttendanceStatus): Promise<boolean> => {
    if (!activeSession) {
      setError('No hay sesión de asistencia activa');
      return false;
    }

    // Solo actualizar UI localmente
    updateAllStudentsStatus(status);
    return true;
  }, [activeSession, updateAllStudentsStatus, setError]);

  /**
   * Guardar toda la asistencia (bulk)
   */
  const saveAllAttendance = useCallback(async (): Promise<boolean> => {
    if (!activeSession) {
      setError('No hay sesión de asistencia activa');
      return false;
    }

    setSavingAttendance(true);
    setError(null);

    try {
      const studentsWithStatus = activeSession.students.filter(
        (s) => s.currentStatus && s.currentStatus !== 'pendiente'
      );

      if (studentsWithStatus.length === 0) {
        setError('No hay estudiantes con asistencia registrada');
        return false;
      }

      const request: BulkAttendanceRequest = {
        schedule_id: activeSession.scheduleId,
        academic_group_id: activeSession.groupId,
        date: activeSession.date,
        check_in_method: 'bulk',
        records: studentsWithStatus.map((s) => ({
          student_id: s.id,
          status: s.currentStatus!,
          check_in_time: new Date().toTimeString().slice(0, 8),
        })),
      };

      const response = await attendanceApi.bulkAttendance(request);

      if (response.success && response.data) {
        setSuccessMessage(
          `Asistencia guardada: ${response.data.success_count} registros`
        );
        setLastFetchTime(Date.now());
        return true;
      } else {
        setError(response.message || 'Error al guardar asistencia');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return false;
    } finally {
      setSavingAttendance(false);
    }
  }, [activeSession, setSavingAttendance, setError, setSuccessMessage, setLastFetchTime]);

  /**
   * Generar código QR
   */
  const generateQR = useCallback(async (
    params: Omit<GenerateQRRequest, 'schedule_id' | 'academic_group_id'>
  ): Promise<boolean> => {
    if (!activeSession) {
      setError('No hay sesión de asistencia activa');
      return false;
    }

    setGeneratingQR(true);
    setError(null);

    try {
      const request: GenerateQRRequest = {
        schedule_id: activeSession.scheduleId,
        academic_group_id: activeSession.groupId,
        ...params,
      };

      const response = await attendanceApi.generateQR(request);

      if (response.success && response.data) {
        setActiveQR(response.data.data);
        setSuccessMessage('Código QR generado correctamente');
        return true;
      } else {
        setError(response.message || 'Error al generar código QR');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return false;
    } finally {
      setGeneratingQR(false);
    }
  }, [activeSession, setGeneratingQR, setActiveQR, setError, setSuccessMessage]);

  /**
   * Refrescar estado del QR
   */
  const refreshQRStatus = useCallback(async () => {
    if (!activeQR) return;

    try {
      const response = await attendanceApi.getQRStatus(activeQR.id);
      if (response.success && response.data) {
        setActiveQR(response.data.data);
      }
    } catch (err) {
      console.error('Error refreshing QR status:', err);
    }
  }, [activeQR, setActiveQR]);

  /**
   * Desactivar QR
   */
  const deactivateQR = useCallback(() => {
    clearQR();
  }, [clearQR]);

  /**
   * Cargar justificaciones pendientes
   */
  const fetchJustifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      const params = {
        status: 'pendiente' as const,
        academic_group_id: groupId,
      };

      const response = await attendanceApi.listJustifications(params);

      if (response.success && response.data) {
        setPendingJustifications(response.data.justifications);
      }
    } catch (err) {
      console.error('Error fetching justifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, groupId, setLoading, setPendingJustifications]);

  /**
   * Revisar justificación
   */
  const reviewJustification = useCallback(async (
    id: string,
    data: ReviewJustificationRequest
  ): Promise<boolean> => {
    setLoading(true);

    try {
      const response = await attendanceApi.reviewJustification(id, data);

      if (response.success && response.data) {
        updateJustification(id, response.data.data);
        setSuccessMessage(
          `Justificación ${data.status === 'aprobada' ? 'aprobada' : 'rechazada'}`
        );
        return true;
      } else {
        setError(response.message || 'Error al revisar justificación');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, updateJustification, setSuccessMessage, setError]);

  /**
   * Cargar alertas
   */
  const fetchAlerts = useCallback(async () => {
    if (!user) return;

    try {
      const params = {
        instructor_id: user.role === 'instructor' ? user.id : undefined,
        academic_group_id: groupId,
      };

      const response = await attendanceApi.getActiveAlerts(params);

      if (response.success && response.data) {
        setAlerts(response.data.alerts);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  }, [user, groupId, setAlerts]);

  /**
   * Marcar alerta como leída
   */
  const markAlertAsReadFn = useCallback(async (id: string) => {
    try {
      await attendanceApi.markAlertAsRead(id);
      markAlertRead(id);
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  }, [markAlertRead]);

  /**
   * Resolver alerta
   */
  const resolveAlertFn = useCallback(async (
    id: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const response = await attendanceApi.resolveAlert(id, { resolution_notes: notes });

      if (response.success) {
        resolveAlertInStore(id);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error resolving alert:', err);
      return false;
    }
  }, [resolveAlertInStore]);

  /**
   * Cargar resumen de grupo
   */
  const fetchGroupSummary = useCallback(async (gId: string) => {
    setLoading(true);

    try {
      const response = await attendanceApi.getGroupSummary(gId);

      if (response.success && response.data) {
        setGroupSummary(response.data);
      }
    } catch (err) {
      console.error('Error fetching group summary:', err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setGroupSummary]);

  /**
   * Cargar historial de estudiante
   */
  const fetchStudentHistory = useCallback(async (studentId: string) => {
    setLoading(true);

    try {
      const response = await attendanceApi.getStudentHistory(studentId);

      if (response.success && response.data) {
        setStudentHistory(response.data);
      }
    } catch (err) {
      console.error('Error fetching student history:', err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setStudentHistory]);

  /**
   * Refrescar datos
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadAlerts ? fetchAlerts() : Promise.resolve(),
      loadJustifications ? fetchJustifications() : Promise.resolve(),
    ]);
  }, [loadAlerts, loadJustifications, fetchAlerts, fetchJustifications]);

  // Efectos
  useEffect(() => {
    if (loadAlerts) {
      fetchAlerts();
    }
  }, [loadAlerts, fetchAlerts]);

  useEffect(() => {
    if (loadJustifications) {
      fetchJustifications();
    }
  }, [loadJustifications, fetchJustifications]);

  // Refrescar QR cada 30 segundos si está activo
  useEffect(() => {
    if (!activeQR) return;

    const interval = setInterval(() => {
      refreshQRStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeQR, refreshQRStatus]);

  return {
    // Estado
    records,
    activeSession,
    activeQR,
    alerts,
    pendingJustifications,
    groupSummary,
    
    // Loading
    isLoading,
    isGeneratingQR,
    isSavingAttendance,
    error,
    successMessage,
    
    // Stats
    sessionStats: getSessionStats(),
    unreadAlertsCount: getUnreadAlertsCount(),
    pendingJustificationsCount: getPendingJustificationsCount(),
    
    // Acciones - Sesión
    startAttendanceSession,
    endAttendanceSession,
    
    // Acciones - Registro
    markAttendance,
    markAllAttendance,
    saveAllAttendance,
    
    // Acciones - QR
    generateQR,
    refreshQRStatus,
    deactivateQR,
    
    // Acciones - Justificaciones
    fetchJustifications,
    reviewJustification,
    
    // Acciones - Alertas
    fetchAlerts,
    markAlertAsRead: markAlertAsReadFn,
    resolveAlert: resolveAlertFn,
    
    // Acciones - Historial
    fetchGroupSummary,
    fetchStudentHistory,
    
    // Refresh
    refreshData,
  };
}

export default useAttendanceData;

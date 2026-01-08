/**
 * SICORA - Attendance Store (Zustand)
 *
 * Estado global para gestión de asistencia, QR y justificaciones.
 * Maneja:
 * - Registros de asistencia por sesión
 * - Estado de códigos QR activos
 * - Justificaciones pendientes
 * - Alertas de asistencia
 *
 * @fileoverview Attendance store
 * @module stores/attendanceStore
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceQRCode,
  Justification,
  AttendanceAlert,
  GroupAttendanceSummary,
  StudentAttendanceHistory,
} from '@/types/attendance.types';

/* =============================================================================
   INTERFACES
   ============================================================================= */

/**
 * Estudiante para registro de asistencia
 */
export interface StudentForAttendance {
  id: string;
  name: string;
  document?: string;
  photo?: string;
  currentStatus?: AttendanceStatus;
  attendanceId?: string;
}

/**
 * Sesión de asistencia activa (para una clase específica)
 */
export interface AttendanceSession {
  scheduleId: string;
  groupId: string;
  groupCode: string;
  date: string;
  subject?: string;
  venue?: string;
  students: StudentForAttendance[];
  startedAt: string;
  qrCode?: AttendanceQRCode;
}

/**
 * Filtros de asistencia
 */
export interface AttendanceFilters {
  groupId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: AttendanceStatus;
  studentId?: string;
}

/**
 * Estado del store de asistencia
 */
interface AttendanceState {
  // === DATOS ===
  /** Registros de asistencia cargados */
  records: AttendanceRecord[];
  /** Sesión de asistencia activa */
  activeSession: AttendanceSession | null;
  /** Código QR activo */
  activeQR: AttendanceQRCode | null;
  /** Justificaciones pendientes */
  pendingJustifications: Justification[];
  /** Alertas activas */
  alerts: AttendanceAlert[];
  /** Resumen por grupo */
  groupSummary: GroupAttendanceSummary | null;
  /** Historial de estudiante seleccionado */
  studentHistory: StudentAttendanceHistory | null;
  
  // === UI STATE ===
  /** Vista activa (registro, qr, historial) */
  activeTab: 'registro' | 'qr' | 'historial' | 'justificaciones' | 'alertas';
  /** Filtros activos */
  filters: AttendanceFilters;
  /** Estudiante seleccionado para ver detalles */
  selectedStudentId: string | null;
  
  // === LOADING & ERROR ===
  isLoading: boolean;
  isGeneratingQR: boolean;
  isSavingAttendance: boolean;
  error: string | null;
  successMessage: string | null;
  
  // === CACHE ===
  lastFetchTime: number | null;
  
  // === ACTIONS - SESSION ===
  startSession: (session: Omit<AttendanceSession, 'startedAt'>) => void;
  endSession: () => void;
  updateStudentStatus: (studentId: string, status: AttendanceStatus, attendanceId?: string) => void;
  updateAllStudentsStatus: (status: AttendanceStatus) => void;
  
  // === ACTIONS - RECORDS ===
  setRecords: (records: AttendanceRecord[]) => void;
  addRecord: (record: AttendanceRecord) => void;
  updateRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  
  // === ACTIONS - QR ===
  setActiveQR: (qr: AttendanceQRCode | null) => void;
  clearQR: () => void;
  
  // === ACTIONS - JUSTIFICATIONS ===
  setPendingJustifications: (justifications: Justification[]) => void;
  addJustification: (justification: Justification) => void;
  removeJustification: (id: string) => void;
  updateJustification: (id: string, updates: Partial<Justification>) => void;
  
  // === ACTIONS - ALERTS ===
  setAlerts: (alerts: AttendanceAlert[]) => void;
  markAlertRead: (id: string) => void;
  resolveAlert: (id: string) => void;
  
  // === ACTIONS - SUMMARY ===
  setGroupSummary: (summary: GroupAttendanceSummary | null) => void;
  setStudentHistory: (history: StudentAttendanceHistory | null) => void;
  
  // === ACTIONS - UI ===
  setActiveTab: (tab: AttendanceState['activeTab']) => void;
  setFilters: (filters: Partial<AttendanceFilters>) => void;
  clearFilters: () => void;
  setSelectedStudentId: (id: string | null) => void;
  
  // === ACTIONS - LOADING ===
  setLoading: (loading: boolean) => void;
  setGeneratingQR: (loading: boolean) => void;
  setSavingAttendance: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  setLastFetchTime: (time: number) => void;
  
  // === ACTIONS - RESET ===
  resetStore: () => void;
  
  // === GETTERS ===
  getStudentStatus: (studentId: string) => AttendanceStatus | undefined;
  getSessionStats: () => {
    total: number;
    present: number;
    absent: number;
    late: number;
    pending: number;
    percentage: number;
  };
  getUnreadAlertsCount: () => number;
  getPendingJustificationsCount: () => number;
  shouldRefetch: () => boolean;
}

/* =============================================================================
   INITIAL STATE
   ============================================================================= */

const initialFilters: AttendanceFilters = {};

/* =============================================================================
   STORE
   ============================================================================= */

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      // === INITIAL DATA ===
      records: [],
      activeSession: null,
      activeQR: null,
      pendingJustifications: [],
      alerts: [],
      groupSummary: null,
      studentHistory: null,
      
      // === INITIAL UI STATE ===
      activeTab: 'registro',
      filters: initialFilters,
      selectedStudentId: null,
      
      // === INITIAL LOADING ===
      isLoading: false,
      isGeneratingQR: false,
      isSavingAttendance: false,
      error: null,
      successMessage: null,
      lastFetchTime: null,
      
      // === ACTIONS - SESSION ===
      startSession: (sessionData) => {
        set({
          activeSession: {
            ...sessionData,
            startedAt: new Date().toISOString(),
          },
          activeTab: 'registro',
          error: null,
        });
      },
      
      endSession: () => {
        set({
          activeSession: null,
          activeQR: null,
        });
      },
      
      updateStudentStatus: (studentId, status, attendanceId) => {
        set((state) => {
          if (!state.activeSession) return state;
          
          return {
            activeSession: {
              ...state.activeSession,
              students: state.activeSession.students.map((s) =>
                s.id === studentId
                  ? { ...s, currentStatus: status, attendanceId }
                  : s
              ),
            },
          };
        });
      },
      
      updateAllStudentsStatus: (status) => {
        set((state) => {
          if (!state.activeSession) return state;
          
          return {
            activeSession: {
              ...state.activeSession,
              students: state.activeSession.students.map((s) => ({
                ...s,
                currentStatus: status,
              })),
            },
          };
        });
      },
      
      // === ACTIONS - RECORDS ===
      setRecords: (records) => {
        set({ records, lastFetchTime: Date.now() });
      },
      
      addRecord: (record) => {
        set((state) => ({
          records: [...state.records, record],
        }));
      },
      
      updateRecord: (id, updates) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },
      
      // === ACTIONS - QR ===
      setActiveQR: (activeQR) => set({ activeQR }),
      clearQR: () => set({ activeQR: null }),
      
      // === ACTIONS - JUSTIFICATIONS ===
      setPendingJustifications: (pendingJustifications) => set({ pendingJustifications }),
      
      addJustification: (justification) => {
        set((state) => ({
          pendingJustifications: [...state.pendingJustifications, justification],
        }));
      },
      
      removeJustification: (id) => {
        set((state) => ({
          pendingJustifications: state.pendingJustifications.filter((j) => j.id !== id),
        }));
      },
      
      updateJustification: (id, updates) => {
        set((state) => ({
          pendingJustifications: state.pendingJustifications.map((j) =>
            j.id === id ? { ...j, ...updates } : j
          ),
        }));
      },
      
      // === ACTIONS - ALERTS ===
      setAlerts: (alerts) => set({ alerts }),
      
      markAlertRead: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, is_read: true } : a
          ),
        }));
      },
      
      resolveAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, is_resolved: true } : a
          ),
        }));
      },
      
      // === ACTIONS - SUMMARY ===
      setGroupSummary: (groupSummary) => set({ groupSummary }),
      setStudentHistory: (studentHistory) => set({ studentHistory }),
      
      // === ACTIONS - UI ===
      setActiveTab: (activeTab) => set({ activeTab }),
      
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },
      
      clearFilters: () => set({ filters: initialFilters }),
      
      setSelectedStudentId: (selectedStudentId) => set({ selectedStudentId }),
      
      // === ACTIONS - LOADING ===
      setLoading: (isLoading) => set({ isLoading }),
      setGeneratingQR: (isGeneratingQR) => set({ isGeneratingQR }),
      setSavingAttendance: (isSavingAttendance) => set({ isSavingAttendance }),
      setError: (error) => set({ error, successMessage: null }),
      setSuccessMessage: (successMessage) => set({ successMessage, error: null }),
      setLastFetchTime: (lastFetchTime) => set({ lastFetchTime }),
      
      // === ACTIONS - RESET ===
      resetStore: () => {
        set({
          records: [],
          activeSession: null,
          activeQR: null,
          pendingJustifications: [],
          alerts: [],
          groupSummary: null,
          studentHistory: null,
          activeTab: 'registro',
          filters: initialFilters,
          selectedStudentId: null,
          isLoading: false,
          isGeneratingQR: false,
          isSavingAttendance: false,
          error: null,
          successMessage: null,
          lastFetchTime: null,
        });
      },
      
      // === GETTERS ===
      getStudentStatus: (studentId) => {
        const { activeSession } = get();
        if (!activeSession) return undefined;
        return activeSession.students.find((s) => s.id === studentId)?.currentStatus;
      },
      
      getSessionStats: () => {
        const { activeSession } = get();
        if (!activeSession) {
          return { total: 0, present: 0, absent: 0, late: 0, pending: 0, percentage: 0 };
        }
        
        const students = activeSession.students;
        const total = students.length;
        const present = students.filter((s) => s.currentStatus === 'presente').length;
        const absent = students.filter((s) => s.currentStatus === 'ausente').length;
        const late = students.filter((s) => s.currentStatus === 'tardanza').length;
        const pending = students.filter((s) => !s.currentStatus || s.currentStatus === 'pendiente').length;
        const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
        
        return { total, present, absent, late, pending, percentage };
      },
      
      getUnreadAlertsCount: () => {
        const { alerts } = get();
        return alerts.filter((a) => !a.is_read).length;
      },
      
      getPendingJustificationsCount: () => {
        const { pendingJustifications } = get();
        return pendingJustifications.filter((j) => j.status === 'pendiente').length;
      },
      
      shouldRefetch: () => {
        const { lastFetchTime } = get();
        if (!lastFetchTime) return true;
        const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos para asistencia
        return Date.now() - lastFetchTime > CACHE_DURATION;
      },
    }),
    {
      name: 'sicora-attendance-storage',
      partialize: (state) => ({
        // Solo persistir la sesión activa y tab
        activeSession: state.activeSession,
        activeTab: state.activeTab,
        filters: state.filters,
      }),
    }
  )
);

export default useAttendanceStore;

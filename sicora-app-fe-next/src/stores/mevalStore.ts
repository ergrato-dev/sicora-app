/**
 * Store para MevalService - Evaluación de Medidas y Sanciones
 * Gestión de estado con Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Committee,
  StudentCase,
  ImprovementPlan,
  Sanction,
  Appeal,
  CaseStatus,
  SanctionStatus,
  AppealStatus,
  ImprovementPlanStatus,
  CommitteeFilters,
  StudentCaseFilters,
  ImprovementPlanFilters,
  SanctionFilters,
  AppealFilters,
  MevalDashboardStats,
  INITIAL_COMMITTEE_FILTERS,
  INITIAL_STUDENT_CASE_FILTERS,
  INITIAL_IMPROVEMENT_PLAN_FILTERS,
  INITIAL_SANCTION_FILTERS,
  INITIAL_APPEAL_FILTERS,
} from '@/types/meval.types';

// ============================================================================
// TIPOS DEL STORE
// ============================================================================

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface MevalState {
  // Datos principales
  committees: Committee[];
  studentCases: StudentCase[];
  improvementPlans: ImprovementPlan[];
  sanctions: Sanction[];
  appeals: Appeal[];
  
  // Selección actual
  selectedCommittee: Committee | null;
  selectedCase: StudentCase | null;
  selectedPlan: ImprovementPlan | null;
  selectedSanction: Sanction | null;
  selectedAppeal: Appeal | null;
  
  // Dashboard stats
  dashboardStats: MevalDashboardStats | null;
  
  // Filtros
  committeeFilters: CommitteeFilters;
  caseFilters: StudentCaseFilters;
  planFilters: ImprovementPlanFilters;
  sanctionFilters: SanctionFilters;
  appealFilters: AppealFilters;
  
  // Paginación
  committeePagination: PaginationState;
  casePagination: PaginationState;
  planPagination: PaginationState;
  sanctionPagination: PaginationState;
  appealPagination: PaginationState;
  
  // UI State
  isLoading: boolean;
  isLoadingCommittees: boolean;
  isLoadingCases: boolean;
  isLoadingPlans: boolean;
  isLoadingSanctions: boolean;
  isLoadingAppeals: boolean;
  error: string | null;
  
  // Modals
  isCommitteeModalOpen: boolean;
  isCaseModalOpen: boolean;
  isPlanModalOpen: boolean;
  isSanctionModalOpen: boolean;
  isAppealModalOpen: boolean;
  isCaseDetailModalOpen: boolean;
  
  // Vista actual
  activeTab: 'casos' | 'comites' | 'planes' | 'sanciones' | 'apelaciones';
}

interface MevalActions {
  // Committees
  setCommittees: (committees: Committee[]) => void;
  addCommittee: (committee: Committee) => void;
  updateCommittee: (id: string, committee: Partial<Committee>) => void;
  removeCommittee: (id: string) => void;
  setSelectedCommittee: (committee: Committee | null) => void;
  
  // Student Cases
  setStudentCases: (cases: StudentCase[]) => void;
  addStudentCase: (studentCase: StudentCase) => void;
  updateStudentCase: (id: string, studentCase: Partial<StudentCase>) => void;
  setSelectedCase: (studentCase: StudentCase | null) => void;
  
  // Improvement Plans
  setImprovementPlans: (plans: ImprovementPlan[]) => void;
  addImprovementPlan: (plan: ImprovementPlan) => void;
  updateImprovementPlan: (id: string, plan: Partial<ImprovementPlan>) => void;
  setSelectedPlan: (plan: ImprovementPlan | null) => void;
  
  // Sanctions
  setSanctions: (sanctions: Sanction[]) => void;
  addSanction: (sanction: Sanction) => void;
  updateSanction: (id: string, sanction: Partial<Sanction>) => void;
  setSelectedSanction: (sanction: Sanction | null) => void;
  
  // Appeals
  setAppeals: (appeals: Appeal[]) => void;
  addAppeal: (appeal: Appeal) => void;
  updateAppeal: (id: string, appeal: Partial<Appeal>) => void;
  setSelectedAppeal: (appeal: Appeal | null) => void;
  
  // Dashboard
  setDashboardStats: (stats: MevalDashboardStats) => void;
  
  // Filters
  setCommitteeFilters: (filters: Partial<CommitteeFilters>) => void;
  setCaseFilters: (filters: Partial<StudentCaseFilters>) => void;
  setPlanFilters: (filters: Partial<ImprovementPlanFilters>) => void;
  setSanctionFilters: (filters: Partial<SanctionFilters>) => void;
  setAppealFilters: (filters: Partial<AppealFilters>) => void;
  resetAllFilters: () => void;
  
  // Pagination
  setCommitteePagination: (pagination: Partial<PaginationState>) => void;
  setCasePagination: (pagination: Partial<PaginationState>) => void;
  setPlanPagination: (pagination: Partial<PaginationState>) => void;
  setSanctionPagination: (pagination: Partial<PaginationState>) => void;
  setAppealPagination: (pagination: Partial<PaginationState>) => void;
  
  // Loading
  setLoading: (isLoading: boolean) => void;
  setLoadingCommittees: (isLoading: boolean) => void;
  setLoadingCases: (isLoading: boolean) => void;
  setLoadingPlans: (isLoading: boolean) => void;
  setLoadingSanctions: (isLoading: boolean) => void;
  setLoadingAppeals: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Modals
  openCommitteeModal: () => void;
  closeCommitteeModal: () => void;
  openCaseModal: () => void;
  closeCaseModal: () => void;
  openPlanModal: () => void;
  closePlanModal: () => void;
  openSanctionModal: () => void;
  closeSanctionModal: () => void;
  openAppealModal: () => void;
  closeAppealModal: () => void;
  openCaseDetailModal: (studentCase: StudentCase) => void;
  closeCaseDetailModal: () => void;
  
  // Tab
  setActiveTab: (tab: MevalState['activeTab']) => void;
  
  // Reset
  resetStore: () => void;
}

type MevalStore = MevalState & MevalActions;

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
};

const initialState: MevalState = {
  // Datos
  committees: [],
  studentCases: [],
  improvementPlans: [],
  sanctions: [],
  appeals: [],
  
  // Selección
  selectedCommittee: null,
  selectedCase: null,
  selectedPlan: null,
  selectedSanction: null,
  selectedAppeal: null,
  
  // Dashboard
  dashboardStats: null,
  
  // Filtros
  committeeFilters: INITIAL_COMMITTEE_FILTERS,
  caseFilters: INITIAL_STUDENT_CASE_FILTERS,
  planFilters: INITIAL_IMPROVEMENT_PLAN_FILTERS,
  sanctionFilters: INITIAL_SANCTION_FILTERS,
  appealFilters: INITIAL_APPEAL_FILTERS,
  
  // Paginación
  committeePagination: initialPagination,
  casePagination: initialPagination,
  planPagination: initialPagination,
  sanctionPagination: initialPagination,
  appealPagination: initialPagination,
  
  // UI
  isLoading: false,
  isLoadingCommittees: false,
  isLoadingCases: false,
  isLoadingPlans: false,
  isLoadingSanctions: false,
  isLoadingAppeals: false,
  error: null,
  
  // Modals
  isCommitteeModalOpen: false,
  isCaseModalOpen: false,
  isPlanModalOpen: false,
  isSanctionModalOpen: false,
  isAppealModalOpen: false,
  isCaseDetailModalOpen: false,
  
  // Tab
  activeTab: 'casos',
};

// ============================================================================
// STORE
// ============================================================================

export const useMevalStore = create<MevalStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // ========== COMMITTEES ==========
      setCommittees: (committees) =>
        set({ committees }, false, 'setCommittees'),
      
      addCommittee: (committee) =>
        set(
          (state) => ({ committees: [...state.committees, committee] }),
          false,
          'addCommittee'
        ),
      
      updateCommittee: (id, committee) =>
        set(
          (state) => ({
            committees: state.committees.map((c) =>
              c.id === id ? { ...c, ...committee } : c
            ),
            selectedCommittee:
              state.selectedCommittee?.id === id
                ? { ...state.selectedCommittee, ...committee }
                : state.selectedCommittee,
          }),
          false,
          'updateCommittee'
        ),
      
      removeCommittee: (id) =>
        set(
          (state) => ({
            committees: state.committees.filter((c) => c.id !== id),
            selectedCommittee:
              state.selectedCommittee?.id === id ? null : state.selectedCommittee,
          }),
          false,
          'removeCommittee'
        ),
      
      setSelectedCommittee: (committee) =>
        set({ selectedCommittee: committee }, false, 'setSelectedCommittee'),
      
      // ========== STUDENT CASES ==========
      setStudentCases: (cases) =>
        set({ studentCases: cases }, false, 'setStudentCases'),
      
      addStudentCase: (studentCase) =>
        set(
          (state) => ({ studentCases: [...state.studentCases, studentCase] }),
          false,
          'addStudentCase'
        ),
      
      updateStudentCase: (id, studentCase) =>
        set(
          (state) => ({
            studentCases: state.studentCases.map((c) =>
              c.id === id ? { ...c, ...studentCase } : c
            ),
            selectedCase:
              state.selectedCase?.id === id
                ? { ...state.selectedCase, ...studentCase }
                : state.selectedCase,
          }),
          false,
          'updateStudentCase'
        ),
      
      setSelectedCase: (studentCase) =>
        set({ selectedCase: studentCase }, false, 'setSelectedCase'),
      
      // ========== IMPROVEMENT PLANS ==========
      setImprovementPlans: (plans) =>
        set({ improvementPlans: plans }, false, 'setImprovementPlans'),
      
      addImprovementPlan: (plan) =>
        set(
          (state) => ({ improvementPlans: [...state.improvementPlans, plan] }),
          false,
          'addImprovementPlan'
        ),
      
      updateImprovementPlan: (id, plan) =>
        set(
          (state) => ({
            improvementPlans: state.improvementPlans.map((p) =>
              p.id === id ? { ...p, ...plan } : p
            ),
            selectedPlan:
              state.selectedPlan?.id === id
                ? { ...state.selectedPlan, ...plan }
                : state.selectedPlan,
          }),
          false,
          'updateImprovementPlan'
        ),
      
      setSelectedPlan: (plan) =>
        set({ selectedPlan: plan }, false, 'setSelectedPlan'),
      
      // ========== SANCTIONS ==========
      setSanctions: (sanctions) =>
        set({ sanctions }, false, 'setSanctions'),
      
      addSanction: (sanction) =>
        set(
          (state) => ({ sanctions: [...state.sanctions, sanction] }),
          false,
          'addSanction'
        ),
      
      updateSanction: (id, sanction) =>
        set(
          (state) => ({
            sanctions: state.sanctions.map((s) =>
              s.id === id ? { ...s, ...sanction } : s
            ),
            selectedSanction:
              state.selectedSanction?.id === id
                ? { ...state.selectedSanction, ...sanction }
                : state.selectedSanction,
          }),
          false,
          'updateSanction'
        ),
      
      setSelectedSanction: (sanction) =>
        set({ selectedSanction: sanction }, false, 'setSelectedSanction'),
      
      // ========== APPEALS ==========
      setAppeals: (appeals) =>
        set({ appeals }, false, 'setAppeals'),
      
      addAppeal: (appeal) =>
        set(
          (state) => ({ appeals: [...state.appeals, appeal] }),
          false,
          'addAppeal'
        ),
      
      updateAppeal: (id, appeal) =>
        set(
          (state) => ({
            appeals: state.appeals.map((a) =>
              a.id === id ? { ...a, ...appeal } : a
            ),
            selectedAppeal:
              state.selectedAppeal?.id === id
                ? { ...state.selectedAppeal, ...appeal }
                : state.selectedAppeal,
          }),
          false,
          'updateAppeal'
        ),
      
      setSelectedAppeal: (appeal) =>
        set({ selectedAppeal: appeal }, false, 'setSelectedAppeal'),
      
      // ========== DASHBOARD ==========
      setDashboardStats: (stats) =>
        set({ dashboardStats: stats }, false, 'setDashboardStats'),
      
      // ========== FILTERS ==========
      setCommitteeFilters: (filters) =>
        set(
          (state) => ({
            committeeFilters: { ...state.committeeFilters, ...filters },
          }),
          false,
          'setCommitteeFilters'
        ),
      
      setCaseFilters: (filters) =>
        set(
          (state) => ({
            caseFilters: { ...state.caseFilters, ...filters },
          }),
          false,
          'setCaseFilters'
        ),
      
      setPlanFilters: (filters) =>
        set(
          (state) => ({
            planFilters: { ...state.planFilters, ...filters },
          }),
          false,
          'setPlanFilters'
        ),
      
      setSanctionFilters: (filters) =>
        set(
          (state) => ({
            sanctionFilters: { ...state.sanctionFilters, ...filters },
          }),
          false,
          'setSanctionFilters'
        ),
      
      setAppealFilters: (filters) =>
        set(
          (state) => ({
            appealFilters: { ...state.appealFilters, ...filters },
          }),
          false,
          'setAppealFilters'
        ),
      
      resetAllFilters: () =>
        set(
          {
            committeeFilters: INITIAL_COMMITTEE_FILTERS,
            caseFilters: INITIAL_STUDENT_CASE_FILTERS,
            planFilters: INITIAL_IMPROVEMENT_PLAN_FILTERS,
            sanctionFilters: INITIAL_SANCTION_FILTERS,
            appealFilters: INITIAL_APPEAL_FILTERS,
          },
          false,
          'resetAllFilters'
        ),
      
      // ========== PAGINATION ==========
      setCommitteePagination: (pagination) =>
        set(
          (state) => ({
            committeePagination: { ...state.committeePagination, ...pagination },
          }),
          false,
          'setCommitteePagination'
        ),
      
      setCasePagination: (pagination) =>
        set(
          (state) => ({
            casePagination: { ...state.casePagination, ...pagination },
          }),
          false,
          'setCasePagination'
        ),
      
      setPlanPagination: (pagination) =>
        set(
          (state) => ({
            planPagination: { ...state.planPagination, ...pagination },
          }),
          false,
          'setPlanPagination'
        ),
      
      setSanctionPagination: (pagination) =>
        set(
          (state) => ({
            sanctionPagination: { ...state.sanctionPagination, ...pagination },
          }),
          false,
          'setSanctionPagination'
        ),
      
      setAppealPagination: (pagination) =>
        set(
          (state) => ({
            appealPagination: { ...state.appealPagination, ...pagination },
          }),
          false,
          'setAppealPagination'
        ),
      
      // ========== LOADING ==========
      setLoading: (isLoading) =>
        set({ isLoading }, false, 'setLoading'),
      
      setLoadingCommittees: (isLoadingCommittees) =>
        set({ isLoadingCommittees }, false, 'setLoadingCommittees'),
      
      setLoadingCases: (isLoadingCases) =>
        set({ isLoadingCases }, false, 'setLoadingCases'),
      
      setLoadingPlans: (isLoadingPlans) =>
        set({ isLoadingPlans }, false, 'setLoadingPlans'),
      
      setLoadingSanctions: (isLoadingSanctions) =>
        set({ isLoadingSanctions }, false, 'setLoadingSanctions'),
      
      setLoadingAppeals: (isLoadingAppeals) =>
        set({ isLoadingAppeals }, false, 'setLoadingAppeals'),
      
      setError: (error) =>
        set({ error }, false, 'setError'),
      
      // ========== MODALS ==========
      openCommitteeModal: () =>
        set({ isCommitteeModalOpen: true }, false, 'openCommitteeModal'),
      
      closeCommitteeModal: () =>
        set({ isCommitteeModalOpen: false, selectedCommittee: null }, false, 'closeCommitteeModal'),
      
      openCaseModal: () =>
        set({ isCaseModalOpen: true }, false, 'openCaseModal'),
      
      closeCaseModal: () =>
        set({ isCaseModalOpen: false }, false, 'closeCaseModal'),
      
      openPlanModal: () =>
        set({ isPlanModalOpen: true }, false, 'openPlanModal'),
      
      closePlanModal: () =>
        set({ isPlanModalOpen: false }, false, 'closePlanModal'),
      
      openSanctionModal: () =>
        set({ isSanctionModalOpen: true }, false, 'openSanctionModal'),
      
      closeSanctionModal: () =>
        set({ isSanctionModalOpen: false }, false, 'closeSanctionModal'),
      
      openAppealModal: () =>
        set({ isAppealModalOpen: true }, false, 'openAppealModal'),
      
      closeAppealModal: () =>
        set({ isAppealModalOpen: false }, false, 'closeAppealModal'),
      
      openCaseDetailModal: (studentCase) =>
        set(
          { isCaseDetailModalOpen: true, selectedCase: studentCase },
          false,
          'openCaseDetailModal'
        ),
      
      closeCaseDetailModal: () =>
        set(
          { isCaseDetailModalOpen: false, selectedCase: null },
          false,
          'closeCaseDetailModal'
        ),
      
      // ========== TAB ==========
      setActiveTab: (activeTab) =>
        set({ activeTab }, false, 'setActiveTab'),
      
      // ========== RESET ==========
      resetStore: () =>
        set(initialState, false, 'resetStore'),
    }),
    { name: 'meval-store' }
  )
);

// ============================================================================
// SELECTORES
// ============================================================================

/**
 * Selector: Casos filtrados por estado
 */
export const selectCasesByStatus = (status: CaseStatus) => (state: MevalStore) =>
  state.studentCases.filter((c) => c.status === status);

/**
 * Selector: Casos abiertos
 */
export const selectOpenCases = (state: MevalStore) =>
  state.studentCases.filter((c) => c.status === 'open' || c.status === 'under_review');

/**
 * Selector: Casos vencidos
 */
export const selectOverdueCases = (state: MevalStore) =>
  state.studentCases.filter((c) => c.isOverdue);

/**
 * Selector: Casos pendientes de decisión
 */
export const selectPendingDecisionCases = (state: MevalStore) =>
  state.studentCases.filter(
    (c) => c.status === 'under_review' && !c.committeeDecision
  );

/**
 * Selector: Sanciones activas
 */
export const selectActiveSanctions = (state: MevalStore) =>
  state.sanctions.filter((s) => s.status === 'active');

/**
 * Selector: Sanciones por estado
 */
export const selectSanctionsByStatus = (status: SanctionStatus) => (state: MevalStore) =>
  state.sanctions.filter((s) => s.status === status);

/**
 * Selector: Apelaciones pendientes
 */
export const selectPendingAppeals = (state: MevalStore) =>
  state.appeals.filter((a) => a.status === 'pending' || a.status === 'under_review');

/**
 * Selector: Apelaciones por estado
 */
export const selectAppealsByStatus = (status: AppealStatus) => (state: MevalStore) =>
  state.appeals.filter((a) => a.status === status);

/**
 * Selector: Planes activos
 */
export const selectActivePlans = (state: MevalStore) =>
  state.improvementPlans.filter(
    (p) => p.status === 'active' || p.status === 'in_progress'
  );

/**
 * Selector: Planes por estado
 */
export const selectPlansByStatus = (status: ImprovementPlanStatus) => (state: MevalStore) =>
  state.improvementPlans.filter((p) => p.status === status);

/**
 * Selector: Comités activos
 */
export const selectActiveCommittees = (state: MevalStore) =>
  state.committees.filter((c) => c.isActive);

/**
 * Selector: Casos por estudiante
 */
export const selectCasesByStudent = (studentId: string) => (state: MevalStore) =>
  state.studentCases.filter((c) => c.student.id === studentId);

/**
 * Selector: Sanciones por estudiante
 */
export const selectSanctionsByStudent = (studentId: string) => (state: MevalStore) =>
  state.sanctions.filter((s) => s.student.id === studentId);

/**
 * Selector: Estadísticas rápidas del dashboard
 */
export const selectQuickStats = (state: MevalStore) => ({
  totalCases: state.studentCases.length,
  openCases: state.studentCases.filter((c) => c.status === 'open').length,
  overdueCases: state.studentCases.filter((c) => c.isOverdue).length,
  activeSanctions: state.sanctions.filter((s) => s.status === 'active').length,
  pendingAppeals: state.appeals.filter((a) => a.status === 'pending').length,
  activePlans: state.improvementPlans.filter((p) => p.status === 'active' || p.status === 'in_progress').length,
});

/**
 * Selector: Casos por prioridad
 */
export const selectCasesByPriority = (state: MevalStore) => ({
  urgent: state.studentCases.filter((c) => c.priority === 'urgent').length,
  high: state.studentCases.filter((c) => c.priority === 'high').length,
  medium: state.studentCases.filter((c) => c.priority === 'medium').length,
  low: state.studentCases.filter((c) => c.priority === 'low').length,
});

export default useMevalStore;

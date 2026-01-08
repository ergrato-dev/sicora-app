/**
 * SICORA - API Clients Index
 *
 * Barrel export para todos los API clients del frontend.
 * Facilita la importación centralizada de funciones de API.
 *
 * NOTA: Para evitar conflictos de nombres entre módulos,
 * se exportan principalmente los objetos API agrupados.
 * Para funciones individuales, importar directamente del módulo.
 *
 * @example
 * // Importar API agrupada (recomendado)
 * import { authApi, attendanceApi, justificationsApi } from '@/lib/api';
 * 
 * // O importar funciones específicas del módulo
 * import { createJustification, approveJustification } from '@/lib/api/justifications';
 *
 * @fileoverview API clients barrel export
 * @module lib/api
 */

// ============================================================================
// EXPORTS DE APIs AGRUPADAS (recomendado)
// ============================================================================

export { default as authApi } from './auth';
export { default as dashboardApi } from './dashboard';
export { usersApi } from './users';
export { default as schedulesApi } from './schedules';
export { default as attendanceApi } from './attendance';
export { default as evaluationsApi } from './evaluations';
export { default as justificationsApi } from './justifications';
export { default as alertsApi } from './alerts';
export * as evalinApi from './evalin';

// ============================================================================
// RE-EXPORTS SELECTIVOS PARA RETROCOMPATIBILIDAD
// ============================================================================

// Auth - exports principales (sin conflictos)
export {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyToken,
} from './auth';

// Dashboard - exports sin conflictos
export {
  getUsersSummary,
  getSchedulesSummary,
  getGlobalAttendanceSummary,
  getAlertsSummary,
  getPendingJustificationsSummary,
  getRecentActivity,
} from './dashboard';

// Users - exports principales
export {
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listUsers,
} from './users';

// Schedules - exports principales
export {
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  listSchedules,
} from './schedules';

// Evaluations - exports principales
export {
  getEvaluation,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  listEvaluations,
} from './evaluations';

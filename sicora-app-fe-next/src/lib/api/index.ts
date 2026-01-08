/**
 * SICORA - API Clients Index
 *
 * Barrel export para todos los API clients del frontend.
 * Facilita la importación centralizada de funciones de API.
 *
 * @fileoverview API clients barrel export
 * @module lib/api
 */

// Auth API
export * from './auth';

// Dashboard API
export * from './dashboard';

// Users API
export * from './users';

// Schedules API (Sprint 5-6)
export * from './schedules';

// Attendance API (Sprint 5-6)
export * from './attendance';

// Re-export named exports
export { default as authApi } from './auth';
export { default as dashboardApi } from './dashboard';
export { usersApi } from './users';
export { default as schedulesApi } from './schedules';
export { default as attendanceApi } from './attendance';

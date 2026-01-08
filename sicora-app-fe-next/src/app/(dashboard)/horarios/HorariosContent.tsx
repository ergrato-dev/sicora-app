/**
 * SICORA - Contenido de Horarios (Client Component)
 *
 * Integra el componente Calendar con los datos del backend
 * usando el hook useScheduleData y el store de schedules.
 *
 * @fileoverview Horarios content component
 * @module app/(dashboard)/horarios/HorariosContent
 */

'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  RefreshCw,
  AlertCircle,
  Filter,
  Download,
  Upload,
  Settings,
  ChevronDown,
  Search,
  X,
} from 'lucide-react';
import { Calendar } from '@/components/ui/Calendar/Calendar';
import { useScheduleData } from '@/hooks/useScheduleData';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useUserStore } from '@/stores/userStore';
import type { ClaseProgramada, CalendarView } from '@/types/calendar.types';
import { mapScheduleToClaseProgramada } from '@/types/schedule.types';

/**
 * Contenido principal de la página de Horarios
 */
export function HorariosContent() {
  // Estado del usuario
  const { user } = useUserStore();

  // Datos de horarios
  const {
    schedules,
    isLoading,
    error,
    groups,
    venues,
    refreshData,
  } = useScheduleData({
    autoFetch: true,
    loadMasterData: true,
  });

  // Store para UI state
  const {
    calendarView,
    setCalendarView,
    selectedDate,
    setSelectedDate,
    filters,
    setFilters,
    clearFilters,
  } = useScheduleStore();

  // Estado local para filtros expandidos
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Mapear schedules del backend a ClaseProgramada del Calendar
   */
  const clasesProgramadas: ClaseProgramada[] = useMemo(() => {
    return schedules.map(mapScheduleToClaseProgramada);
  }, [schedules]);

  /**
   * Obtener fichas activas del usuario (para filtro rápido)
   */
  const userGroups = useMemo(() => {
    if (!user) return [];
    
    if (user.role === 'instructor') {
      return groups.filter(g => 
        g.instructor_director_id === user.id || 
        schedules.some(s => s.instructor_id === user.id && s.academic_group_id === g.id)
      );
    }
    
    return groups;
  }, [groups, schedules, user]);

  /**
   * Handlers
   */
  const handleViewChange = useCallback((view: CalendarView) => {
    setCalendarView(view);
  }, [setCalendarView]);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, [setSelectedDate]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setFilters({ searchTerm: term });
  }, [setFilters]);

  const handleGroupFilter = useCallback((groupId: string | undefined) => {
    setFilters({ academic_group_id: groupId });
  }, [setFilters]);

  const handleJornadaFilter = useCallback((jornada: string) => {
    setFilters({ jornada: jornada as 'manana' | 'tarde' | 'noche' | 'todas' });
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setSearchTerm('');
  }, [clearFilters]);

  /**
   * Verificar si hay filtros activos
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.academic_group_id ||
      filters.venue_id ||
      filters.jornada !== 'todas' ||
      searchTerm
    );
  }, [filters, searchTerm]);

  /**
   * Renderizar barra de herramientas
   */
  const renderToolbar = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Título y descripción */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Horarios
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Programación y asignación de horarios académicos
        </p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {/* Búsqueda rápida */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-48 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-700"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
            border transition-colors
            ${hasActiveFilters 
              ? 'border-sena-primary-500 text-sena-primary-600 bg-sena-primary-50' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300'
            }
          `}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-sena-primary-500" />
          )}
        </button>

        {/* Refrescar */}
        <button
          onClick={() => refreshData()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        {/* Nuevo horario (solo instructores/admin) */}
        {(user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'coordinador') && (
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sena-primary-500 rounded-lg hover:bg-sena-primary-600 transition-colors">
            <CalendarIcon className="h-4 w-4" />
            Nuevo Horario
          </button>
        )}
      </div>
    </div>
  );

  /**
   * Renderizar panel de filtros expandido
   */
  const renderFiltersPanel = () => (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              {/* Filtro por ficha */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ficha
                </label>
                <select
                  value={filters.academic_group_id || ''}
                  onChange={(e) => handleGroupFilter(e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sena-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Todas las fichas</option>
                  {userGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.code} - {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por jornada */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jornada
                </label>
                <select
                  value={filters.jornada || 'todas'}
                  onChange={(e) => handleJornadaFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sena-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="todas">Todas las jornadas</option>
                  <option value="manana">🌅 Mañana</option>
                  <option value="tarde">☀️ Tarde</option>
                  <option value="noche">🌙 Noche</option>
                </select>
              </div>

              {/* Filtro por ambiente */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ambiente
                </label>
                <select
                  value={filters.venue_id || ''}
                  onChange={(e) => setFilters({ venue_id: e.target.value || undefined })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sena-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Todos los ambientes</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón limpiar filtros */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /**
   * Renderizar mensaje de error
   */
  const renderError = () => (
    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Error al cargar horarios
          </h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
          <button
            onClick={() => refreshData()}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * Renderizar estado vacío
   */
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No hay horarios programados
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {hasActiveFilters
          ? 'No se encontraron horarios con los filtros seleccionados. Intenta ajustar los filtros.'
          : 'Aún no tienes horarios programados. Crea tu primer horario para comenzar.'}
      </p>
      {hasActiveFilters ? (
        <button
          onClick={handleClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-sena-primary-600 bg-sena-primary-50 rounded-lg hover:bg-sena-primary-100"
        >
          Limpiar filtros
        </button>
      ) : (
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sena-primary-500 rounded-lg hover:bg-sena-primary-600">
          <CalendarIcon className="h-4 w-4" />
          Crear primer horario
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {renderToolbar()}

      {/* Panel de filtros */}
      {renderFiltersPanel()}

      {/* Error */}
      {error && renderError()}

      {/* Contenido principal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading && schedules.length === 0 ? (
          // Loading skeleton
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-8 w-8 text-sena-primary-500 animate-spin" />
              <p className="text-sm text-gray-500">Cargando horarios...</p>
            </div>
          </div>
        ) : schedules.length === 0 ? (
          // Empty state
          renderEmptyState()
        ) : (
          // Calendar
          <Calendar
            clases={clasesProgramadas}
            config={{
              showSidebar: true,
              showStatistics: true,
              showLegend: true,
              allowEdit: user?.role === 'instructor' || user?.role === 'admin',
              allowCreate: user?.role === 'instructor' || user?.role === 'admin',
              hoursRange: { start: 6, end: 22 },
              enableDragDrop: user?.role === 'instructor' || user?.role === 'admin',
            }}
            initialView={calendarView}
            initialDate={selectedDate}
            onViewChange={handleViewChange}
            onDateChange={handleDateChange}
          />
        )}
      </div>

      {/* Estadísticas rápidas (footer) */}
      {schedules.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 px-1">
          <span>
            {schedules.length} {schedules.length === 1 ? 'horario' : 'horarios'} programados
          </span>
          <span>
            Última actualización: {new Date().toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      )}
    </div>
  );
}

export default HorariosContent;

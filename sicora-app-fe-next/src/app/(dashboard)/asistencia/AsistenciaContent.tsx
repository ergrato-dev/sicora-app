/**
 * SICORA - Contenido de Asistencia (Client Component)
 *
 * Módulo completo de gestión de asistencia con:
 * - Registro manual de asistencia
 * - Generación de códigos QR
 * - Historial y reportes
 * - Gestión de justificaciones
 * - Alertas de inasistencia
 *
 * @fileoverview Asistencia content component
 * @module app/(dashboard)/asistencia/AsistenciaContent
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  QrCode,
  History,
  FileText,
  Bell,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  Play,
  Square,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { QRGenerator, AttendanceList } from '@/components/attendance';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { useAttendanceStore, type StudentForAttendance } from '@/stores/attendanceStore';
import type { AcademicGroup } from '@/types/schedule.types';

/* =============================================================================
   CONSTANTES
   ============================================================================= */

const TABS = [
  { id: 'registro', label: 'Registro', icon: Users },
  { id: 'qr', label: 'Código QR', icon: QrCode },
  { id: 'historial', label: 'Historial', icon: History },
  { id: 'justificaciones', label: 'Justificaciones', icon: FileText },
  { id: 'alertas', label: 'Alertas', icon: Bell },
] as const;

type TabId = typeof TABS[number]['id'];

/* =============================================================================
   DATOS DEMO (mientras no hay backend)
   ============================================================================= */

const DEMO_STUDENTS: StudentForAttendance[] = [
  { id: '1', name: 'Juan Carlos Pérez García', document: '1234567890' },
  { id: '2', name: 'María Fernanda López Rodríguez', document: '0987654321' },
  { id: '3', name: 'Carlos Andrés Martínez Silva', document: '1122334455' },
  { id: '4', name: 'Ana Sofía González Hernández', document: '5544332211' },
  { id: '5', name: 'Luis Miguel Ramírez Torres', document: '6677889900' },
  { id: '6', name: 'Diana Carolina Sánchez Díaz', document: '1199228837' },
  { id: '7', name: 'Andrés Felipe Castro Moreno', document: '3344556677' },
  { id: '8', name: 'Laura Valentina Ruiz Vargas', document: '7788990011' },
  { id: '9', name: 'Santiago José Herrera Pinto', document: '2233445566' },
  { id: '10', name: 'Camila Andrea Jiménez Rojas', document: '8899001122' },
];

const DEMO_GROUPS: AcademicGroup[] = [
  {
    id: 'g1',
    code: '2826503',
    program_id: 'p1',
    program_name: 'Análisis y Desarrollo de Software',
    name: 'ADSO Mañana 2024',
    jornada: 'manana',
    campus_id: 'c1',
    campus_name: 'Sede Formación',
    max_students: 30,
    current_students: 25,
    status: 'en_formacion',
    trimestre_actual: 2,
    fecha_inicio: '2024-01-15',
    fecha_fin_lectiva: '2025-06-15',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'g2',
    code: '2826504',
    program_id: 'p1',
    program_name: 'Análisis y Desarrollo de Software',
    name: 'ADSO Tarde 2024',
    jornada: 'tarde',
    campus_id: 'c1',
    campus_name: 'Sede Formación',
    max_students: 30,
    current_students: 28,
    status: 'en_formacion',
    trimestre_actual: 2,
    fecha_inicio: '2024-01-15',
    fecha_fin_lectiva: '2025-06-15',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

/* =============================================================================
   COMPONENTE PRINCIPAL
   ============================================================================= */

export function AsistenciaContent() {
  // Estado del usuario
  const { user } = useUserStore();
  
  // Store de asistencia
  const {
    activeTab,
    setActiveTab,
    activeSession,
  } = useAttendanceStore();

  // Hook de datos
  const {
    activeQR,
    isLoading,
    isGeneratingQR,
    isSavingAttendance,
    error,
    successMessage,
    sessionStats,
    unreadAlertsCount,
    pendingJustificationsCount,
    startAttendanceSession,
    endAttendanceSession,
    markAttendance,
    markAllAttendance,
    saveAllAttendance,
    generateQR,
    refreshQRStatus,
    deactivateQR,
  } = useAttendanceData({
    loadAlerts: true,
    loadJustifications: true,
  });

  // Estado local
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [showSessionSetup, setShowSessionSetup] = useState(!activeSession);

  // Grupos disponibles (demo por ahora)
  const availableGroups = useMemo(() => DEMO_GROUPS, []);

  // Grupo seleccionado
  const selectedGroup = useMemo(() => {
    return availableGroups.find((g) => g.id === selectedGroupId);
  }, [availableGroups, selectedGroupId]);

  /**
   * Iniciar sesión de asistencia
   */
  const handleStartSession = useCallback(() => {
    if (!selectedGroup) return;

    startAttendanceSession({
      scheduleId: `schedule-${Date.now()}`, // En producción vendría del horario seleccionado
      groupId: selectedGroup.id,
      groupCode: selectedGroup.code,
      date: new Date().toISOString().split('T')[0],
      subject: selectedGroup.program_name,
      venue: 'Ambiente 301', // En producción vendría del horario
      students: DEMO_STUDENTS.map((s) => ({
        ...s,
        currentStatus: undefined,
      })),
    });

    setShowSessionSetup(false);
  }, [selectedGroup, startAttendanceSession]);

  /**
   * Finalizar sesión
   */
  const handleEndSession = useCallback(() => {
    if (sessionStats.pending > 0) {
      const confirm = window.confirm(
        `Hay ${sessionStats.pending} estudiantes sin registrar. ¿Desea finalizar la sesión?`
      );
      if (!confirm) return;
    }

    endAttendanceSession();
    setShowSessionSetup(true);
  }, [sessionStats.pending, endAttendanceSession]);

  /**
   * Renderizar header
   */
  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Asistencia
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Registro y control de asistencia académica
        </p>
      </div>

      {/* Info de sesión activa */}
      {activeSession && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">
              Sesión activa: {activeSession.groupCode}
            </span>
          </div>
          <button
            type="button"
            onClick={handleEndSession}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          >
            <Square className="h-4 w-4" />
            Finalizar
          </button>
        </div>
      )}
    </div>
  );

  /**
   * Renderizar tabs
   */
  const renderTabs = () => (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 overflow-x-auto">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        // Badge para alertas y justificaciones
        let badge = 0;
        if (tab.id === 'alertas') badge = unreadAlertsCount;
        if (tab.id === 'justificaciones') badge = pendingJustificationsCount;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap',
              isActive
                ? 'bg-white dark:bg-gray-700 text-sena-primary-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {badge > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  /**
   * Renderizar setup de sesión
   */
  const renderSessionSetup = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sena-primary-100 rounded-full mb-4">
          <Play className="h-8 w-8 text-sena-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Iniciar Sesión de Asistencia
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Selecciona la ficha para comenzar a registrar asistencia
        </p>
      </div>

      {/* Selector de ficha */}
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ficha / Grupo
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-sena-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Seleccionar ficha...</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.code} - {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* Info de ficha seleccionada */}
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
          >
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Programa:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedGroup.program_name}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Jornada:</span>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {selectedGroup.jornada}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Estudiantes:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedGroup.current_students}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Trimestre:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedGroup.trimestre_actual}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Fecha actual */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Botón iniciar */}
        <button
          type="button"
          onClick={handleStartSession}
          disabled={!selectedGroupId}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-6 py-3',
            'bg-sena-primary-500 text-white font-medium rounded-xl',
            'hover:bg-sena-primary-600 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Play className="h-5 w-5" />
          Iniciar Sesión
        </button>
      </div>
    </div>
  );

  /**
   * Renderizar contenido de tab Registro
   */
  const renderRegistroTab = () => {
    if (!activeSession) {
      return renderSessionSetup();
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de asistencia */}
        <div className="lg:col-span-2">
          <AttendanceList
            students={activeSession.students}
            isSaving={isSavingAttendance}
            onMarkAttendance={markAttendance}
            onMarkAll={markAllAttendance}
            onSaveAll={saveAllAttendance}
            stats={sessionStats}
          />
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Info de sesión */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Información de Sesión
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>Ficha: {activeSession.groupCode}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(activeSession.date).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
              {activeSession.venue && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{activeSession.venue}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>
                  Iniciada: {new Date(activeSession.startedAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* QR Generator mini */}
          <QRGenerator
            activeQR={activeQR}
            isGenerating={isGeneratingQR}
            onGenerate={generateQR}
            onRefresh={refreshQRStatus}
            onDeactivate={deactivateQR}
            sessionInfo={{
              groupCode: activeSession.groupCode,
              subject: activeSession.subject,
              venue: activeSession.venue,
            }}
          />
        </div>
      </div>
    );
  };

  /**
   * Renderizar contenido de tab QR
   */
  const renderQRTab = () => {
    if (!activeSession) {
      return (
        <div className="text-center py-16">
          <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Inicia una sesión primero
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Debes iniciar una sesión de asistencia para generar códigos QR
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('registro')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sena-primary-500 text-white rounded-lg hover:bg-sena-primary-600"
          >
            <Play className="h-4 w-4" />
            Ir a Registro
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto">
        <QRGenerator
          activeQR={activeQR}
          isGenerating={isGeneratingQR}
          onGenerate={generateQR}
          onRefresh={refreshQRStatus}
          onDeactivate={deactivateQR}
          sessionInfo={{
            groupCode: activeSession.groupCode,
            subject: activeSession.subject,
            venue: activeSession.venue,
          }}
        />
      </div>
    );
  };

  /**
   * Renderizar contenido de tab Historial
   */
  const renderHistorialTab = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
      <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Historial de Asistencia
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Aquí podrás consultar el historial de asistencia por fecha, ficha o estudiante.
      </p>
      <p className="text-sm text-gray-400">Módulo en desarrollo</p>
    </div>
  );

  /**
   * Renderizar contenido de tab Justificaciones
   */
  const renderJustificacionesTab = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Gestión de Justificaciones
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Revisa y aprueba las justificaciones de inasistencia de los aprendices.
      </p>
      {pendingJustificationsCount > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{pendingJustificationsCount} pendientes de revisión</span>
        </div>
      )}
      <p className="text-sm text-gray-400 mt-4">Módulo en desarrollo</p>
    </div>
  );

  /**
   * Renderizar contenido de tab Alertas
   */
  const renderAlertasTab = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
      <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Alertas de Asistencia
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Monitorea alertas de inasistencia frecuente y estudiantes en riesgo.
      </p>
      {unreadAlertsCount > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span>{unreadAlertsCount} alertas sin leer</span>
        </div>
      )}
      <p className="text-sm text-gray-400 mt-4">Módulo en desarrollo</p>
    </div>
  );

  /**
   * Renderizar contenido según tab activo
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'registro':
        return renderRegistroTab();
      case 'qr':
        return renderQRTab();
      case 'historial':
        return renderHistorialTab();
      case 'justificaciones':
        return renderJustificacionesTab();
      case 'alertas':
        return renderAlertasTab();
      default:
        return null;
    }
  };

  /**
   * Renderizar mensajes de error/éxito
   */
  const renderMessages = () => (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
        </motion.div>
      )}
      
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3"
        >
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      {renderHeader()}

      {/* Mensajes */}
      {renderMessages()}

      {/* Tabs */}
      {renderTabs()}

      {/* Contenido */}
      {renderTabContent()}
    </div>
  );
}

export default AsistenciaContent;

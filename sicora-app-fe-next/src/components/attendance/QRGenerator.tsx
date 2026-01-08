/**
 * SICORA - Componente QR Generator para Asistencia
 *
 * Genera y muestra códigos QR para toma de asistencia.
 * Los aprendices pueden escanear el QR desde la app móvil
 * para registrar su asistencia automáticamente.
 *
 * @fileoverview QR Generator component
 * @module components/attendance/QRGenerator
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  RefreshCw,
  Clock,
  Users,
  MapPin,
  X,
  AlertTriangle,
  Copy,
  Download,
  Maximize2,
  Settings,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AttendanceQRCode } from '@/types/attendance.types';

/* =============================================================================
   INTERFACES
   ============================================================================= */

interface QRGeneratorProps {
  /** Código QR activo */
  activeQR: AttendanceQRCode | null;
  /** Si está generando */
  isGenerating: boolean;
  /** Callback para generar QR */
  onGenerate: (options: {
    duration_minutes?: number;
    require_location?: boolean;
  }) => Promise<boolean>;
  /** Callback para refrescar estado */
  onRefresh: () => Promise<void>;
  /** Callback para desactivar */
  onDeactivate: () => void;
  /** Información de la sesión */
  sessionInfo?: {
    groupCode: string;
    subject?: string;
    venue?: string;
  };
  /** Clase adicional */
  className?: string;
}

/* =============================================================================
   CONSTANTES
   ============================================================================= */

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
];

/* =============================================================================
   COMPONENTE PRINCIPAL
   ============================================================================= */

export function QRGenerator({
  activeQR,
  isGenerating,
  onGenerate,
  onRefresh,
  onDeactivate,
  sessionInfo,
  className,
}: QRGeneratorProps) {
  // Estado local
  const [duration, setDuration] = useState(30);
  const [requireLocation, setRequireLocation] = useState(false);
  const [showSettings, setShowSettings] = useState(!activeQR);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * Calcular tiempo restante
   */
  useEffect(() => {
    if (!activeQR) {
      setTimeRemaining(null);
      return;
    }

    const calculateRemaining = () => {
      const validUntil = new Date(activeQR.valid_until).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((validUntil - now) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        onDeactivate();
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [activeQR, onDeactivate]);

  /**
   * Formatear tiempo restante
   */
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Handler para generar QR
   */
  const handleGenerate = async () => {
    const success = await onGenerate({
      duration_minutes: duration,
      require_location: requireLocation,
    });
    if (success) {
      setShowSettings(false);
    }
  };

  /**
   * Copiar enlace de QR
   */
  const handleCopyLink = () => {
    if (activeQR) {
      navigator.clipboard.writeText(`${window.location.origin}/asistencia/qr/${activeQR.token}`);
    }
  };

  /**
   * Descargar QR como imagen
   */
  const handleDownload = () => {
    if (activeQR?.qr_code) {
      const link = document.createElement('a');
      link.href = activeQR.qr_code;
      link.download = `qr-asistencia-${activeQR.id}.png`;
      link.click();
    }
  };

  /**
   * Renderizar configuración
   */
  const renderSettings = () => (
    <div className="space-y-4">
      {/* Duración */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Duración del código QR
        </label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDuration(opt.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                duration === opt.value
                  ? 'bg-sena-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requerir ubicación */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Requerir ubicación
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            El aprendiz debe estar cerca del aula
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRequireLocation(!requireLocation)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            requireLocation ? 'bg-sena-primary-500' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              requireLocation ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Botón generar */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-3',
          'bg-sena-primary-500 text-white font-medium rounded-xl',
          'hover:bg-sena-primary-600 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <QrCode className="h-5 w-5" />
            Generar Código QR
          </>
        )}
      </button>
    </div>
  );

  /**
   * Renderizar QR activo
   */
  const renderActiveQR = () => {
    if (!activeQR) return null;

    const isExpiringSoon = timeRemaining !== null && timeRemaining < 60;
    const isExpired = timeRemaining !== null && timeRemaining <= 0;

    return (
      <div className="space-y-4">
        {/* Header con tiempo restante */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isExpired ? 'bg-red-500' : isExpiringSoon ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              )}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isExpired ? 'Expirado' : 'QR Activo'}
            </span>
          </div>
          
          {timeRemaining !== null && !isExpired && (
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className={cn(
                'font-mono font-medium',
                isExpiringSoon ? 'text-yellow-600' : 'text-gray-700 dark:text-gray-300'
              )}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Código QR */}
        <div
          className={cn(
            'relative flex items-center justify-center p-6 bg-white rounded-xl',
            'border-2',
            isExpired ? 'border-red-300' : 'border-gray-200'
          )}
        >
          {activeQR.qr_code ? (
            <img
              src={activeQR.qr_code}
              alt="Código QR para asistencia"
              className={cn(
                'w-48 h-48 md:w-64 md:h-64',
                isExpired && 'opacity-30'
              )}
            />
          ) : (
            <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <QrCode className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Overlay si expiró */}
          {isExpired && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="font-medium text-red-600">Código expirado</p>
              </div>
            </div>
          )}

          {/* Botón fullscreen */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Ver en pantalla completa"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Información de la sesión */}
        {sessionInfo && (
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" />
              {sessionInfo.groupCode}
            </span>
            {sessionInfo.venue && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {sessionInfo.venue}
              </span>
            )}
          </div>
        )}

        {/* Estadísticas de escaneo */}
        <div className="flex items-center justify-center gap-6 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-sena-primary-600">
              {activeQR.scans_count}
            </p>
            <p className="text-xs text-gray-500">Escaneos</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            <Copy className="h-4 w-4" />
            Copiar enlace
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            <Download className="h-4 w-4" />
            Descargar
          </button>
        </div>

        {/* Botones secundarios */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onRefresh}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => {
              onDeactivate();
              setShowSettings(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            Desactivar
          </button>
        </div>
      </div>
    );
  };

  /**
   * Modal fullscreen
   */
  const renderFullscreenModal = () => (
    <AnimatePresence>
      {isFullscreen && activeQR && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center">
            {/* Tiempo restante */}
            {timeRemaining !== null && (
              <div className="mb-6 text-white">
                <p className="text-sm opacity-75">Tiempo restante</p>
                <p className="text-4xl font-mono font-bold">{formatTime(timeRemaining)}</p>
              </div>
            )}

            {/* QR */}
            <div className="bg-white p-8 rounded-2xl">
              <img
                src={activeQR.qr_code}
                alt="Código QR"
                className="w-80 h-80 md:w-96 md:h-96"
              />
            </div>

            {/* Info */}
            {sessionInfo && (
              <div className="mt-6 text-white">
                <p className="text-xl font-medium">{sessionInfo.groupCode}</p>
                {sessionInfo.subject && (
                  <p className="text-sm opacity-75 mt-1">{sessionInfo.subject}</p>
                )}
              </div>
            )}

            {/* Escaneos */}
            <div className="mt-4 text-white">
              <p className="text-3xl font-bold">{activeQR.scans_count}</p>
              <p className="text-sm opacity-75">estudiantes escanearon</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-sena-primary-500" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Código QR
          </h3>
        </div>
        
        {activeQR && (
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {showSettings && !activeQR ? renderSettings() : renderActiveQR()}
      </div>

      {/* Fullscreen modal */}
      {renderFullscreenModal()}
    </div>
  );
}

export default QRGenerator;

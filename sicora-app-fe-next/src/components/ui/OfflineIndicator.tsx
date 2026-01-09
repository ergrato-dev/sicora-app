/**
 * Componente OfflineIndicator - Indicador visual de estado offline
 * Sprint 15-16: PWA y funcionalidad offline
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Signal,
  SignalLow,
  RefreshCw,
  CloudOff,
  Cloud,
  Upload,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import {
  useOfflineStore,
  selectPendingSyncCount,
  selectFailedSyncCount,
  selectHasConflicts,
} from '@/stores/offlineStore';
import { ConnectionStatus, CONNECTION_STATUS_CONFIG } from '@/types/offline.types';

// ============================================================================
// TIPOS
// ============================================================================

interface OfflineIndicatorProps {
  /** Posición del indicador */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
  /** Mostrar detalles expandidos */
  showDetails?: boolean;
  /** Mostrar solo cuando está offline */
  hideWhenOnline?: boolean;
  /** Callback cuando cambia el estado */
  onStatusChange?: (isOnline: boolean) => void;
  /** Clases CSS adicionales */
  className?: string;
}

type IndicatorVariant = 'online' | 'offline' | 'slow' | 'reconnecting' | 'syncing';

// ============================================================================
// CONFIGURACIÓN DE ESTILOS
// ============================================================================

const variantStyles: Record<IndicatorVariant, {
  bg: string;
  text: string;
  border: string;
  icon: string;
}> = {
  online: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: 'text-green-500',
  },
  offline: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'text-red-500',
  },
  slow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: 'text-yellow-500',
  },
  reconnecting: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'text-blue-500',
  },
  syncing: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: 'text-purple-500',
  },
};

const positionStyles: Record<NonNullable<OfflineIndicatorProps['position']>, string> = {
  'top-left': 'fixed top-4 left-4 z-50',
  'top-right': 'fixed top-4 right-4 z-50',
  'bottom-left': 'fixed bottom-4 left-4 z-50',
  'bottom-right': 'fixed bottom-4 right-4 z-50',
  'inline': '',
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function OfflineIndicator({
  position = 'bottom-right',
  showDetails = false,
  hideWhenOnline = false,
  onStatusChange,
  className = '',
}: OfflineIndicatorProps) {
  const {
    isOnline,
    status,
    quality,
    effectiveType,
    downlink,
    rtt,
    checkConnection,
  } = useOnlineStatus();

  const pendingSyncCount = useOfflineStore(selectPendingSyncCount);
  const failedSyncCount = useOfflineStore(selectFailedSyncCount);
  const hasConflicts = useOfflineStore(selectHasConflicts);
  const isSyncing = useOfflineStore((state) => state.isSyncing);
  const processSyncQueue = useOfflineStore((state) => state.processSyncQueue);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Notificar cambios de estado
  useEffect(() => {
    onStatusChange?.(isOnline);
  }, [isOnline, onStatusChange]);

  // Ocultar si está online y hideWhenOnline es true
  useEffect(() => {
    if (hideWhenOnline && isOnline && pendingSyncCount === 0 && failedSyncCount === 0) {
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
    setIsVisible(true);
  }, [isOnline, hideWhenOnline, pendingSyncCount, failedSyncCount]);

  // Determinar variante del indicador
  const getVariant = (): IndicatorVariant => {
    if (isSyncing) return 'syncing';
    if (status === ConnectionStatus.OFFLINE) return 'offline';
    if (status === ConnectionStatus.SLOW) return 'slow';
    if (status === ConnectionStatus.RECONNECTING) return 'reconnecting';
    return 'online';
  };

  const variant = getVariant();
  const styles = variantStyles[variant];
  const config = CONNECTION_STATUS_CONFIG[status];

  // Icono según el estado
  const StatusIcon = () => {
    if (isSyncing) {
      return <Upload className={`w-4 h-4 ${styles.icon} animate-pulse`} />;
    }
    
    switch (status) {
      case ConnectionStatus.ONLINE:
        return quality === 'excellent' ? (
          <Signal className={`w-4 h-4 ${styles.icon}`} />
        ) : (
          <Wifi className={`w-4 h-4 ${styles.icon}`} />
        );
      case ConnectionStatus.OFFLINE:
        return <WifiOff className={`w-4 h-4 ${styles.icon}`} />;
      case ConnectionStatus.SLOW:
        return <SignalLow className={`w-4 h-4 ${styles.icon}`} />;
      case ConnectionStatus.RECONNECTING:
        return <RefreshCw className={`w-4 h-4 ${styles.icon} animate-spin`} />;
      default:
        return <Cloud className={`w-4 h-4 ${styles.icon}`} />;
    }
  };

  if (!isVisible && hideWhenOnline) return null;

  return (
    <div
      className={`${positionStyles[position]} ${className}`}
    >
      <div
        className={`
          ${styles.bg} ${styles.border} ${styles.text}
          border rounded-lg shadow-lg transition-all duration-300
          ${isExpanded ? 'w-72' : 'w-auto'}
        `}
      >
        {/* Indicador compacto */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 w-full"
        >
          <StatusIcon />
          <span className="text-sm font-medium">
            {isSyncing ? 'Sincronizando...' : config.label}
          </span>
          
          {/* Badges de pendientes */}
          {(pendingSyncCount > 0 || failedSyncCount > 0) && (
            <div className="flex items-center gap-1 ml-auto">
              {pendingSyncCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                  {pendingSyncCount}
                </span>
              )}
              {failedSyncCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                  {failedSyncCount}
                </span>
              )}
            </div>
          )}
        </button>

        {/* Detalles expandidos */}
        {(isExpanded || showDetails) && (
          <div className="px-3 pb-3 border-t border-gray-200 space-y-3">
            {/* Estado de conexión */}
            <div className="pt-2">
              <p className="text-xs text-gray-500">{config.description}</p>
              
              {/* Información de red */}
              {effectiveType && (
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="px-2 py-0.5 bg-gray-100 rounded">
                    {effectiveType.toUpperCase()}
                  </span>
                  {downlink && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                      {downlink} Mbps
                    </span>
                  )}
                  {rtt && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded">
                      {rtt}ms
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Estado de sincronización */}
            {(pendingSyncCount > 0 || failedSyncCount > 0 || hasConflicts) && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700">Sincronización</h4>
                
                {pendingSyncCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <CloudOff className="w-3 h-3 text-yellow-500" />
                      <span>{pendingSyncCount} cambios pendientes</span>
                    </div>
                    {isOnline && !isSyncing && (
                      <button
                        onClick={() => processSyncQueue()}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Sincronizar
                      </button>
                    )}
                  </div>
                )}
                
                {failedSyncCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{failedSyncCount} errores de sincronización</span>
                  </div>
                )}
                
                {hasConflicts && (
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Conflictos detectados</span>
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => checkConnection()}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Verificar
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE COMPACTO
// ============================================================================

interface OfflineBadgeProps {
  className?: string;
}

/**
 * Badge compacto para mostrar en la barra de navegación
 */
export function OfflineBadge({ className = '' }: OfflineBadgeProps) {
  const { isOnline, status } = useOnlineStatus();
  const pendingSyncCount = useOfflineStore(selectPendingSyncCount);

  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div
      className={`
        flex items-center gap-1 px-2 py-1 rounded-full text-xs
        ${isOnline ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
        ${className}
      `}
    >
      {isOnline ? (
        <>
          <Upload className="w-3 h-3" />
          <span>{pendingSyncCount}</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE BANNER
// ============================================================================

interface OfflineBannerProps {
  className?: string;
  dismissible?: boolean;
}

/**
 * Banner que aparece en la parte superior cuando está offline
 */
export function OfflineBanner({ className = '', dismissible = true }: OfflineBannerProps) {
  const { isOnline, status, checkConnection } = useOnlineStatus();
  const pendingSyncCount = useOfflineStore(selectPendingSyncCount);
  const [isDismissed, setIsDismissed] = useState(false);

  // Resetear dismissed cuando cambie el estado
  useEffect(() => {
    setIsDismissed(false);
  }, [isOnline]);

  if (isOnline || isDismissed) return null;

  return (
    <div
      className={`
        w-full px-4 py-2 bg-red-600 text-white text-sm flex items-center justify-between
        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>
          Sin conexión a internet.
          {pendingSyncCount > 0 && ` ${pendingSyncCount} cambios se sincronizarán cuando vuelvas a conectarte.`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => checkConnection()}
          className="px-2 py-1 bg-red-700 hover:bg-red-800 rounded text-xs transition-colors"
        >
          Reintentar
        </button>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-red-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export default OfflineIndicator;

/**
 * Hook useOnlineStatus - Detectar estado de conexión
 * Sprint 15-16: PWA y funcionalidad offline
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfflineStore, selectIsOnline, selectConnectionQuality } from '@/stores/offlineStore';
import { ConnectionStatus } from '@/types/offline.types';

// ============================================================================
// TIPOS
// ============================================================================

interface OnlineStatusResult {
  /** Si hay conexión a internet */
  isOnline: boolean;
  /** Si está offline */
  isOffline: boolean;
  /** Estado detallado de conexión */
  status: ConnectionStatus;
  /** Calidad de conexión: 'excellent' | 'good' | 'poor' | 'unknown' */
  quality: string;
  /** Tipo de conexión efectiva */
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  /** Velocidad estimada en Mbps */
  downlink?: number;
  /** Latencia estimada en ms */
  rtt?: number;
  /** Si el usuario tiene modo ahorro de datos */
  saveData?: boolean;
  /** Última vez que estuvo online */
  lastOnlineAt?: string;
  /** Última vez que estuvo offline */
  lastOfflineAt?: string;
  /** Forzar verificación de conexión */
  checkConnection: () => Promise<boolean>;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const PING_URL = '/api/health'; // Endpoint para verificar conexión real
const PING_TIMEOUT = 5000;
const CHECK_INTERVAL = 30000; // 30 segundos

// ============================================================================
// HOOK
// ============================================================================

export function useOnlineStatus(): OnlineStatusResult {
  const connection = useOfflineStore((state) => state.connection);
  const setConnectionStatus = useOfflineStore((state) => state.setConnectionStatus);
  const updateConnectionInfo = useOfflineStore((state) => state.updateConnectionInfo);
  const isOnline = useOfflineStore(selectIsOnline);
  const quality = useOfflineStore(selectConnectionQuality);

  const [isChecking, setIsChecking] = useState(false);

  /**
   * Verificar conexión real haciendo ping al servidor
   */
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (isChecking) return isOnline;

    setIsChecking(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT);

      const startTime = Date.now();
      const response = await fetch(PING_URL, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      const rtt = Date.now() - startTime;

      clearTimeout(timeoutId);

      if (response.ok) {
        setConnectionStatus(ConnectionStatus.ONLINE);
        updateConnectionInfo({ rtt });
        return true;
      }

      setConnectionStatus(ConnectionStatus.OFFLINE);
      return false;
    } catch (error) {
      // Si el navegador dice que estamos offline, confiar en eso
      if (!navigator.onLine) {
        setConnectionStatus(ConnectionStatus.OFFLINE);
        return false;
      }

      // Si hay error pero el navegador dice online, puede ser conexión lenta
      setConnectionStatus(ConnectionStatus.SLOW);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, isOnline, setConnectionStatus, updateConnectionInfo]);

  /**
   * Configurar listeners de eventos de red
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setConnectionStatus(ConnectionStatus.ONLINE);
      // Verificar conexión real después de un momento
      setTimeout(checkConnection, 1000);
    };

    const handleOffline = () => {
      setConnectionStatus(ConnectionStatus.OFFLINE);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API
    const networkConnection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (networkConnection) {
      const handleNetworkChange = () => {
        updateConnectionInfo({
          effectiveType: networkConnection.effectiveType,
          downlink: networkConnection.downlink,
          rtt: networkConnection.rtt,
          saveData: networkConnection.saveData,
        });

        // Actualizar estado según tipo de conexión
        if (networkConnection.effectiveType === 'slow-2g' || networkConnection.effectiveType === '2g') {
          setConnectionStatus(ConnectionStatus.SLOW);
        } else if (navigator.onLine) {
          setConnectionStatus(ConnectionStatus.ONLINE);
        }
      };

      networkConnection.addEventListener('change', handleNetworkChange);
      // Obtener info inicial
      handleNetworkChange();

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        networkConnection.removeEventListener('change', handleNetworkChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setConnectionStatus, updateConnectionInfo, checkConnection]);

  /**
   * Verificación periódica de conexión
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Verificar conexión inicial
    checkConnection();

    // Verificación periódica
    const intervalId = setInterval(checkConnection, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [checkConnection]);

  /**
   * Detectar cuando la página vuelve a estar activa
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Verificar conexión cuando el usuario vuelve a la pestaña
        checkConnection();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkConnection]);

  return {
    isOnline,
    isOffline: !isOnline,
    status: connection.status,
    quality,
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
    lastOnlineAt: connection.lastOnlineAt,
    lastOfflineAt: connection.lastOfflineAt,
    checkConnection,
  };
}

// ============================================================================
// HOOK SIMPLIFICADO
// ============================================================================

/**
 * Hook simplificado que solo retorna el estado online/offline
 */
export function useIsOnline(): boolean {
  return useOfflineStore(selectIsOnline);
}

/**
 * Hook para obtener la calidad de conexión
 */
export function useConnectionQuality(): string {
  return useOfflineStore(selectConnectionQuality);
}

export default useOnlineStatus;

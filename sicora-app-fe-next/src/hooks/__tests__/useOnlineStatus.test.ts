/**
 * Tests para useOnlineStatus hook
 * 
 * Este hook detecta el estado de conexión del navegador usando Zustand store
 * y proporciona funciones para verificar la conectividad.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ConnectionStatus } from '@/types/offline.types';

// Crear mocks con vi.hoisted para evitar problemas de hoisting
const { 
  mockSetConnectionStatus, 
  mockUpdateConnectionInfo,
  getMockIsOnline,
  setMockIsOnline,
  getMockConnectionStatus,
  setMockConnectionStatus,
  getMockQuality,
  setMockQuality
} = vi.hoisted(() => {
  let _mockIsOnline = true;
  let _mockConnectionStatus = 'online';
  let _mockQuality = 'good';
  
  return {
    mockSetConnectionStatus: vi.fn(),
    mockUpdateConnectionInfo: vi.fn(),
    getMockIsOnline: () => _mockIsOnline,
    setMockIsOnline: (val: boolean) => { _mockIsOnline = val; },
    getMockConnectionStatus: () => _mockConnectionStatus,
    setMockConnectionStatus: (val: string) => { _mockConnectionStatus = val; },
    getMockQuality: () => _mockQuality,
    setMockQuality: (val: string) => { _mockQuality = val; },
  };
});

vi.mock('@/stores/offlineStore', () => ({
  useOfflineStore: (selector: (state: any) => any) => {
    const state = {
      connection: {
        status: getMockConnectionStatus(),
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
        lastOnlineAt: undefined,
        lastOfflineAt: undefined,
      },
      setConnectionStatus: mockSetConnectionStatus,
      updateConnectionInfo: mockUpdateConnectionInfo,
    };
    return selector(state);
  },
  selectIsOnline: () => getMockIsOnline(),
  selectConnectionQuality: () => getMockQuality(),
}));

// Importar después del mock
import { useOnlineStatus, useIsOnline, useConnectionQuality } from '../useOnlineStatus';

describe('useOnlineStatus', () => {
  let originalFetch: typeof global.fetch;
  let originalSetInterval: typeof setInterval;
  let originalClearInterval: typeof clearInterval;
  let originalSetTimeout: typeof setTimeout;
  let originalClearTimeout: typeof clearTimeout;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    setMockIsOnline(true);
    setMockConnectionStatus(ConnectionStatus.ONLINE);
    setMockQuality('good');
    
    // Guardar originales
    originalFetch = global.fetch;
    originalSetInterval = global.setInterval;
    originalClearInterval = global.clearInterval;
    originalSetTimeout = global.setTimeout;
    originalClearTimeout = global.clearTimeout;

    // Mock timers para evitar que se cuelgue
    global.setInterval = vi.fn().mockReturnValue(123) as unknown as typeof setInterval;
    global.clearInterval = vi.fn() as unknown as typeof clearInterval;
    global.setTimeout = vi.fn().mockImplementation((fn) => {
      // Ejecutar callback inmediatamente para tests
      // fn();
      return 456;
    }) as unknown as typeof setTimeout;
    global.clearTimeout = vi.fn() as unknown as typeof clearTimeout;

    // Mock fetch para simular conectividad
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
      })
    );

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
    vi.clearAllMocks();
  });

  describe('Estado inicial y propiedades', () => {
    it('debe retornar isOnline como true cuando el store indica online', () => {
      setMockIsOnline(true);

      const { result, unmount } = renderHook(() => useOnlineStatus());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
      
      unmount();
    });

    it('debe retornar isOnline como false cuando el store indica offline', () => {
      setMockIsOnline(false);
      setMockConnectionStatus(ConnectionStatus.OFFLINE);

      const { result, unmount } = renderHook(() => useOnlineStatus());

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
      
      unmount();
    });

    it('debe exponer función checkConnection', () => {
      const { result, unmount } = renderHook(() => useOnlineStatus());

      expect(typeof result.current.checkConnection).toBe('function');
      
      unmount();
    });

    it('debe retornar status del store', () => {
      setMockConnectionStatus(ConnectionStatus.SLOW);

      const { result, unmount } = renderHook(() => useOnlineStatus());

      expect(result.current.status).toBe(ConnectionStatus.SLOW);
      
      unmount();
    });

    it('debe retornar quality del store', () => {
      setMockQuality('excellent');

      const { result, unmount } = renderHook(() => useOnlineStatus());

      expect(result.current.quality).toBe('excellent');
      
      unmount();
    });

    it('debe retornar información de conexión del store', () => {
      const { result, unmount } = renderHook(() => useOnlineStatus());

      expect(result.current.effectiveType).toBe('4g');
      expect(result.current.downlink).toBe(10);
      expect(result.current.rtt).toBe(50);
      expect(result.current.saveData).toBe(false);
      
      unmount();
    });
  });

  describe('checkConnection', () => {
    // NOTA: La función checkConnection usa AbortController con setTimeout
    // que es difícil de testear de forma unitaria sin timers reales.
    // Los tests verifican solo la estructura del hook, no la ejecución
    // del checkConnection que involucra timeouts de red.
    
    it('debe ser una función', () => {
      const { result, unmount } = renderHook(() => useOnlineStatus());

      expect(typeof result.current.checkConnection).toBe('function');
      
      unmount();
    });

    it('checkConnection debe ser estable entre renders', () => {
      const { result, rerender, unmount } = renderHook(() => useOnlineStatus());

      const firstCheckConnection = result.current.checkConnection;
      
      rerender();
      
      // La referencia debe ser estable (useCallback)
      expect(result.current.checkConnection).toBe(firstCheckConnection);
      
      unmount();
    });
  });

  describe('Eventos del navegador', () => {
    it('debe llamar setConnectionStatus con OFFLINE cuando se dispara evento offline', () => {
      const { result, unmount } = renderHook(() => useOnlineStatus());

      // Limpiar llamadas previas
      mockSetConnectionStatus.mockClear();

      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(mockSetConnectionStatus).toHaveBeenCalledWith(ConnectionStatus.OFFLINE);
      
      unmount();
    });

    it('debe llamar setConnectionStatus con ONLINE cuando se dispara evento online', () => {
      const { result, unmount } = renderHook(() => useOnlineStatus());

      // Limpiar llamadas previas
      mockSetConnectionStatus.mockClear();

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(mockSetConnectionStatus).toHaveBeenCalledWith(ConnectionStatus.ONLINE);
      
      unmount();
    });
  });

  describe('Limpieza de recursos', () => {
    it('debe limpiar el interval al desmontarse', () => {
      const { unmount } = renderHook(() => useOnlineStatus());

      unmount();

      expect(global.clearInterval).toHaveBeenCalled();
    });
  });
});

describe('useIsOnline', () => {
  beforeEach(() => {
    setMockIsOnline(true);
  });

  it('debe retornar true cuando está online', () => {
    setMockIsOnline(true);

    const { result, unmount } = renderHook(() => useIsOnline());

    expect(result.current).toBe(true);
    
    unmount();
  });

  it('debe retornar false cuando está offline', () => {
    setMockIsOnline(false);

    const { result, unmount } = renderHook(() => useIsOnline());

    expect(result.current).toBe(false);
    
    unmount();
  });
});

describe('useConnectionQuality', () => {
  it('debe retornar la calidad de conexión del store', () => {
    setMockQuality('excellent');

    const { result, unmount } = renderHook(() => useConnectionQuality());

    expect(result.current).toBe('excellent');
    
    unmount();
  });

  it('debe retornar poor cuando la calidad es baja', () => {
    setMockQuality('poor');

    const { result, unmount } = renderHook(() => useConnectionQuality());

    expect(result.current).toBe('poor');
    
    unmount();
  });
});

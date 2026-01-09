import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Solo definir si no existe o si es configurable
try {
  Object.defineProperty(window, 'localStorage', { 
    value: localStorageMock,
    configurable: true,
    writable: true,
  });
} catch {
  // Ya definido, intentar asignar directamente
  (window as any).localStorage = localStorageMock;
}

// Mock de sessionStorage
try {
  Object.defineProperty(window, 'sessionStorage', { 
    value: localStorageMock,
    configurable: true,
    writable: true,
  });
} catch {
  (window as any).sessionStorage = localStorageMock;
}

// Mock de matchMedia
try {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
} catch {
  // Ya definido
}

// Mock de fetch
global.fetch = vi.fn();

// Mock de crypto.randomUUID
try {
  Object.defineProperty(global, 'crypto', {
    configurable: true,
    writable: true,
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
    },
  });
} catch {
  // Ya definido
}

// Reset mocks entre tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});

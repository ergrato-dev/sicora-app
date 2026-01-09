/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Entorno de testing
    environment: 'jsdom',
    
    // Archivos de setup
    setupFiles: ['./vitest.setup.ts'],
    
    // Incluir archivos de test
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    
    // Excluir
    exclude: ['node_modules', 'e2e', '.next'],
    
    // Globals (describe, it, expect sin import)
    globals: true,
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/stores/**/*.ts',
        'src/hooks/**/*.ts',
        'src/lib/api/**/*.ts',
        'src/utils/**/*.ts',
        'src/components/**/*.tsx',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/types/**/*',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

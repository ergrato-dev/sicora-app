import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración Playwright para E2E Testing
 * Sprint 17-18: Testing y Despliegue
 */

export default defineConfig({
  // Directorio de tests
  testDir: './e2e',

  // Patrón de archivos de test
  testMatch: '**/*.spec.ts',

  // Ejecutar tests en paralelo
  fullyParallel: true,

  // Fallar la build si hay test.only en CI
  forbidOnly: !!process.env.CI,

  // Reintentos en CI
  retries: process.env.CI ? 2 : 0,

  // Workers según entorno
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  // Configuración global
  use: {
    // URL base del frontend
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Recolectar trace en caso de fallo
    trace: 'on-first-retry',

    // Screenshot en caso de fallo
    screenshot: 'only-on-failure',

    // Video en caso de fallo
    video: 'on-first-retry',

    // Timeout para acciones
    actionTimeout: 10000,

    // Timeout para navegación
    navigationTimeout: 30000,
  },

  // Timeout global para tests
  timeout: 30000,

  // Timeout para expect
  expect: {
    timeout: 10000,
  },

  // Proyectos/Navegadores
  projects: [
    // Setup project para autenticación
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },

    // Desktop Chrome
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Desktop Firefox
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Desktop Safari
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Mobile Chrome
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Mobile Safari
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Tests sin autenticación
    {
      name: 'unauthenticated',
      testMatch: /.*\.unauth\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Servidor de desarrollo local
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Directorio de salida
  outputDir: 'playwright-results',
});

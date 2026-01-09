/**
 * Fixtures globales de Playwright
 * Sprint 17-18: Testing E2E
 */

import { test as base, expect, Page } from '@playwright/test';

// ============================================================================
// TIPOS
// ============================================================================

interface TestUser {
  email: string;
  password: string;
  role: 'admin' | 'instructor' | 'estudiante';
  nombre: string;
}

interface TestFixtures {
  authenticatedPage: Page;
  adminPage: Page;
  instructorPage: Page;
  studentPage: Page;
  testUsers: {
    admin: TestUser;
    instructor: TestUser;
    student: TestUser;
  };
}

// ============================================================================
// USUARIOS DE PRUEBA
// ============================================================================

const testUsers = {
  admin: {
    email: 'admin@sicora.edu.co',
    password: 'Admin123!',
    role: 'admin' as const,
    nombre: 'Administrador Test',
  },
  instructor: {
    email: 'instructor@sicora.edu.co',
    password: 'Instructor123!',
    role: 'instructor' as const,
    nombre: 'Instructor Test',
  },
  student: {
    email: 'estudiante@sicora.edu.co',
    password: 'Estudiante123!',
    role: 'estudiante' as const,
    nombre: 'Estudiante Test',
  },
};

// ============================================================================
// HELPERS
// ============================================================================

async function loginAs(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Llenar formulario de login
  await page.fill('input[name="email"], input[type="email"]', user.email);
  await page.fill('input[name="password"], input[type="password"]', user.password);

  // Submit
  await page.click('button[type="submit"]');

  // Esperar redirección al dashboard
  await page.waitForURL(/\/(dashboard|home)/, { timeout: 15000 });
}

// ============================================================================
// FIXTURES EXTENDIDOS
// ============================================================================

export const test = base.extend<TestFixtures>({
  // Usuarios de prueba disponibles en todos los tests
  testUsers: async ({}, use) => {
    await use(testUsers);
  },

  // Página autenticada con usuario admin por defecto
  authenticatedPage: async ({ page }, use) => {
    await loginAs(page, testUsers.admin);
    await use(page);
  },

  // Página con rol admin
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, testUsers.admin);
    await use(page);
    await context.close();
  },

  // Página con rol instructor
  instructorPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, testUsers.instructor);
    await use(page);
    await context.close();
  },

  // Página con rol estudiante
  studentPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAs(page, testUsers.student);
    await use(page);
    await context.close();
  },
});

// ============================================================================
// EXPECT PERSONALIZADO
// ============================================================================

export { expect };

// ============================================================================
// HELPERS EXPORTADOS
// ============================================================================

export const helpers = {
  loginAs,
  testUsers,

  /**
   * Esperar a que desaparezca el loading
   */
  async waitForLoading(page: Page): Promise<void> {
    await page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 30000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
  },

  /**
   * Verificar toast de éxito
   */
  async expectSuccessToast(page: Page, message?: string): Promise<void> {
    const toast = page.locator('[role="alert"], [data-testid="toast"]').filter({ hasText: message || '' });
    await expect(toast.first()).toBeVisible({ timeout: 10000 });
  },

  /**
   * Verificar toast de error
   */
  async expectErrorToast(page: Page, message?: string): Promise<void> {
    const toast = page.locator('[role="alert"], [data-testid="toast-error"]').filter({ hasText: message || '' });
    await expect(toast.first()).toBeVisible({ timeout: 10000 });
  },

  /**
   * Llenar formulario con datos
   */
  async fillForm(page: Page, data: Record<string, string>): Promise<void> {
    for (const [name, value] of Object.entries(data)) {
      const input = page.locator(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`);
      const tagName = await input.evaluate((el) => el.tagName.toLowerCase());

      if (tagName === 'select') {
        await input.selectOption(value);
      } else {
        await input.fill(value);
      }
    }
  },

  /**
   * Navegar a una ruta y esperar carga
   */
  async navigateTo(page: Page, path: string): Promise<void> {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
  },

  /**
   * Verificar que existe una fila en la tabla
   */
  async expectTableRowWithText(page: Page, text: string): Promise<void> {
    const row = page.locator('table tbody tr').filter({ hasText: text });
    await expect(row.first()).toBeVisible();
  },

  /**
   * Click en botón de acción de una fila
   */
  async clickRowAction(page: Page, rowText: string, action: string): Promise<void> {
    const row = page.locator('table tbody tr').filter({ hasText: rowText });
    await row.locator(`button:has-text("${action}"), [aria-label="${action}"]`).click();
  },

  /**
   * Verificar breadcrumb
   */
  async expectBreadcrumb(page: Page, items: string[]): Promise<void> {
    const breadcrumb = page.locator('nav[aria-label="breadcrumb"], [data-testid="breadcrumb"]');
    for (const item of items) {
      await expect(breadcrumb.locator(`text=${item}`)).toBeVisible();
    }
  },
};

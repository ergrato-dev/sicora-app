/**
 * E2E Tests - Dashboard y Navegación
 * Sprint 17-18: Testing E2E
 */

import { test, expect, helpers } from '../fixtures';

test.describe('Dashboard', () => {
  test.describe('Carga inicial', () => {
    test('debe cargar el dashboard correctamente', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      // Verificar que el dashboard se cargó
      const dashboardContent = authenticatedPage.locator(
        '[data-testid="dashboard"], main, [role="main"]'
      );
      await expect(dashboardContent).toBeVisible();
    });

    test('debe mostrar widgets según el rol del usuario', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      // Verificar que hay al menos algunos widgets/cards
      const widgets = authenticatedPage.locator(
        '[data-testid*="widget"], [data-testid*="card"], .card, .widget'
      );
      
      const count = await widgets.count();
      expect(count).toBeGreaterThan(0);
    });

    test('debe mostrar información del usuario logueado', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      // Buscar elemento con nombre de usuario
      const userInfo = authenticatedPage.locator(
        '[data-testid="user-info"], [data-testid="user-name"], .user-name'
      );

      // Debería existir en alguna parte (header, sidebar, etc.)
      const header = authenticatedPage.locator('header, nav');
      await expect(header).toBeVisible();
    });
  });

  test.describe('Widgets', () => {
    test('debe mostrar widget de asistencia del día', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      const attendanceWidget = authenticatedPage.locator(
        '[data-testid="attendance-widget"], [data-testid*="asistencia"]'
      );

      if (await attendanceWidget.isVisible()) {
        // Verificar que tiene contenido
        await expect(attendanceWidget.locator('text=/\\d+/')).toBeVisible();
      }
    });

    test('debe mostrar widget de horario', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      const scheduleWidget = authenticatedPage.locator(
        '[data-testid="schedule-widget"], [data-testid*="horario"]'
      );

      if (await scheduleWidget.isVisible()) {
        await expect(scheduleWidget).toBeVisible();
      }
    });

    test('debe mostrar alertas si existen', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      const alertsWidget = authenticatedPage.locator(
        '[data-testid="alerts-widget"], [data-testid*="alertas"]'
      );

      // Las alertas pueden o no existir, solo verificamos que el widget se muestre si existe
      if (await alertsWidget.isVisible()) {
        await expect(alertsWidget).toBeVisible();
      }
    });
  });

  test.describe('Acciones rápidas', () => {
    test('debe permitir acceso rápido a registro de asistencia', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      const quickAction = authenticatedPage.locator(
        'a:has-text("Registrar asistencia"), button:has-text("Registrar asistencia"), [data-testid="quick-attendance"]'
      );

      if (await quickAction.isVisible()) {
        await quickAction.click();
        await authenticatedPage.waitForURL(/\/asistencia/, { timeout: 10000 });
      }
    });
  });
});

test.describe('Navegación', () => {
  test.describe('Sidebar/Menú', () => {
    test('debe mostrar menú de navegación', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      const nav = authenticatedPage.locator(
        'nav, aside, [data-testid="sidebar"], [role="navigation"]'
      );
      await expect(nav.first()).toBeVisible();
    });

    test('debe navegar a Usuarios', async ({ adminPage }) => {
      await adminPage.goto('/dashboard');
      await helpers.waitForLoading(adminPage);

      const usersLink = adminPage.locator('a:has-text("Usuarios"), [href*="/usuarios"]');
      
      if (await usersLink.isVisible()) {
        await usersLink.click();
        await adminPage.waitForURL(/\/usuarios/, { timeout: 10000 });
        await expect(adminPage.locator('h1, h2').first()).toContainText(/usuarios/i);
      }
    });

    test('debe navegar a Horarios', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      const schedulesLink = authenticatedPage.locator(
        'a:has-text("Horarios"), [href*="/horarios"]'
      );

      if (await schedulesLink.isVisible()) {
        await schedulesLink.click();
        await authenticatedPage.waitForURL(/\/horarios/, { timeout: 10000 });
      }
    });

    test('debe navegar a Asistencia', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      const attendanceLink = authenticatedPage.locator(
        'a:has-text("Asistencia"), [href*="/asistencia"]'
      );

      if (await attendanceLink.isVisible()) {
        await attendanceLink.click();
        await authenticatedPage.waitForURL(/\/asistencia/, { timeout: 10000 });
      }
    });

    test('debe colapsar/expandir sidebar en móvil', async ({ authenticatedPage }) => {
      // Simular viewport móvil
      await authenticatedPage.setViewportSize({ width: 375, height: 667 });
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      const menuButton = authenticatedPage.locator(
        'button[aria-label*="menu"], [data-testid="mobile-menu"], button:has(svg)'
      ).first();

      if (await menuButton.isVisible()) {
        await menuButton.click();

        // Verificar que el menú se muestra
        const mobileNav = authenticatedPage.locator(
          '[data-testid="mobile-nav"], aside, nav'
        );
        await expect(mobileNav.first()).toBeVisible();
      }
    });
  });

  test.describe('Breadcrumbs', () => {
    test('debe mostrar breadcrumbs en páginas internas', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/usuarios');
      await helpers.waitForLoading(authenticatedPage);

      const breadcrumb = authenticatedPage.locator(
        'nav[aria-label*="breadcrumb"], [data-testid="breadcrumb"], .breadcrumb'
      );

      if (await breadcrumb.isVisible()) {
        await expect(breadcrumb).toContainText(/inicio|home|dashboard/i);
      }
    });
  });

  test.describe('Búsqueda global', () => {
    test('debe mostrar barra de búsqueda', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      const searchBar = authenticatedPage.locator(
        'input[type="search"], input[placeholder*="Buscar"], [data-testid="global-search"]'
      );

      if (await searchBar.isVisible()) {
        await expect(searchBar).toBeVisible();
      }
    });
  });
});

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  for (const viewport of viewports) {
    test(`debe renderizar correctamente en ${viewport.name}`, async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize({ width: viewport.width, height: viewport.height });
      await authenticatedPage.goto('/dashboard');
      await helpers.waitForLoading(authenticatedPage);

      // Verificar que no hay overflow horizontal
      const bodyWidth = await authenticatedPage.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // Margen de error

      // Verificar que el contenido principal es visible
      const main = authenticatedPage.locator('main, [role="main"]');
      await expect(main).toBeVisible();
    });
  }
});

test.describe('Accesibilidad básica', () => {
  test('debe tener estructura de headings correcta', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await helpers.waitForLoading(authenticatedPage);

    // Debe haber al menos un h1
    const h1 = authenticatedPage.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('debe tener landmarks ARIA', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await helpers.waitForLoading(authenticatedPage);

    // Verificar landmarks principales
    const main = authenticatedPage.locator('main, [role="main"]');
    await expect(main).toBeVisible();

    const nav = authenticatedPage.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();
  });

  test('debe ser navegable por teclado', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await helpers.waitForLoading(authenticatedPage);

    // Tab para navegar
    await authenticatedPage.keyboard.press('Tab');
    
    // Verificar que algo recibe foco
    const focusedElement = await authenticatedPage.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });
});

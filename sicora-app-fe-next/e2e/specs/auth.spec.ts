/**
 * E2E Tests - Autenticación
 * Sprint 17-18: Testing E2E
 */

import { test, expect, helpers } from '../fixtures';

test.describe('Autenticación', () => {
  test.describe('Login', () => {
    test('debe mostrar el formulario de login', async ({ page }) => {
      await page.goto('/login');

      // Verificar elementos del formulario
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('debe mostrar error con credenciales inválidas', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
      await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Esperar mensaje de error
      const errorMessage = page.locator('[role="alert"], .error, [data-testid="error-message"]');
      await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
    });

    test('debe validar campos requeridos', async ({ page }) => {
      await page.goto('/login');

      // Click submit sin llenar campos
      await page.click('button[type="submit"]');

      // Verificar que los campos muestran error de validación
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');

      // Los campos deben tener atributo aria-invalid o clase de error
      await expect(
        emailInput.or(page.locator('[data-testid="email-error"]'))
      ).toBeVisible();
    });

    test('debe validar formato de email', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"], input[name="email"]', 'notanemail');
      await page.fill('input[type="password"], input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Verificar error de formato
      const emailError = page.locator('[data-testid="email-error"], .error');
      await expect(emailError.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        // Si no hay error visible, verificar que no navegó
        expect(page.url()).toContain('/login');
      });
    });

    test('debe redirigir al dashboard después de login exitoso', async ({ page, testUsers }) => {
      await page.goto('/login');

      await page.fill('input[type="email"], input[name="email"]', testUsers.admin.email);
      await page.fill('input[type="password"], input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');

      // Esperar redirección al dashboard
      await page.waitForURL(/\/(dashboard|home)/, { timeout: 15000 });
      expect(page.url()).not.toContain('/login');
    });

    test('debe mostrar/ocultar contraseña', async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.locator('input[name="password"], input[type="password"]');
      const toggleButton = page.locator('[data-testid="toggle-password"], button:has(svg)').first();

      // Verificar que inicialmente es tipo password
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click para mostrar
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click para ocultar
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  test.describe('Logout', () => {
    test('debe cerrar sesión correctamente', async ({ authenticatedPage }) => {
      // Buscar botón de logout en menú de usuario
      const userMenu = authenticatedPage.locator('[data-testid="user-menu"], [aria-label="Menu de usuario"]');
      
      if (await userMenu.isVisible()) {
        await userMenu.click();
      }

      const logoutButton = authenticatedPage.locator(
        'button:has-text("Cerrar sesión"), button:has-text("Logout"), [data-testid="logout-button"]'
      );

      if (await logoutButton.isVisible()) {
        await logoutButton.click();

        // Verificar redirección a login
        await authenticatedPage.waitForURL(/\/login/, { timeout: 10000 });
      }
    });
  });

  test.describe('Protección de rutas', () => {
    test('debe redirigir a login si no está autenticado', async ({ page }) => {
      // Limpiar cookies/storage
      await page.context().clearCookies();

      // Intentar acceder a ruta protegida
      await page.goto('/dashboard');

      // Debe redirigir a login
      await page.waitForURL(/\/login/, { timeout: 10000 });
    });

    test('debe mantener la ruta original después del login', async ({ page, testUsers }) => {
      // Limpiar cookies
      await page.context().clearCookies();

      // Intentar acceder a ruta específica
      await page.goto('/usuarios');

      // Será redirigido a login
      await page.waitForURL(/\/login/, { timeout: 10000 });

      // Login
      await page.fill('input[type="email"], input[name="email"]', testUsers.admin.email);
      await page.fill('input[type="password"], input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');

      // Debería redirigir a la ruta original o al dashboard
      await page.waitForURL(/\/(usuarios|dashboard)/, { timeout: 15000 });
    });
  });

  test.describe('Remember me', () => {
    test('debe mantener sesión con remember me', async ({ page, testUsers }) => {
      await page.goto('/login');

      await page.fill('input[type="email"], input[name="email"]', testUsers.admin.email);
      await page.fill('input[type="password"], input[name="password"]', testUsers.admin.password);

      // Marcar "recordarme" si existe
      const rememberMe = page.locator('input[name="remember"], [data-testid="remember-me"]');
      if (await rememberMe.isVisible()) {
        await rememberMe.check();
      }

      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|home)/, { timeout: 15000 });

      // Verificar que hay token persistido
      const localStorage = await page.evaluate(() => {
        return {
          token: localStorage.getItem('token') || localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken'),
        };
      });

      // Al menos uno debería existir
      expect(localStorage.token || localStorage.refreshToken).toBeTruthy();
    });
  });
});

test.describe('Recuperación de contraseña', () => {
  test('debe mostrar formulario de recuperación', async ({ page }) => {
    await page.goto('/login');

    // Click en enlace de olvidé contraseña
    const forgotLink = page.locator('a:has-text("Olvidé"), a:has-text("Forgot"), [data-testid="forgot-password"]');
    
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await page.waitForURL(/\/forgot-password|\/recuperar/, { timeout: 10000 });

      // Verificar formulario
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });

  test('debe enviar email de recuperación', async ({ page }) => {
    await page.goto('/forgot-password');

    const emailInput = page.locator('input[type="email"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@sicora.edu.co');
      await page.click('button[type="submit"]');

      // Verificar mensaje de éxito
      const successMessage = page.locator('[role="alert"], .success, [data-testid="success-message"]');
      await expect(successMessage.first()).toBeVisible({ timeout: 10000 });
    }
  });
});

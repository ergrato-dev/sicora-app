/**
 * Global Setup - Autenticación para tests E2E
 * Sprint 17-18: Testing E2E
 */

import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Directorio para almacenar estado de autenticación
const AUTH_DIR = path.join(__dirname, '.auth');
const USER_AUTH_FILE = path.join(AUTH_DIR, 'user.json');

async function globalSetup(config: FullConfig) {
  // Crear directorio de autenticación si no existe
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';

  console.log('🔐 Setting up authentication...');
  console.log(`📍 Base URL: ${baseURL}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navegar al login
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });

    // Verificar que estamos en la página de login
    const isLoginPage = await page.locator('input[type="email"], input[name="email"]').isVisible().catch(() => false);

    if (!isLoginPage) {
      console.log('⚠️ Login page not found, using empty auth state');
      // Guardar estado vacío
      await context.storageState({ path: USER_AUTH_FILE });
      await browser.close();
      return;
    }

    // Credenciales de test
    const testEmail = process.env.TEST_USER_EMAIL || 'admin@sicora.edu.co';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Admin123!';

    console.log(`👤 Logging in as: ${testEmail}`);

    // Llenar formulario de login
    await page.fill('input[type="email"], input[name="email"]', testEmail);
    await page.fill('input[type="password"], input[name="password"]', testPassword);

    // Submit
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);

    // Verificar login exitoso
    const currentUrl = page.url();
    const isLoggedIn = !currentUrl.includes('/login');

    if (isLoggedIn) {
      console.log('✅ Login successful');
    } else {
      console.log('⚠️ Login may have failed, continuing with current state');
    }

    // Guardar estado de autenticación
    await context.storageState({ path: USER_AUTH_FILE });
    console.log(`💾 Auth state saved to: ${USER_AUTH_FILE}`);

  } catch (error) {
    console.error('❌ Error during setup:', error);
    // Guardar estado vacío para que los tests puedan continuar
    await context.storageState({ path: USER_AUTH_FILE });
  } finally {
    await browser.close();
  }
}

export default globalSetup;

/**
 * Script de prueba para la integración Frontend-Backend
 * Ejecuta pruebas básicas de conexión y autenticación con el UserService de Go
 */

import authService from '../lib/auth-api';
import { LoginCredentials } from '../types/auth.types';

export class IntegrationTester {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';
  }

  /**
   * Probar conexión con el API
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Probando conexión con API...');

      const response = await fetch(`${this.baseUrl}/api/v1/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ Conexión exitosa con API');
        return true;
      } else {
        console.log('❌ Conexión fallida - Status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  }

  /**
   * Probar registro de usuario
   */
  async testUserRegistration(): Promise<boolean> {
    try {
      console.log('🔍 Probando registro de usuario...');

      const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        first_name: 'Usuario',
        last_name: 'Prueba',
        role: 'aprendiz',
      };

      const result = await authService.register(testUser);
      console.log('✅ Registro exitoso:', result);
      return true;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return false;
    }
  }

  /**
   * Probar login de usuario
   */
  async testUserLogin(): Promise<boolean> {
    try {
      console.log('🔍 Probando login de usuario...');

      // Primero registrar usuario de prueba
      const testUser = {
        email: `test-login-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        first_name: 'Usuario',
        last_name: 'Login',
        role: 'aprendiz',
      };

      await authService.register(testUser);

      // Luego hacer login
      const credentials: LoginCredentials = {
        email: testUser.email,
        password: testUser.password,
      };

      const authResult = await authService.login(credentials);
      console.log('✅ Login exitoso:', authResult);

      // Verificar que recibimos el token
      if (authResult.access_token && authResult.user) {
        console.log('✅ Token y datos de usuario recibidos correctamente');
        return true;
      } else {
        console.log('❌ Respuesta de login incompleta');
        return false;
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      return false;
    }
  }

  /**
   * Probar obtención de perfil
   */
  async testGetProfile(): Promise<boolean> {
    try {
      console.log('🔍 Probando obtención de perfil...');

      const profile = await authService.getProfile();
      console.log('✅ Perfil obtenido:', profile);
      return true;
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error);
      return false;
    }
  }

  /**
   * Ejecutar todas las pruebas
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Iniciando pruebas de integración Frontend-Backend');
    console.log('Backend URL:', this.baseUrl);

    const results = {
      connection: await this.testConnection(),
      registration: await this.testUserRegistration(),
      login: await this.testUserLogin(),
      profile: false, // Se probará después del login
    };

    // Si el login fue exitoso, probar obtener perfil
    if (results.login) {
      results.profile = await this.testGetProfile();
    }

    // Resumen de resultados
    console.log('📊 Resultados de las pruebas:');
    console.log('- Conexión:', results.connection ? '✅' : '❌');
    console.log('- Registro:', results.registration ? '✅' : '❌');
    console.log('- Login:', results.login ? '✅' : '❌');
    console.log('- Perfil:', results.profile ? '✅' : '❌');

    const allPassed = Object.values(results).every((result) => result === true);

    if (allPassed) {
      console.log('🎉 ¡Todas las pruebas pasaron! La integración está funcionando correctamente.');
    } else {
      console.log('⚠️  Algunas pruebas fallaron. Revisar configuración del backend.');
    }
  }
}

// Función de conveniencia para usar en la consola del navegador
export const testIntegration = async () => {
  const tester = new IntegrationTester();
  await tester.runAllTests();
};

// Exportar para usar en componentes
export default IntegrationTester;

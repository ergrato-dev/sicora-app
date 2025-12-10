import React, { useState } from 'react';
import { useAuthStore } from '../stores/auth-store-new';
import { testIntegration } from '../utils/integration-tester';

const IntegrationTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { login, logout, register, user, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();

  const addResult = (message: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runIntegrationTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      addResult('🚀 Iniciando pruebas de integración...');
      await testIntegration();
      addResult('✅ Pruebas de integración completadas');
    } catch (error) {
      addResult(`❌ Error en las pruebas: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testLogin = async () => {
    try {
      addResult('🔍 Probando login...');
      await login({
        email: 'test@example.com',
        password: 'password123',
      });
      addResult('✅ Login exitoso');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addResult(`❌ Error en login: ${errorMessage}`);
    }
  };

  const testRegister = async () => {
    try {
      addResult('🔍 Probando registro...');
      await register({
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        first_name: 'Usuario',
        last_name: 'Prueba',
        role: 'aprendiz',
      });
      addResult('✅ Registro exitoso');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addResult(`❌ Error en registro: ${errorMessage}`);
    }
  };

  const testLogout = async () => {
    try {
      addResult('🔍 Probando logout...');
      await logout();
      addResult('✅ Logout exitoso');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addResult(`❌ Error en logout: ${errorMessage}`);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>
        🔧 Panel de Pruebas de Integración Frontend-Backend
      </h2>

      {/* Estado actual */}
      <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-3'>Estado Actual</h3>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <span className='font-medium'>Autenticado:</span>{' '}
            <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {isAuthenticated ? '✅ Sí' : '❌ No'}
            </span>
          </div>
          <div>
            <span className='font-medium'>Cargando:</span>{' '}
            <span className={isLoading ? 'text-yellow-600' : 'text-gray-600'}>
              {isLoading ? '⏳ Sí' : '✅ No'}
            </span>
          </div>
          <div className='col-span-2'>
            <span className='font-medium'>Usuario:</span>{' '}
            <span className='text-gray-700'>
              {user ? `${user.first_name} ${user.last_name} (${user.email})` : 'No autenticado'}
            </span>
          </div>
        </div>

        {error && (
          <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded'>
            <div className='flex justify-between items-start'>
              <span className='text-red-700 text-sm'>{error}</span>
              <button onClick={clearError} className='text-red-500 hover:text-red-700 ml-2'>
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botones de prueba */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-3'>Pruebas Individuales</h3>
        <div className='flex flex-wrap gap-3'>
          <button
            onClick={testRegister}
            disabled={isLoading || isRunning}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
          >
            🆕 Probar Registro
          </button>

          <button
            onClick={testLogin}
            disabled={isLoading || isRunning}
            className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50'
          >
            🔑 Probar Login
          </button>

          <button
            onClick={testLogout}
            disabled={isLoading || isRunning || !isAuthenticated}
            className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
          >
            🚪 Probar Logout
          </button>
        </div>
      </div>

      {/* Prueba completa */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-3'>Prueba Completa</h3>
        <button
          onClick={runIntegrationTests}
          disabled={isRunning || isLoading}
          className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2'
        >
          {isRunning ? '⏳ Ejecutando...' : '🚀 Ejecutar Todas las Pruebas'}
        </button>
      </div>

      {/* Configuración de API */}
      <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
        <h3 className='text-lg font-semibold mb-3'>Configuración de API</h3>
        <div className='text-sm text-gray-700'>
          <div>
            <span className='font-medium'>URL Base:</span>{' '}
            {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002'}
          </div>
          <div>
            <span className='font-medium'>Entorno:</span> {import.meta.env.MODE}
          </div>
        </div>
      </div>

      {/* Resultados */}
      {testResults.length > 0 && (
        <div className='mt-6'>
          <h3 className='text-lg font-semibold mb-3'>Resultados de Pruebas</h3>
          <div className='bg-gray-900 text-green-400 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-sm'>
            {testResults.map((result, index) => (
              <div key={index} className='mb-1'>
                {result}
              </div>
            ))}
          </div>

          <button
            onClick={() => setTestResults([])}
            className='mt-2 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700'
          >
            Limpiar Resultados
          </button>
        </div>
      )}

      {/* Información adicional */}
      <div className='mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
        <h3 className='text-lg font-semibold mb-2 text-yellow-800'>📋 Instrucciones</h3>
        <ul className='text-sm text-yellow-700 space-y-1'>
          <li>• Asegúrate de que el backend Go esté ejecutándose en http://localhost:8002</li>
          <li>• Usa "Probar Registro" para crear un usuario de prueba</li>
          <li>• Usa "Probar Login" para autenticarte con un usuario existente</li>
          <li>• Revisa la consola del navegador para logs detallados</li>
          <li>• Las pruebas completas incluyen conexión, registro, login y obtención de perfil</li>
        </ul>
      </div>
    </div>
  );
};

export default IntegrationTestPanel;

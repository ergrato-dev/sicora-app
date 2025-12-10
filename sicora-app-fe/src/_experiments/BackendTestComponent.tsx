import React from 'react';
import { useAuthStore } from '../stores/auth-store';
// import AuthService from '../lib/auth-api';
import { API_CONFIG } from '../lib/api-client';

interface LoginData {
  email: string;
  password: string;
}

interface CreateUserData {
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  rol: 'aprendiz' | 'instructor' | 'admin' | 'coordinador';
  password: string;
  ficha_id?: string;
  programa_formacion: string;
}

const BackendTestComponent: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const [loginData, setLoginData] = React.useState<LoginData>({
    email: 'admin@sena.edu.co',
    password: 'Admin123456!',
  });

  const [createUserData, setCreateUserData] = React.useState<CreateUserData>({
    nombre: 'Nuevo',
    apellido: 'Usuario',
    email: 'nuevo@sena.edu.co',
    documento: '12345678',
    rol: 'aprendiz',
    password: 'Password123!',
    ficha_id: 'TEST001',
    programa_formacion: 'Análisis y Desarrollo de Software',
  });

  const [responses, setResponses] = React.useState<
    Array<{
      endpoint: string;
      method: string;
      status: number;
      data: Record<string, unknown>;
      timestamp: string;
    }>
  >([]);

  const [loading, setLoading] = React.useState(false);

  const addResponse = (
    endpoint: string,
    method: string,
    status: number,
    data: Record<string, unknown>
  ) => {
    setResponses((prev) => [
      {
        endpoint,
        method,
        status,
        data,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 9),
    ]); // Mantener solo los últimos 10
  };

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/health`);
      const data = await response.json();
      addResponse('/health', 'GET', response.status, data);
    } catch (error) {
      addResponse('/health', 'GET', 0, { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const result = await login(loginData.email, loginData.password);
      addResponse('/auth/login', 'POST', 200, result);
    } catch (error) {
      addResponse('/auth/login', 'POST', 400, { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCreateUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createUserData),
      });
      const data = await response.json();
      addResponse('/api/v1/users', 'POST', response.status, data);
    } catch (error) {
      addResponse('/api/v1/users', 'POST', 0, { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testProfile = async () => {
    if (!user?.token) {
      addResponse('/api/v1/users/profile', 'GET', 401, { error: 'No hay token de autenticación' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/api/v1/users/profile`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      addResponse('/api/v1/users/profile', 'GET', response.status, data);
    } catch (error) {
      addResponse('/api/v1/users/profile', 'GET', 0, { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearResponses = () => {
    setResponses([]);
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg mb-6'>
          <h1 className='text-3xl font-bold mb-2'>🔧 Pruebas de Backend - SICORA</h1>
          <p className='text-blue-100'>
            Panel de pruebas para validar la integración Frontend ↔ Backend
          </p>
          <div className='mt-4 flex items-center space-x-4'>
            <span className='px-3 py-1 bg-blue-500 rounded-full text-sm'>
              Frontend: React 19 + Vite
            </span>
            <span className='px-3 py-1 bg-blue-500 rounded-full text-sm'>Backend: Go + Gin</span>
            <span className='px-3 py-1 bg-blue-500 rounded-full text-sm'>
              Base URL: {API_CONFIG.baseURL}
            </span>
          </div>
        </div>

        {/* Auth Status */}
        <div className='bg-white border rounded-lg p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>🔐 Estado de Autenticación</h2>
          {isAuthenticated && user ? (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-green-800 font-medium'>
                    ✅ Autenticado como: {user.nombre} {user.apellido}
                  </p>
                  <p className='text-green-600 text-sm'>
                    Email: {user.email} | Rol: {user.rol}
                  </p>
                  <p className='text-green-600 text-xs mt-1'>
                    Token: {user.token ? `${user.token.substring(0, 20)}...` : 'Sin token'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <p className='text-yellow-800'>⚠️ No autenticado</p>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Test Controls */}
          <div className='space-y-6'>
            {/* Health Check */}
            <div className='bg-white border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4'>🏥 Health Check</h3>
              <button
                onClick={testHealthCheck}
                disabled={loading}
                className='w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50'
              >
                {loading ? 'Probando...' : 'Probar /health'}
              </button>
            </div>

            {/* Login Test */}
            <div className='bg-white border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4'>🔑 Prueba de Login</h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>Email:</label>
                  <input
                    type='email'
                    value={loginData.email}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                    className='w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Password:</label>
                  <input
                    type='password'
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className='w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <button
                  onClick={testLogin}
                  disabled={loading}
                  className='w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
                >
                  {loading ? 'Autenticando...' : 'Probar Login'}
                </button>
              </div>
            </div>

            {/* Create User Test */}
            <div className='bg-white border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4'>👤 Crear Usuario</h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Nombre:</label>
                    <input
                      type='text'
                      value={createUserData.nombre}
                      onChange={(e) =>
                        setCreateUserData((prev) => ({ ...prev, nombre: e.target.value }))
                      }
                      className='w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Apellido:</label>
                    <input
                      type='text'
                      value={createUserData.apellido}
                      onChange={(e) =>
                        setCreateUserData((prev) => ({ ...prev, apellido: e.target.value }))
                      }
                      className='w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>Email:</label>
                  <input
                    type='email'
                    value={createUserData.email}
                    onChange={(e) =>
                      setCreateUserData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className='w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Documento:</label>
                    <input
                      type='text'
                      value={createUserData.documento}
                      onChange={(e) =>
                        setCreateUserData((prev) => ({ ...prev, documento: e.target.value }))
                      }
                      className='w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Rol:</label>
                    <select
                      value={createUserData.rol}
                      onChange={(e) =>
                        setCreateUserData((prev) => ({ ...prev, rol: e.target.value }))
                      }
                      className='w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='aprendiz'>Aprendiz</option>
                      <option value='instructor'>Instructor</option>
                      <option value='admin'>Admin</option>
                      <option value='coordinador'>Coordinador</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={testCreateUser}
                  disabled={loading}
                  className='w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50'
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </div>

            {/* Profile Test */}
            <div className='bg-white border rounded-lg p-6'>
              <h3 className='text-lg font-semibold mb-4'>👤 Obtener Perfil</h3>
              <p className='text-sm text-gray-600 mb-4'>Requiere autenticación previa</p>
              <button
                onClick={testProfile}
                disabled={loading}
                className='w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50'
              >
                {loading ? 'Obteniendo...' : 'Obtener Perfil'}
              </button>
            </div>
          </div>

          {/* Response Log */}
          <div className='bg-white border rounded-lg p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>📋 Log de Respuestas</h3>
              <button
                onClick={clearResponses}
                className='px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600'
              >
                Limpiar
              </button>
            </div>

            <div className='space-y-4 max-h-96 overflow-y-auto'>
              {responses.length === 0 ? (
                <p className='text-gray-500 text-center py-8'>
                  No hay respuestas aún. Ejecuta algunas pruebas.
                </p>
              ) : (
                responses.map((response, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      response.status >= 200 && response.status < 300
                        ? 'border-green-200 bg-green-50'
                        : response.status >= 400
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`px-2 py-1 text-xs rounded font-mono ${
                            response.method === 'GET'
                              ? 'bg-blue-100 text-blue-800'
                              : response.method === 'POST'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {response.method}
                        </span>
                        <span className='font-mono text-sm'>{response.endpoint}</span>
                      </div>
                      <span className='text-xs text-gray-500'>{response.timestamp}</span>
                    </div>
                    <div className='flex items-center justify-between mb-2'>
                      <span
                        className={`px-2 py-1 text-xs rounded font-mono ${
                          response.status >= 200 && response.status < 300
                            ? 'bg-green-100 text-green-800'
                            : response.status >= 400
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        Status: {response.status || 'Error'}
                      </span>
                    </div>
                    <pre className='text-xs bg-gray-100 p-2 rounded overflow-x-auto'>
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendTestComponent;

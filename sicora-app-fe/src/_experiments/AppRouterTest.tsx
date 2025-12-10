import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useUserStore } from './stores/userStore';

// Componentes de prueba simples
function SimpleDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>📊 Dashboard Simple</h1>
    </div>
  );
}

function SimpleLayout() {
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>🏗️ Layout Simple</h2>
      <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
        <p>Contenido del layout</p>
      </div>
    </div>
  );
}

function TestRouter() {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#39a900' }}>🧪 Test Router</h1>

        <Routes>
          <Route path='/' element={<SimpleDashboard />} />
          <Route path='/layout-test' element={<SimpleLayout />} />
          <Route path='/simple' element={<div>Ruta simple funcionando</div>} />
        </Routes>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <p>📍 Rutas de prueba:</p>
          <ul>
            <li>/ - Dashboard</li>
            <li>/layout-test - Layout</li>
            <li>/simple - Ruta simple</li>
          </ul>
        </div>
      </div>
    </BrowserRouter>
  );
}

// Componente principal de prueba
function AppRouterTest() {
  const { initializeUser, user, isAuthenticated } = useUserStore();

  useEffect(() => {
    console.log('🔍 AppRouterTest - Inicializando usuario...');
    try {
      initializeUser();
      console.log('✅ Usuario inicializado:', user);
    } catch (error) {
      console.error('❌ Error en initializeUser:', error);
    }
  }, [initializeUser, user]);

  console.log('🔍 AppRouterTest - Renderizando...');

  return (
    <div>
      <div style={{ padding: '10px', backgroundColor: '#e8f5e8', marginBottom: '10px' }}>
        <strong>Usuario:</strong> {user ? user.name : 'No definido'} |<strong> Auth:</strong>{' '}
        {isAuthenticated ? 'Sí' : 'No'}
      </div>

      <TestRouter />
    </div>
  );
}

export default AppRouterTest;

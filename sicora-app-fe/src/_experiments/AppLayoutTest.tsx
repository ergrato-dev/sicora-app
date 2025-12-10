import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { useEffect } from 'react';

// Componente de prueba del LayoutWrapper simplificado
function LayoutWrapperTest() {
  const { user } = useUserStore();

  console.log('LayoutWrapperTest - user:', user);

  try {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#39a900' }}>🏗️ Layout Wrapper Test</h1>

        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
          <p>Usuario: {user?.name || 'No definido'}</p>
          <p>Email: {user?.email || 'No definido'}</p>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '10px' }}>
          <h2>Contenido del Outlet:</h2>
          <Outlet />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error en LayoutWrapperTest:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Error en LayoutWrapperTest</h1>
        <p>Error: {error.message}</p>
      </div>
    );
  }
}

// Componente de prueba con router
function AppLayoutTest() {
  const { initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return (
    <BrowserRouter>
      <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#39a900' }}>🧪 Test Layout Wrapper</h1>

        <Routes>
          <Route path='/' element={<LayoutWrapperTest />}>
            <Route index element={<div>📊 Dashboard dentro del Layout</div>} />
            <Route path='test' element={<div>🧪 Página de prueba</div>} />
          </Route>
        </Routes>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <p>📍 Rutas de prueba:</p>
          <ul>
            <li>/ - Dashboard con Layout</li>
            <li>/test - Página de prueba</li>
          </ul>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default AppLayoutTest;

import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { useEffect } from 'react';
import { InstitutionalLayout } from './components/InstitutionalLayout';

// Dashboard de prueba
function DashboardTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>📊 Dashboard Test</h2>
      <p>Probando con el InstitutionalLayout ORIGINAL...</p>
      <p>Si puedes ver esto, el InstitutionalLayout original está funcionando correctamente.</p>
    </div>
  );
}

// Wrapper con router usando InstitutionalLayout original
function LayoutWrapperTest() {
  const { user } = useUserStore();

  return (
    <InstitutionalLayout
      user={user || undefined}
      currentPath='/'
      pageTitle='Dashboard'
      onNavigate={(href) => console.log('Navigate to:', href)}
      onLogout={() => console.log('Logout')}
      onSearch={(query, filters) => console.log('Search:', query, filters)}
      showSearchBar={true}
      showBreadcrumbs={true}
    >
      <Outlet />
    </InstitutionalLayout>
  );
}

// Componente principal de prueba
function AppOriginalLayoutTest() {
  const { initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  try {
    return (
      <BrowserRouter>
        <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
          <h1 style={{ color: '#39a900' }}>🧪 Test InstitutionalLayout ORIGINAL</h1>

          <Routes>
            <Route path='/' element={<LayoutWrapperTest />}>
              <Route index element={<DashboardTest />} />
              <Route path='test' element={<div>Página de prueba</div>} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    );
  } catch (error) {
    console.error('Error en AppOriginalLayoutTest:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Error en AppOriginalLayoutTest</h1>
        <p>Error: {(error as Error)?.message || 'Error desconocido'}</p>
        <p>El problema está en el InstitutionalLayout original o en su configuración</p>
      </div>
    );
  }
}

export default AppOriginalLayoutTest;

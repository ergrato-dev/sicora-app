import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

// Componente de prueba del InstitutionalLayout simplificado
function InstitutionalLayoutTest({ children }: { children: ReactNode }) {
  const { user } = useUserStore();

  console.log('InstitutionalLayoutTest - user:', user);

  try {
    return (
      <div
        style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header simplificado */}
        <header style={{ backgroundColor: '#39a900', color: 'white', padding: '10px' }}>
          <h1>🏛️ SICORA - Header Test</h1>
          <p>Usuario: {user?.name || 'No definido'}</p>
        </header>

        {/* Breadcrumbs simplificado */}
        <nav style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
          <span>🏠 › Dashboard</span>
        </nav>

        {/* Contenido principal */}
        <main style={{ padding: '20px', minHeight: '400px' }}>{children}</main>

        {/* Footer simplificado */}
        <footer
          style={{ backgroundColor: '#333', color: 'white', padding: '10px', textAlign: 'center' }}
        >
          <p>© 2024 SENA - Footer Test</p>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('Error en InstitutionalLayoutTest:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Error en InstitutionalLayoutTest</h1>
        <p>Error: {(error as Error)?.message || 'Error desconocido'}</p>
      </div>
    );
  }
}

// Dashboard de prueba
function DashboardTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>📊 Dashboard Test</h2>
      <p>Si puedes ver esto, el InstitutionalLayout está funcionando.</p>
    </div>
  );
}

// Wrapper con router
function LayoutWrapperTest() {
  return (
    <InstitutionalLayoutTest>
      <Outlet />
    </InstitutionalLayoutTest>
  );
}

// Componente principal de prueba
function AppInstitutionalTest() {
  const { initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return (
    <BrowserRouter>
      <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#39a900' }}>🧪 Test Institutional Layout</h1>

        <Routes>
          <Route path='/' element={<LayoutWrapperTest />}>
            <Route index element={<DashboardTest />} />
            <Route path='test' element={<div>Página de prueba</div>} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default AppInstitutionalTest;

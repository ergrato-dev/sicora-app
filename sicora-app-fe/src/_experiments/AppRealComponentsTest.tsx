import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

// Importar componentes reales uno por uno para probar
import { StickyDisclaimerBanner } from './components/StickyDisclaimerBanner';
import { InstitutionalHeader } from './components/InstitutionalHeader';
import { InstitutionalFooter } from './components/InstitutionalFooter';
import { InstitutionalSearchBar } from './components/InstitutionalSearchBar';
import { sicoraSearchSuggestions } from './constants/searchOptions';

// Componente de prueba con componentes reales
function InstitutionalLayoutRealTest({ children }: { children: ReactNode }) {
  const { user } = useUserStore();

  console.log('InstitutionalLayoutRealTest - user:', user);

  try {
    return (
      <div
        style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Probar StickyDisclaimerBanner primero */}
        <StickyDisclaimerBanner />

        {/* Probar InstitutionalHeader */}
        <InstitutionalHeader
          user={user || undefined}
          currentPath='/'
          pageTitle='Dashboard'
          onNavigate={(href) => console.log('Navigate to:', href)}
          onLogout={() => console.log('Logout')}
          showBreadcrumbs={false}
        />

        {/* Breadcrumbs simplificado */}
        <nav style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
          <span>🏠 › Dashboard</span>
        </nav>

        {/* Probar InstitutionalSearchBar */}
        <InstitutionalSearchBar
          title='¿Qué necesita encontrar?'
          subtitle='Busque usuarios, horarios, evaluaciones o cualquier información del sistema SICORA'
          suggestions={sicoraSearchSuggestions}
          onSearch={(query, filters) => console.log('Search:', query, filters)}
          variant='default'
        />

        {/* Contenido principal */}
        <main style={{ padding: '20px', minHeight: '400px' }}>{children}</main>

        {/* Probar InstitutionalFooter */}
        <InstitutionalFooter />
      </div>
    );
  } catch (error) {
    console.error('Error en InstitutionalLayoutRealTest:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Error en InstitutionalLayoutRealTest</h1>
        <p>Error: {(error as Error)?.message || 'Error desconocido'}</p>
        <p>
          Componente que falló: StickyDisclaimerBanner, InstitutionalHeader, InstitutionalFooter o
          InstitutionalSearchBar
        </p>
      </div>
    );
  }
}

// Dashboard de prueba
function DashboardTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>📊 Dashboard Test</h2>
      <p>Probando con componentes reales...</p>
      <p>Si puedes ver esto, TODOS los componentes están funcionando correctamente.</p>
    </div>
  );
}

// Wrapper con router
function LayoutWrapperTest() {
  return (
    <InstitutionalLayoutRealTest>
      <Outlet />
    </InstitutionalLayoutRealTest>
  );
}

// Componente principal de prueba
function AppRealComponentsTest() {
  const { initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  return (
    <BrowserRouter>
      <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#39a900' }}>🧪 Test Real Components - TODOS LOS COMPONENTES</h1>

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

export default AppRealComponentsTest;

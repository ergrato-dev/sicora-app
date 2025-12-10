import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { useEffect } from 'react';
import { LayoutWrapper } from './components/LayoutWrapper';
import { Dashboard } from './pages/Dashboard';
import { DemoPage } from './pages/DemoPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
// Agregando componentes de ejemplo
import { DesignTokensDemo } from './components/examples/DesignTokensDemo';
import { UIPatternsDemoPage } from './components/examples/UIPatternsDemoPage';
import { FormComponentsDemoPage } from './components/examples/FormComponentsDemoPage';
import { SelectBadgeAlertDemoPage } from './components/examples/SelectBadgeAlertDemoPage';
import ModalSkeletonToastDemoPage from './components/examples/ModalSkeletonToastDemoPage';
import SpinnerTooltipDropdownDemoPage from './components/examples/SpinnerTooltipDropdownDemoPage';
import BackendTestComponent from './components/BackendTestComponent';
// Agregando páginas legales
import { PoliticaPrivacidad, TerminosUso, MapaSitio, Accesibilidad } from './pages/legal';
// Agregando páginas principales - PROBANDO UNA POR UNA
import { UsuariosPage } from './pages/usuarios/UsuariosPage';
import { HorariosPage } from './pages/horarios/HorariosPage';
import { EvaluacionesPage } from './pages/evaluaciones/EvaluacionesPage';

// Componente de prueba con AppRouter simplificado
function AppRouterSimplifiedTest() {
  const { initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  try {
    return (
      <BrowserRouter>
        <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
          <h1 style={{ color: '#39a900' }}>🧪 Test AppRouter + EVALUACIONES PAGE</h1>

          <Routes>
            <Route path='/' element={<LayoutWrapper />}>
              <Route index element={<Dashboard />} />
              <Route path='demo' element={<DemoPage />} />
              <Route path='contacto-seguro' element={<ContactPage />} />
              <Route path='design-tokens' element={<DesignTokensDemo />} />
              <Route path='ui-patterns' element={<UIPatternsDemoPage />} />
              <Route path='form-components' element={<FormComponentsDemoPage />} />
              <Route path='select-badge-alert' element={<SelectBadgeAlertDemoPage />} />
              <Route path='modal-skeleton-toast' element={<ModalSkeletonToastDemoPage />} />
              <Route path='spinner-tooltip-dropdown' element={<SpinnerTooltipDropdownDemoPage />} />
              <Route path='test-backend' element={<BackendTestComponent />} />

              {/* Rutas Legales */}
              <Route path='legal'>
                <Route path='politica-privacidad' element={<PoliticaPrivacidad />} />
                <Route path='terminos-uso' element={<TerminosUso />} />
                <Route path='mapa-sitio' element={<MapaSitio />} />
                <Route path='accesibilidad' element={<Accesibilidad />} />{' '}
              </Route>

              {/* Rutas de Usuarios - PROBANDO */}
              <Route path='usuarios'>
                <Route index element={<UsuariosPage />} />
                <Route path='crear' element={<UsuariosPage />} />
                <Route path=':id' element={<UsuariosPage />} />
                <Route path=':id/editar' element={<UsuariosPage />} />{' '}
              </Route>

              {/* Rutas de Horarios - PROBANDO */}
              <Route path='horarios'>
                <Route index element={<HorariosPage />} />
                <Route path='crear' element={<HorariosPage />} />
                <Route path=':id' element={<HorariosPage />} />
                <Route path=':id/editar' element={<HorariosPage />} />{' '}
              </Route>

              {/* Rutas de Evaluaciones - PROBANDO */}
              <Route path='evaluaciones'>
                <Route index element={<EvaluacionesPage />} />
                <Route path='crear' element={<EvaluacionesPage />} />
                <Route path=':id' element={<EvaluacionesPage />} />
                <Route path=':id/editar' element={<EvaluacionesPage />} />
              </Route>

              <Route path='*' element={<NotFoundPage />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    );
  } catch (error) {
    console.error('Error en AppRouterSimplifiedTest:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ Error en AppRouterSimplifiedTest</h1>
        <p>Error: {(error as Error)?.message || 'Error desconocido'}</p>
        <p>El problema está en EvaluacionesPage</p>
      </div>
    );
  }
}

export default AppRouterSimplifiedTest;

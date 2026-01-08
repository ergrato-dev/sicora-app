import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LayoutWrapper } from '../components/LayoutWrapper';
import { Dashboard } from '../pages/Dashboard';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute, PublicRoute } from '../components/auth/ProtectedRoute';

// Auth pages - lazy loaded
const LoginPage = lazy(() =>
  import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('../pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() =>
  import('../pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
);
const ChangePasswordPage = lazy(() =>
  import('../pages/auth/ChangePasswordPage').then((m) => ({ default: m.ChangePasswordPage }))
);

// Lazy loaded pages - se cargan solo cuando se navega a ellas
const UsuariosPage = lazy(() =>
  import('../pages/usuarios/UsuariosPage').then((m) => ({ default: m.UsuariosPage }))
);
const HorariosPage = lazy(() =>
  import('../pages/horarios/HorariosPage').then((m) => ({ default: m.HorariosPage }))
);
const EvaluacionesPage = lazy(() =>
  import('../pages/evaluaciones/EvaluacionesPage').then((m) => ({ default: m.EvaluacionesPage }))
);
const DemoPage = lazy(() => import('../pages/DemoPage').then((m) => ({ default: m.DemoPage })));
const ContactPage = lazy(() =>
  import('../pages/ContactPage').then((m) => ({ default: m.ContactPage }))
);

// Demo components - lazy loaded
const DesignTokensDemo = lazy(() =>
  import('../components/examples/DesignTokensDemo').then((m) => ({ default: m.DesignTokensDemo }))
);
const UIPatternsDemoPage = lazy(() =>
  import('../components/examples/UIPatternsDemoPage').then((m) => ({
    default: m.UIPatternsDemoPage,
  }))
);
const FormComponentsDemoPage = lazy(() =>
  import('../components/examples/FormComponentsDemoPage').then((m) => ({
    default: m.FormComponentsDemoPage,
  }))
);
const SelectBadgeAlertDemoPage = lazy(() =>
  import('../components/examples/SelectBadgeAlertDemoPage').then((m) => ({
    default: m.SelectBadgeAlertDemoPage,
  }))
);
const ModalSkeletonToastDemoPage = lazy(
  () => import('../components/examples/ModalSkeletonToastDemoPage')
);
const SpinnerTooltipDropdownDemoPage = lazy(
  () => import('../components/examples/SpinnerTooltipDropdownDemoPage')
);

// Legal pages - lazy loaded
const PoliticaPrivacidad = lazy(() =>
  import('../pages/legal').then((m) => ({ default: m.PoliticaPrivacidad }))
);
const TerminosUso = lazy(() => import('../pages/legal').then((m) => ({ default: m.TerminosUso })));
const MapaSitio = lazy(() => import('../pages/legal').then((m) => ({ default: m.MapaSitio })));
const Accesibilidad = lazy(() =>
  import('../pages/legal').then((m) => ({ default: m.Accesibilidad }))
);

// Admin pages - lazy loaded
const BrandingAdminPage = lazy(() =>
  import('../pages/admin/BrandingAdminPage').then((m) => ({ default: m.BrandingAdminPage }))
);

// Loading fallback component
function PageLoader() {
  return (
    <div className='flex h-64 items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
    </div>
  );
}

/**
 * Router principal de SICORA
 * Configuración de rutas con layouts institucionales
 * Implementa lazy loading para optimizar bundle size
 */

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Rutas de autenticación (públicas) */}
        <Route
          path='login'
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path='forgot-password'
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path='reset-password'
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route path='change-password' element={<ChangePasswordPage />} />

        {/* Rutas protegidas con layout */}
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <LayoutWrapper />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path='demo' element={<DemoPage />} />
          <Route path='contacto-seguro' element={<ContactPage />} />
          <Route path='design-tokens' element={<DesignTokensDemo />} />
          <Route path='ui-patterns' element={<UIPatternsDemoPage />} />
          <Route path='form-components' element={<FormComponentsDemoPage />} />
          <Route path='select-badge-alert' element={<SelectBadgeAlertDemoPage />} />
          <Route path='modal-skeleton-toast' element={<ModalSkeletonToastDemoPage />} />
          <Route path='spinner-tooltip-dropdown' element={<SpinnerTooltipDropdownDemoPage />} />

          {/* Rutas de Usuarios - Solo admin/coordinador */}
          <Route path='usuarios'>
            <Route index element={<UsuariosPage />} />
            <Route path='crear' element={<UsuariosPage />} />
            <Route path=':id' element={<UsuariosPage />} />
            <Route path=':id/editar' element={<UsuariosPage />} />
          </Route>

          {/* Rutas de Horarios */}
          <Route path='horarios'>
            <Route index element={<HorariosPage />} />
            <Route path='crear' element={<HorariosPage />} />
            <Route path=':id' element={<HorariosPage />} />
            <Route path=':id/editar' element={<HorariosPage />} />
          </Route>

          {/* Rutas de Evaluaciones */}
          <Route path='evaluaciones'>
            <Route index element={<EvaluacionesPage />} />
            <Route path='crear' element={<EvaluacionesPage />} />
            <Route path=':id' element={<EvaluacionesPage />} />
            <Route path=':id/editar' element={<EvaluacionesPage />} />
          </Route>

          {/* Rutas Legales */}
          <Route path='legal'>
            <Route path='politica-privacidad' element={<PoliticaPrivacidad />} />
            <Route path='terminos-uso' element={<TerminosUso />} />
            <Route path='mapa-sitio' element={<MapaSitio />} />
            <Route path='accesibilidad' element={<Accesibilidad />} />
          </Route>

          {/* Rutas de Administración */}
          <Route path='admin'>
            <Route path='branding' element={<BrandingAdminPage />} />
          </Route>

          {/* Página 404 */}
          <Route path='*' element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

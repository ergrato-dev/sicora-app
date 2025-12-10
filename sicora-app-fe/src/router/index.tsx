import { Routes, Route } from 'react-router-dom';
import { LayoutWrapper } from '../components/LayoutWrapper';
import { Dashboard } from '../pages/Dashboard';
import { UsuariosPage } from '../pages/usuarios/UsuariosPage';
import { HorariosPage } from '../pages/horarios/HorariosPage';
import { EvaluacionesPage } from '../pages/evaluaciones/EvaluacionesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { DemoPage } from '../pages/DemoPage';
import { ContactPage } from '../pages/ContactPage';
import { DesignTokensDemo } from '../components/examples/DesignTokensDemo';
import { UIPatternsDemoPage } from '../components/examples/UIPatternsDemoPage';
import { FormComponentsDemoPage } from '../components/examples/FormComponentsDemoPage';
import { SelectBadgeAlertDemoPage } from '../components/examples/SelectBadgeAlertDemoPage';
import ModalSkeletonToastDemoPage from '../components/examples/ModalSkeletonToastDemoPage';
import SpinnerTooltipDropdownDemoPage from '../components/examples/SpinnerTooltipDropdownDemoPage';
// Páginas legales
import { PoliticaPrivacidad, TerminosUso, MapaSitio, Accesibilidad } from '../pages/legal';

/**
 * Router principal de SICORA
 * Configuración de rutas con layouts institucionales
 */

export function AppRouter() {
  return (
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

        {/* Rutas de Usuarios */}
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

        {/* Página 404 */}
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

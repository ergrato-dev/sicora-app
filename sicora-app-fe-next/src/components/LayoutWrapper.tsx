import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { InstitutionalLayout } from './InstitutionalLayout';
import { useUserStore, useInitDemoUser } from '../stores/userStore';

/**
 * LayoutWrapper - Wrapper que conecta InstitutionalLayout con React Router
 * Maneja el estado del usuario y la navegación
 */
export function LayoutWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUserStore();

  // Inicializar usuario demo en desarrollo
  useInitDemoUser();

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (query: string, filters?: Record<string, unknown>) => {
    // TODO: Implementar búsqueda global
    console.log('Búsqueda:', query, filters);
  };

  return (
    <InstitutionalLayout
      user={user || undefined}
      currentPath={location.pathname}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onSearch={handleSearch}
      showSearchBar={true}
      showBreadcrumbs={true}
    >
      <Outlet />
    </InstitutionalLayout>
  );
}

export default LayoutWrapper;

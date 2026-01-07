import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { InstitutionalLayout } from './InstitutionalLayout';
import { useAuth } from '../hooks/useAuth';

/**
 * LayoutWrapper - Wrapper que conecta InstitutionalLayout con React Router
 * Maneja el estado del usuario y la navegación
 */
export function LayoutWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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

  // Adaptar el usuario del auth store al formato esperado por InstitutionalLayout
  const layoutUser = user
    ? {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim() || user.email,
        role: user.role as 'admin' | 'instructor' | 'aprendiz' | 'coordinador' | 'administrativo',
        email: user.email,
        avatar: undefined,
        status: 'online' as const,
      }
    : undefined;

  return (
    <InstitutionalLayout
      user={layoutUser}
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

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles permitidos para acceder a esta ruta */
  allowedRoles?: string[];
  /** Permisos requeridos para acceder a esta ruta */
  requiredPermissions?: string[];
  /** Redirección en caso de no tener acceso */
  fallbackPath?: string;
}

/**
 * Componente para proteger rutas que requieren autenticación
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, needsPasswordChange } = useAuth();
  const location = useLocation();

  // Mostrar loader mientras verifica autenticación
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center space-y-4'>
          <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto' />
          <p className='text-muted-foreground'>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Redirigir a cambio de contraseña si es requerido
  if (needsPasswordChange && location.pathname !== '/change-password') {
    return <Navigate to='/change-password' replace />;
  }

  // Verificar roles permitidos
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to='/unauthorized' replace />;
  }

  // Verificar permisos requeridos
  if (requiredPermissions && user) {
    const hasAllPermissions = requiredPermissions.every((p) => user.permissions.includes(p));
    if (!hasAllPermissions) {
      return <Navigate to='/unauthorized' replace />;
    }
  }

  return <>{children}</>;
}

/**
 * Componente para rutas públicas (redirige a dashboard si ya está autenticado)
 */
interface PublicRouteProps {
  children: ReactNode;
  /** Redirección si el usuario ya está autenticado */
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
  const { isAuthenticated, isLoading, needsPasswordChange } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    );
  }

  // Si está autenticado pero necesita cambiar contraseña, ir a change-password
  if (isAuthenticated && needsPasswordChange) {
    return <Navigate to='/change-password' replace />;
  }

  // Si está autenticado, redirigir
  if (isAuthenticated) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

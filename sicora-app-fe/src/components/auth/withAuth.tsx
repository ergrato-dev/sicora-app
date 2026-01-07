import type { ComponentType } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

interface WithAuthOptions {
  allowedRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
}

/**
 * HOC para proteger componentes (alternativa a ProtectedRoute)
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: WithAuthOptions
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

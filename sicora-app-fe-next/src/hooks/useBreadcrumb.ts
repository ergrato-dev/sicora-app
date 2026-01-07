import type { BreadcrumbItem } from '../components/Breadcrumb';

/**
 * Hook para generar breadcrumbs automáticamente basado en la ruta
 */
export function useBreadcrumb(currentPath: string) {
  const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Inicio', href: '/dashboard', icon: '📊' }];

    // Mapeo de rutas a etiquetas legibles
    const routeLabels: Record<string, string> = {
      dashboard: 'Dashboard',
      usuarios: 'Usuarios',
      horarios: 'Horarios',
      evaluaciones: 'Evaluaciones',
      proyectos: 'Proyectos',
      competencias: 'Competencias',
      reportes: 'Reportes',
      configuracion: 'Configuración',
      perfil: 'Mi Perfil',
      fichas: 'Fichas',
      instructores: 'Instructores',
      aprendices: 'Aprendices',
      ambientes: 'Ambientes',
      asistencia: 'Asistencia',
      crear: 'Crear',
      editar: 'Editar',
      detalle: 'Detalle',
    };

    const routeIcons: Record<string, string> = {
      dashboard: '📊',
      usuarios: '👥',
      horarios: '📅',
      evaluaciones: '📝',
      proyectos: '🚀',
      competencias: '🎯',
      reportes: '📈',
      configuracion: '⚙️',
      perfil: '👤',
      fichas: '📋',
      instructores: '👨‍🏫',
      aprendices: '🎓',
      ambientes: '🏢',
      asistencia: '✅',
      crear: '➕',
      editar: '✏️',
      detalle: '👁️',
    };

    let currentHref = '';
    segments.forEach((segment, index) => {
      currentHref += `/${segment}`;
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const icon = routeIcons[segment] || '📄';

      breadcrumbs.push({
        label,
        href: currentHref,
        icon,
        active: index === segments.length - 1,
      });
    });

    return breadcrumbs;
  };

  return {
    breadcrumbs: generateBreadcrumbs(currentPath),
    generateBreadcrumbs,
  };
}

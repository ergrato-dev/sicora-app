import { useState } from 'react';
import { LogoSenaNav } from './LogoSena';
import { UserMenu } from './UserMenu';
import { Button } from './Button';
import { cn } from '../utils/cn';

/**
 * Navigation Component - Sistema de navegación completo SICORA
 * Incluye navegación contextual por rol y menú de usuario
 */

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'aprendiz' | 'coordinador' | 'administrativo';
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  coordination?: string;
  ficha?: string;
}

interface NavigationProps {
  /** Usuario actual */
  user?: User;
  /** Items de navegación personalizados */
  navigationItems?: NavigationItem[];
  /** Callback para navegación */
  onNavigate?: (href: string) => void;
  /** Callback para logout */
  onLogout: () => void;
  /** Clase CSS adicional */
  className?: string;
}

// Navegación por rol - Función que devuelve los items según el rol
const getNavigationByRole = (role: User['role']): NavigationItem[] => {
  const navigationConfig: Record<User['role'], NavigationItem[]> = {
    admin: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: '📊',
        active: true,
      },
      {
        label: 'Gestión de Usuarios',
        href: '/users',
        icon: '👥',
        children: [
          { label: 'Todos los Usuarios', href: '/users/management' },
          { label: 'Roles y Permisos', href: '/users/roles' },
          { label: 'Importar CSV', href: '/users/import' },
          { label: 'Auditoría', href: '/users/audit' },
          { label: 'Seguridad', href: '/users/security' },
          { label: 'Sesiones Activas', href: '/users/sessions' },
        ],
      },
      {
        label: 'Divulgación Tecnológica',
        href: '/academic',
        icon: '🏫',
        children: [
          { label: 'Demo Sistema Principal', href: '/demo' },
          { label: 'Contacto Seguro (Mejores Prácticas)', href: '/contacto-seguro' },
          { label: 'Design Tokens', href: '/design-tokens' },
          { label: 'Patrones UI', href: '/ui-patterns' },
          { label: 'Componentes de Formulario', href: '/form-components' },
          { label: 'Selects, Badges y Alertas', href: '/select-badge-alert' },
          { label: 'Modales, Skeleton y Toast', href: '/modal-skeleton-toast' },
          { label: 'Spinners, Tooltip y Dropdown', href: '/spinner-tooltip-dropdown' },
          { label: 'Seguimiento de Actividades', href: '/academic/attendance' },
          { label: 'Coordinaciones', href: '/academic/coordinations' },
          { label: 'Proyectos de Innovación', href: '/academic/programs' },
          { label: 'Equipos y Grupos', href: '/academic/groups' },
          { label: 'Espacios de Trabajo', href: '/academic/environments' },
        ],
      },
      {
        label: 'Evaluaciones',
        href: '/evaluations',
        icon: '📝',
        children: [
          { label: 'Evaluaciones Internas', href: '/evaluations/internal' },
          { label: 'Meta-evaluaciones', href: '/evaluations/meta' },
          { label: 'Evaluación de Proyectos', href: '/evaluations/projects' },
          { label: 'Competencias', href: '/evaluations/competencies' },
          { label: 'Certificaciones', href: '/evaluations/certifications' },
          { label: 'Plantillas', href: '/evaluations/templates' },
        ],
      },
      {
        label: 'Fábrica de Software',
        href: '/software-factory',
        icon: '🏭',
        children: [
          { label: 'Proyectos Activos', href: '/software-factory/projects' },
          { label: 'Equipos de Desarrollo', href: '/software-factory/teams' },
          { label: 'Sprints y Backlog', href: '/software-factory/sprints' },
          { label: 'Tecnologías', href: '/software-factory/tech-stack' },
          { label: 'Evaluación Continua', href: '/software-factory/evaluation' },
          { label: 'Infraestructura', href: '/software-factory/infrastructure' },
        ],
      },
      {
        label: 'IA y Análisis',
        href: '/ai',
        icon: '🤖',
        children: [
          { label: 'Dashboard IA', href: '/ai/dashboard' },
          { label: 'Análisis Predictivo', href: '/ai/analytics' },
          { label: 'Knowledge Base', href: '/ai/knowledge' },
          { label: 'Chatbot Académico', href: '/ai/chatbot' },
          { label: 'Modelos ML', href: '/ai/models' },
          { label: 'Entrenamiento', href: '/ai/training' },
        ],
      },
      {
        label: 'Reportes y Métricas',
        href: '/reports',
        icon: '📈',
        children: [
          { label: 'Dashboard Ejecutivo', href: '/reports/executive' },
          { label: 'Reportes Institucionales', href: '/reports/institutional' },
          { label: 'Métricas Académicas', href: '/reports/academic' },
          { label: 'Análisis de Asistencia', href: '/reports/attendance' },
          { label: 'Indicadores KPI', href: '/reports/kpi' },
          { label: 'Exportar Datos', href: '/reports/export' },
        ],
      },
      {
        label: 'Monitoreo de Sistema',
        href: '/monitoring',
        icon: '🔍',
        children: [
          { label: 'Estado Microservicios', href: '/monitoring/services' },
          { label: 'Performance', href: '/monitoring/performance' },
          { label: 'Logs del Sistema', href: '/monitoring/logs' },
          { label: 'Alertas', href: '/monitoring/alerts' },
          { label: 'Salud Base de Datos', href: '/monitoring/database' },
          { label: 'API Gateway', href: '/monitoring/gateway' },
        ],
      },
      {
        label: 'Configuración Global',
        href: '/settings',
        icon: '⚙️',
        children: [
          { label: 'Configuración General', href: '/settings/general' },
          { label: 'Parámetros SENA', href: '/settings/sena' },
          { label: 'Integrations', href: '/settings/integrations' },
          { label: 'Backup y Restore', href: '/settings/backup' },
          { label: 'Mantenimiento', href: '/settings/maintenance' },
          { label: 'Logs de Auditoría', href: '/settings/audit-logs' },
        ],
      },
    ],

    instructor: [
      {
        label: 'Mi Dashboard',
        href: '/dashboard',
        icon: '🏠',
        active: true,
      },
      {
        label: 'Mis Clases',
        href: '/classes',
        icon: '📚',
        children: [
          { label: 'Agenda de Hoy', href: '/classes/today' },
          { label: 'Mis Horarios', href: '/classes/schedules' },
          { label: 'Mis Grupos/Fichas', href: '/classes/groups' },
          { label: 'Ambientes Asignados', href: '/classes/environments' },
          { label: 'Competencias', href: '/classes/competencies' },
        ],
      },
      {
        label: 'Control de Asistencia',
        href: '/attendance',
        icon: '✅',
        children: [
          { label: 'Tomar Asistencia', href: '/attendance/take' },
          { label: 'Registro QR', href: '/attendance/qr' },
          { label: 'Historial', href: '/attendance/history' },
          { label: 'Justificaciones', href: '/attendance/justifications' },
          { label: 'Reportes', href: '/attendance/reports' },
        ],
      },
      {
        label: 'Evaluaciones',
        href: '/evaluations',
        icon: '📝',
        children: [
          { label: 'Crear Evaluación', href: '/evaluations/create' },
          { label: 'Mis Evaluaciones', href: '/evaluations/mine' },
          { label: 'Calificaciones', href: '/evaluations/grades' },
          { label: 'Seguimiento', href: '/evaluations/tracking' },
          { label: 'Plantillas', href: '/evaluations/templates' },
        ],
      },
      {
        label: 'Fábrica de Software',
        href: '/software-factory',
        icon: '🏭',
        children: [
          { label: 'Mis Proyectos', href: '/software-factory/my-projects' },
          { label: 'Equipos a Cargo', href: '/software-factory/teams' },
          { label: 'Sprints Activos', href: '/software-factory/sprints' },
          { label: 'Evaluación Continua', href: '/software-factory/evaluation' },
        ],
      },
      {
        label: 'Recursos y Ayuda',
        href: '/resources',
        icon: '📖',
        children: [
          { label: 'Knowledge Base', href: '/resources/kb' },
          { label: 'Reglamentos', href: '/resources/regulations' },
          { label: 'Asistente IA', href: '/resources/ai-help' },
          { label: 'Material Didáctico', href: '/resources/materials' },
          { label: 'Capacitación', href: '/resources/training' },
          { label: 'Demo Sistema', href: '/demo' },
        ],
      },
    ],

    aprendiz: [
      {
        label: 'Mi Dashboard',
        href: '/dashboard',
        icon: '🏠',
        active: true,
      },
      {
        label: 'Mi Horario',
        href: '/schedule',
        icon: '📅',
        children: [
          { label: 'Hoy', href: '/schedule/today' },
          { label: 'Semanal', href: '/schedule/week' },
          { label: 'Mensual', href: '/schedule/month' },
          { label: 'Competencias', href: '/schedule/competencies' },
        ],
      },
      {
        label: 'Mi Asistencia',
        href: '/attendance',
        icon: '📊',
        children: [
          { label: 'Registro QR', href: '/attendance/qr' },
          { label: 'Mi Historial', href: '/attendance/history' },
          { label: 'Justificaciones', href: '/attendance/justifications' },
          { label: 'Estadísticas', href: '/attendance/stats' },
        ],
      },
      {
        label: 'Mis Evaluaciones',
        href: '/evaluations',
        icon: '📈',
        children: [
          { label: 'Pendientes', href: '/evaluations/pending' },
          { label: 'Historial', href: '/evaluations/history' },
          { label: 'Mis Notas', href: '/evaluations/grades' },
          { label: 'Competencias', href: '/evaluations/competencies' },
          { label: 'Autoevaluación', href: '/evaluations/self' },
        ],
      },
      {
        label: 'Fábrica de Software',
        href: '/software-factory',
        icon: '🏭',
        children: [
          { label: 'Mis Proyectos', href: '/software-factory/my-projects' },
          { label: 'Mi Equipo', href: '/software-factory/team' },
          { label: 'Mis Tareas', href: '/software-factory/tasks' },
          { label: 'Sprints', href: '/software-factory/sprints' },
          { label: 'Portafolio', href: '/software-factory/portfolio' },
        ],
      },
      {
        label: 'Recursos y Ayuda',
        href: '/resources',
        icon: '📚',
        children: [
          { label: 'Material de Estudio', href: '/resources/study' },
          { label: 'Reglamento Académico', href: '/resources/regulations' },
          { label: 'Asistente IA', href: '/resources/ai-help' },
          { label: 'FAQ', href: '/resources/faq' },
          { label: 'Soporte', href: '/resources/support' },
        ],
      },
    ],

    coordinador: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: '📊',
        active: true,
      },
      {
        label: 'Mi Coordinación',
        href: '/coordination',
        icon: '🏛️',
        children: [
          { label: 'Fichas y Grupos', href: '/coordination/groups' },
          { label: 'Instructores', href: '/coordination/instructors' },
          { label: 'Aprendices', href: '/coordination/students' },
          { label: 'Programas Formativos', href: '/coordination/programs' },
          { label: 'Competencias', href: '/coordination/competencies' },
        ],
      },
      {
        label: 'Gestión de Horarios',
        href: '/schedules',
        icon: '📅',
        children: [
          { label: 'Programación General', href: '/schedules/management' },
          { label: 'Ambientes', href: '/schedules/environments' },
          { label: 'Conflictos', href: '/schedules/conflicts' },
          { label: 'Optimización', href: '/schedules/optimization' },
          { label: 'Exportar/Importar', href: '/schedules/import-export' },
        ],
      },
      {
        label: 'Seguimiento Académico',
        href: '/tracking',
        icon: '📈',
        children: [
          { label: 'Asistencia General', href: '/tracking/attendance' },
          { label: 'Desempeño Grupos', href: '/tracking/performance' },
          { label: 'Alertas Tempranas', href: '/tracking/alerts' },
          { label: 'Análisis Deserción', href: '/tracking/dropout' },
          { label: 'Métricas Calidad', href: '/tracking/quality' },
        ],
      },
      {
        label: 'Demos y Componentes',
        href: '/demos',
        icon: '🎯',
        children: [
          { label: 'Demo Sistema Principal', href: '/demo' },
          { label: 'Design Tokens', href: '/design-tokens' },
          { label: 'Patrones UI', href: '/ui-patterns' },
          { label: 'Componentes de Formulario', href: '/form-components' },
        ],
      },
      {
        label: 'Evaluaciones',
        href: '/evaluations',
        icon: '📝',
        children: [
          { label: 'Supervisión', href: '/evaluations/supervision' },
          { label: 'Evaluación Instructores', href: '/evaluations/instructors' },
          { label: 'Competencias', href: '/evaluations/competencies' },
          { label: 'Proyectos Coordinación', href: '/evaluations/projects' },
        ],
      },
      {
        label: 'Reportes',
        href: '/reports',
        icon: '📋',
        children: [
          { label: 'Reporte Coordinación', href: '/reports/coordination' },
          { label: 'Académicos', href: '/reports/academic' },
          { label: 'Administrativos', href: '/reports/administrative' },
          { label: 'Indicadores', href: '/reports/indicators' },
        ],
      },
    ],

    administrativo: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: '📊',
        active: true,
      },
      {
        label: 'Supervisión General',
        href: '/supervision',
        icon: '👁️',
        children: [
          { label: 'Vista General', href: '/supervision/overview' },
          { label: 'Procesos Activos', href: '/supervision/processes' },
          { label: 'Métricas Operativas', href: '/supervision/metrics' },
          { label: 'Control de Calidad', href: '/supervision/quality' },
          { label: 'Alertas Sistema', href: '/supervision/alerts' },
        ],
      },
      {
        label: 'Gestión Administrativa',
        href: '/management',
        icon: '🏢',
        children: [
          { label: 'Configuración Sistema', href: '/management/system-config' },
          { label: 'Gestión de Usuarios', href: '/management/users' },
          { label: 'Mantenimiento', href: '/management/maintenance' },
          { label: 'Respaldos', href: '/management/backups' },
          { label: 'Integrations', href: '/management/integrations' },
        ],
      },
      {
        label: 'Reportes Ejecutivos',
        href: '/reports',
        icon: '📈',
        children: [
          { label: 'Dashboard Ejecutivo', href: '/reports/executive' },
          { label: 'Institucionales', href: '/reports/institutional' },
          { label: 'Operativos', href: '/reports/operational' },
          { label: 'Financieros', href: '/reports/financial' },
          { label: 'Compliance', href: '/reports/compliance' },
        ],
      },
      {
        label: 'Auditoría y Seguridad',
        href: '/audit',
        icon: '🔒',
        children: [
          { label: 'Logs de Auditoría', href: '/audit/logs' },
          { label: 'Accesos', href: '/audit/access' },
          { label: 'Seguridad', href: '/audit/security' },
          { label: 'Compliance', href: '/audit/compliance' },
        ],
      },
    ],
  };

  return navigationConfig[role] || [];
};

export function Navigation({
  user,
  navigationItems,
  onNavigate,
  onLogout,
  className,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const navItems = navigationItems || (user ? getNavigationByRole(user.role) : []);

  const handleNavigate = (href: string) => {
    onNavigate?.(href);
    setMobileMenuOpen(false);
  };

  const toggleDropdown = (label: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(label)) {
      newOpenDropdowns.delete(label);
    } else {
      newOpenDropdowns.add(label);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  return (
    <header className={cn('bg-white shadow-sm border-b border-gray-200', className)}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo y título */}
          <div className='flex items-center space-x-4'>
            <LogoSenaNav size='md' onClick={() => handleNavigate('/dashboard')} />
            <div className='border-l border-gray-300 pl-4'>
              <h1 className='text-xl font-sena-heading font-semibold text-gray-900'>SICORA</h1>
              <span className='text-sm text-gray-500 font-sena-body'>
                Sistema de Información de Coordinación Académica
              </span>
            </div>
          </div>

          {/* Navegación desktop */}
          <nav className='hidden lg:flex items-center space-x-1'>
            {navItems.map((item) => (
              <div key={item.label} className='relative'>
                {item.children ? (
                  <div className='relative'>
                    <Button
                      variant='ghost'
                      onClick={() => toggleDropdown(item.label)}
                      className={cn(
                        'flex items-center space-x-1 px-3 py-2 text-sm font-sena-body',
                        item.active && 'bg-sena-primary-50 text-sena-primary-700'
                      )}
                    >
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.label}</span>
                      <svg
                        className={cn(
                          'w-4 h-4 transition-transform duration-150',
                          openDropdowns.has(item.label) && 'rotate-180'
                        )}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </Button>

                    {/* Dropdown menu */}
                    {openDropdowns.has(item.label) && (
                      <div className='absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
                        {item.children.map((child) => (
                          <button
                            key={child.label}
                            onClick={() => handleNavigate(child.href)}
                            className='w-full px-4 py-2 text-left text-sm font-sena-body text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150'
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant='ghost'
                    onClick={() => handleNavigate(item.href)}
                    className={cn(
                      'flex items-center space-x-1 px-3 py-2 text-sm font-sena-body',
                      item.active && 'bg-sena-primary-50 text-sena-primary-700'
                    )}
                    disabled={item.disabled}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className='ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full'>
                        {item.badge}
                      </span>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </nav>

          {/* User menu y mobile button */}
          <div className='flex items-center space-x-4'>
            {user && (
              <UserMenu
                user={user}
                onLogout={onLogout}
                onProfile={() => handleNavigate('/profile')}
                onSettings={() => handleNavigate('/settings')}
              />
            )}

            {/* Mobile menu button */}
            <Button
              variant='ghost'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='lg:hidden p-2'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className='lg:hidden border-t border-gray-200 py-4'>
            <nav className='space-y-2'>
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className='w-full flex items-center justify-between px-3 py-2 text-left text-base font-sena-body text-gray-700 hover:bg-gray-50 rounded-md'
                      >
                        <div className='flex items-center space-x-2'>
                          {item.icon && <span>{item.icon}</span>}
                          <span>{item.label}</span>
                        </div>
                        <svg
                          className={cn(
                            'w-4 h-4 transition-transform duration-150',
                            openDropdowns.has(item.label) && 'rotate-180'
                          )}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </button>

                      {openDropdowns.has(item.label) && (
                        <div className='ml-6 mt-2 space-y-1'>
                          {item.children.map((child) => (
                            <button
                              key={child.label}
                              onClick={() => handleNavigate(child.href)}
                              className='block w-full px-3 py-2 text-left text-sm font-sena-body text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md'
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavigate(item.href)}
                      className={cn(
                        'w-full flex items-center space-x-2 px-3 py-2 text-left text-base font-sena-body rounded-md transition-colors duration-150',
                        item.active
                          ? 'bg-sena-primary-50 text-sena-primary-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                      disabled={item.disabled}
                    >
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className='ml-auto px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full'>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

import { useState } from 'react';
import { LogoSenaNav } from './LogoSena';
import { UserMenu } from './UserMenu';
import { Breadcrumb } from './Breadcrumb';
import { cn } from '../utils/cn';
import { BRAND_CONFIG, IS_SENA_BUILD } from '../config/brand';

/**
 * InstitutionalHeader - Header institucional adaptativo
 * Incluye logo, navegación principal, breadcrumbs y menú de usuario
 * Se adapta automáticamente entre configuración SENA y EPTI según variables de entorno
 */

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

interface InstitutionalHeaderProps {
  /** Usuario actual */
  user?: User;
  /** Ruta actual para breadcrumbs */
  currentPath?: string;
  /** Título de la página actual */
  pageTitle?: string;
  /** Callback para navegación */
  onNavigate?: (href: string) => void;
  /** Callback para logout */
  onLogout: () => void;
  /** Mostrar breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export function InstitutionalHeader({
  user,
  currentPath = '/dashboard',
  pageTitle,
  onNavigate,
  onLogout,
  showBreadcrumbs = true,
  className,
}: InstitutionalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Generar breadcrumbs automáticamente
  const breadcrumbItems = currentPath
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => {
      const isLast = index === array.length - 1;
      const href = '/' + array.slice(0, index + 1).join('/');

      // Mapeo de rutas a etiquetas
      const routeLabels: Record<string, string> = {
        dashboard: 'Dashboard',
        users: 'Usuarios',
        academic: 'Académico',
        evaluations: 'Evaluaciones',
        'software-factory': 'Fábrica Software',
        ai: 'IA & Análisis',
        reports: 'Reportes',
        settings: 'Configuración',
        classes: 'Mis Clases',
        attendance: 'Asistencia',
      };

      return {
        label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : href,
        active: isLast,
      };
    });

  // Agregar "Inicio" al principio
  const fullBreadcrumbs = [{ label: 'Inicio', href: '/dashboard', icon: '🏠' }, ...breadcrumbItems];

  return (
    <header className={cn('bg-white shadow-sm border-b border-gray-200', className)}>
      {/* Header principal */}
      <div className='bg-sena-primary-700 text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo y título institucional */}
            <div className='flex items-center space-x-4'>
              {BRAND_CONFIG.showLogo && <LogoSenaNav size='md' />}
              <div className='hidden md:block'>
                <h1 className='text-lg font-sena-heading font-semibold'>
                  {IS_SENA_BUILD ? 'Sistema SICORA' : BRAND_CONFIG.name}
                </h1>
                <p className='text-xs text-sena-primary-200 font-sena-body'>
                  {IS_SENA_BUILD ? 'Coordinación Académica - CGMLTI' : BRAND_CONFIG.subtitle}
                </p>
              </div>
            </div>

            {/* Info de usuario y menú */}
            <div className='flex items-center space-x-4'>
              {/* Información contextual */}
              {user && (
                <div className='hidden lg:flex items-center space-x-3 text-sm'>
                  <div className='text-right'>
                    <div className='font-medium'>{user.coordination || user.ficha}</div>
                    <div className='text-sena-primary-200 text-xs'>
                      {user.role === 'admin' && 'Administrador del Sistema'}
                      {user.role === 'instructor' && 'Instructor'}
                      {user.role === 'coordinador' && 'Coordinador Académico'}
                      {user.role === 'aprendiz' && `Aprendiz - Ficha ${user.ficha}`}
                      {user.role === 'administrativo' && 'Administrativo'}
                    </div>
                  </div>
                  <div className='w-px h-8 bg-sena-primary-500'></div>
                </div>
              )}

              {/* Menú de usuario */}
              {user && (
                <UserMenu
                  user={user}
                  onLogout={onLogout}
                  onProfile={() => onNavigate?.('/profile')}
                  className='relative'
                />
              )}

              {/* Botón menú móvil */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className='md:hidden p-2 rounded-md text-sena-primary-200 hover:text-white hover:bg-sena-primary-600 focus:outline-none focus:ring-2 focus:ring-white'
              >
                <span className='sr-only'>Abrir menú</span>
                <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs y título de página */}
      {showBreadcrumbs && (
        <div className='bg-gray-50 border-b border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex items-center justify-between py-3'>
              {/* Breadcrumbs */}
              <Breadcrumb
                items={fullBreadcrumbs}
                onNavigate={onNavigate}
                className='bg-transparent px-0 py-0 border-0'
              />

              {/* Título de página actual */}
              {pageTitle && (
                <div className='flex items-center space-x-2'>
                  <h2 className='text-lg font-sena-heading font-semibold text-gray-900'>
                    {pageTitle}
                  </h2>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div className='md:hidden bg-sena-primary-600 border-t border-sena-primary-500'>
          <div className='px-2 pt-2 pb-3 space-y-1'>
            {user && (
              <div className='px-3 py-2 text-white'>
                <div className='font-medium'>{user.name}</div>
                <div className='text-sm text-sena-primary-200'>{user.email}</div>
              </div>
            )}
            <button
              onClick={onLogout}
              className='w-full text-left px-3 py-2 text-white hover:bg-sena-primary-500 rounded-md'
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default InstitutionalHeader;

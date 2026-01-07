import type { ReactNode } from 'react';
import { InstitutionalHeader } from './InstitutionalHeader';
import { InstitutionalFooter } from './InstitutionalFooter';
import { InstitutionalSearchBar } from './InstitutionalSearchBar';
import { StickyDisclaimerBanner } from './StickyDisclaimerBanner';
import { sicoraSearchSuggestions } from '../constants/searchOptions';
import Breadcrumb from './Breadcrumb';
import { useBreadcrumb } from '../hooks/useBreadcrumb';
import { cn } from '../utils/cn';

/**
 * InstitutionalLayout - Layout completo estilo SENA
 * Integra header, breadcrumbs, search, content y footer institucional
 * Inspirado en SofiaPlus y sistema de contratistas
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

interface InstitutionalLayoutProps {
  /** Usuario actual */
  user?: User;
  /** Contenido principal */
  children: ReactNode;
  /** Título de la página */
  pageTitle?: string;
  /** Ruta actual para breadcrumbs */
  currentPath?: string;
  /** Mostrar barra de búsqueda */
  showSearchBar?: boolean;
  /** Mostrar breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Callback para navegación */
  onNavigate?: (href: string) => void;
  /** Callback para logout */
  onLogout: () => void;
  /** Callback para búsqueda */
  onSearch?: (query: string, filters?: Record<string, unknown>) => void;
  /** Clase CSS adicional */
  className?: string;
}

export function InstitutionalLayout({
  user,
  children,
  pageTitle,
  currentPath = '/dashboard',
  showSearchBar = false,
  showBreadcrumbs = true,
  onNavigate,
  onLogout,
  onSearch,
  className,
}: InstitutionalLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)}>
      {/* Banner de Disclaimer Sticky */}
      <StickyDisclaimerBanner />

      {/* Header Institucional */}
      <InstitutionalHeader
        user={user}
        currentPath={currentPath}
        pageTitle={pageTitle}
        onNavigate={onNavigate}
        onLogout={onLogout}
        showBreadcrumbs={false} // Los breadcrumbs van por separado
      />

      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className='bg-gray-50 border-b border-gray-200 py-3'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <nav className='flex items-center space-x-2 text-sm font-sena-body text-gray-600'>
              <span className='text-sena-primary-600'>🏠</span>
              <span className='mx-2'>›</span>
              <span className='font-medium text-sena-primary-600'>{pageTitle || 'Dashboard'}</span>
            </nav>
          </div>
        </div>
      )}

      {/* Barra de búsqueda institucional */}
      {showSearchBar && (
        <InstitutionalSearchBar
          title={
            user?.role === 'admin'
              ? '¿Qué necesita administrar?'
              : user?.role === 'instructor'
                ? '¿Qué necesita para sus clases?'
                : user?.role === 'coordinador'
                  ? '¿Qué necesita coordinar?'
                  : '¿Qué necesita encontrar?'
          }
          subtitle='Busque usuarios, horarios, evaluaciones o cualquier información del sistema SICORA'
          suggestions={sicoraSearchSuggestions}
          onSearch={onSearch}
          variant='default'
        />
      )}

      {/* Contenido principal */}
      <main className='flex-1'>
        <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>{children}</div>
        </div>
      </main>

      {/* Footer Institucional */}
      <InstitutionalFooter />
    </div>
  );
}

/**
 * Layout Hero - Para páginas de inicio con búsqueda prominente
 */
interface HeroLayoutProps extends Omit<InstitutionalLayoutProps, 'showSearchBar'> {
  /** Título principal del hero */
  heroTitle?: string;
  /** Subtítulo del hero */
  heroSubtitle?: string;
}

export function HeroLayout({
  user,
  children,
  pageTitle,
  currentPath = '/dashboard',
  heroTitle = '¡Bienvenido a SICORA!',
  heroSubtitle = 'Sistema integral de gestión académica del CGMLTI SENA',
  onNavigate,
  onLogout,
  onSearch,
  className,
}: HeroLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)}>
      {/* Header Institucional */}
      <InstitutionalHeader
        user={user}
        currentPath={currentPath}
        pageTitle={pageTitle}
        onNavigate={onNavigate}
        onLogout={onLogout}
        showBreadcrumbs={false}
      />

      {/* Hero Section con búsqueda */}
      <InstitutionalSearchBar
        title={heroTitle}
        subtitle={heroSubtitle}
        suggestions={sicoraSearchSuggestions}
        onSearch={onSearch}
        variant='hero'
      />

      {/* Contenido principal */}
      <main className='flex-1'>
        <div className='max-w-7xl mx-auto py-12 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>{children}</div>
        </div>
      </main>

      {/* Footer Institucional */}
      <InstitutionalFooter />
    </div>
  );
}

/**
 * Layout Simple - Para páginas internas sin hero
 */
interface SimpleLayoutProps extends Omit<InstitutionalLayoutProps, 'showSearchBar'> {
  /** Placeholder para extender en el futuro */
  _placeholder?: never;
}

export function SimpleLayout({
  user,
  children,
  pageTitle,
  currentPath = '/dashboard',
  showBreadcrumbs = true,
  onNavigate,
  onLogout,
  className,
}: SimpleLayoutProps) {
  const { breadcrumbs } = useBreadcrumb(currentPath);

  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)}>
      {/* Header Institucional */}
      <InstitutionalHeader
        user={user}
        currentPath={currentPath}
        pageTitle={pageTitle}
        onNavigate={onNavigate}
        onLogout={onLogout}
        showBreadcrumbs={false}
      />

      {/* Breadcrumbs */}
      {showBreadcrumbs && <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />}

      {/* Contenido principal */}
      <main className='flex-1'>
        <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>{children}</div>
        </div>
      </main>

      {/* Footer Institucional */}
      <InstitutionalFooter />
    </div>
  );
}

/**
 * Layout Dashboard - Para páginas de dashboard con búsqueda compacta
 */
interface DashboardLayoutProps extends Omit<InstitutionalLayoutProps, 'showSearchBar'> {
  /** Placeholder para extender en el futuro */
  _placeholder?: never;
}

export function DashboardLayout({
  user,
  children,
  pageTitle = 'Dashboard',
  currentPath = '/dashboard',
  onNavigate,
  onLogout,
  onSearch,
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)}>
      {/* Header Institucional */}
      <InstitutionalHeader
        user={user}
        currentPath={currentPath}
        pageTitle={pageTitle}
        onNavigate={onNavigate}
        onLogout={onLogout}
        showBreadcrumbs={false}
      />

      {/* Búsqueda compacta */}
      <div className='bg-white border-b border-gray-200 py-4'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <InstitutionalSearchBar
            placeholder='Buscar en SICORA...'
            suggestions={sicoraSearchSuggestions}
            onSearch={onSearch}
            variant='compact'
            showFilters={false}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <main className='flex-1'>
        <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
          <div className='px-4 py-6 sm:px-0'>{children}</div>
        </div>
      </main>

      {/* Footer Institucional */}
      <InstitutionalFooter />
    </div>
  );
}

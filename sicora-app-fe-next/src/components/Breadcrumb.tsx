import { cn } from '../utils/cn';

/**
 * Breadcrumb Component - Navegación jerárquica institucional SENA
 * Muestra la ruta actual del usuario en el sistema
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
  icon?: string;
}

interface BreadcrumbProps {
  /** Items de la ruta de navegación */
  items: BreadcrumbItem[];
  /** Callback para navegación */
  onNavigate?: (href: string) => void;
  /** Separador personalizado */
  separator?: string;
  /** Clase CSS adicional */
  className?: string;
}

export function Breadcrumb({ items, onNavigate, separator = '/', className }: BreadcrumbProps) {
  const handleClick = (item: BreadcrumbItem) => {
    if (item.href && onNavigate && !item.active) {
      onNavigate(item.href);
    }
  };

  return (
    <nav
      className={cn(
        'flex items-center space-x-2 text-sm font-sena-body',
        'bg-gray-50 px-4 py-2 border-b border-gray-200',
        'text-gray-600',
        className
      )}
      aria-label='Breadcrumb'
    >
      <div className='flex items-center space-x-2'>
        {/* Icono de inicio */}
        <span className='text-sena-primary-600' aria-hidden='true'>
          🏠
        </span>

        {items.map((item, index) => (
          <div key={index} className='flex items-center space-x-2'>
            {/* Separador */}
            {index > 0 && (
              <span className='text-gray-400 select-none' aria-hidden='true'>
                {separator}
              </span>
            )}

            {/* Item de breadcrumb */}
            <div className='flex items-center space-x-1'>
              {item.icon && (
                <span className='text-xs' aria-hidden='true'>
                  {item.icon}
                </span>
              )}

              {item.active ? (
                <span className='font-medium text-sena-primary-700' aria-current='page'>
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => handleClick(item)}
                  className={cn(
                    'text-gray-600 hover:text-sena-primary-600',
                    'transition-colors duration-200',
                    'focus:outline-none focus:text-sena-primary-700',
                    item.href ? 'cursor-pointer' : 'cursor-default'
                  )}
                  disabled={!item.href}
                >
                  {item.label}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

export default Breadcrumb;

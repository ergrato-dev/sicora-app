import { Link } from 'react-router-dom';
import { Shield, FileText, Map, Eye, AlertTriangle } from 'lucide-react';

/**
 * LegalNavigation - Navegación rápida para páginas legales
 * Componente que muestra enlaces a todas las páginas legales
 */

interface LegalNavigationProps {
  /** Estilo de visualización */
  variant?: 'horizontal' | 'vertical' | 'grid';
  /** Mostrar íconos */
  showIcons?: boolean;
  /** Mostrar descripciones */
  showDescriptions?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export function LegalNavigation({
  variant = 'grid',
  showIcons = true,
  showDescriptions = true,
  className = '',
}: LegalNavigationProps) {
  const legalPages = [
    {
      name: 'Política de Privacidad',
      path: '/legal/politica-privacidad',
      description: 'Tratamiento de datos personales según Ley 1581 de 2012',
      icon: Shield,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    },
    {
      name: 'Términos de Uso',
      path: '/legal/terminos-uso',
      description: 'Condiciones de uso de la plataforma SICORA',
      icon: FileText,
      color: 'text-green-600 bg-green-50 hover:bg-green-100',
    },
    {
      name: 'Mapa del Sitio',
      path: '/legal/mapa-sitio',
      description: 'Navegación completa de la plataforma',
      icon: Map,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    },
    {
      name: 'Accesibilidad',
      path: '/legal/accesibilidad',
      description: 'Compromiso con la inclusión digital',
      icon: Eye,
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
    },
  ];

  const getLayoutClasses = () => {
    switch (variant) {
      case 'horizontal':
        return 'flex flex-wrap gap-4';
      case 'vertical':
        return 'flex flex-col space-y-2';
      case 'grid':
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
    }
  };

  return (
    <div className={`${className}`}>
      <div className='mb-4'>
        <div className='flex items-center space-x-2 mb-2'>
          <AlertTriangle className='w-5 h-5 text-yellow-600' />
          <h3 className='text-lg font-semibold text-gray-900'>Información Legal</h3>
        </div>
        <p className='text-sm text-gray-600'>
          Consulte nuestras políticas y términos de uso para un uso adecuado de la plataforma.
        </p>
      </div>

      <div className={getLayoutClasses()}>
        {legalPages.map((page, index) => {
          const IconComponent = page.icon;
          return (
            <Link
              key={index}
              to={page.path}
              className={`
                ${page.color}
                border border-gray-200 rounded-lg p-4 transition-all duration-200
                hover:shadow-md hover:border-gray-300 hover:scale-105
                ${variant === 'horizontal' ? 'flex-1 min-w-0' : ''}
              `}
            >
              <div className='flex items-start space-x-3'>
                {showIcons && <IconComponent className='w-5 h-5 flex-shrink-0 mt-0.5' />}
                <div className='min-w-0 flex-1'>
                  <h4 className='font-semibold text-gray-900 text-sm mb-1'>{page.name}</h4>
                  {showDescriptions && (
                    <p className='text-xs text-gray-600 leading-relaxed'>{page.description}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default LegalNavigation;

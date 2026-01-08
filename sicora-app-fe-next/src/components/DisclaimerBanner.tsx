import { useState } from 'react';
import { cn } from '../utils/cn';
import { IS_SENA_BUILD, BRAND_CONFIG } from '../config/brand';

/**
 * DisclaimerBanner - Aviso de exención de responsabilidad para EPTI OneVision
 * Muestra información importante sobre el uso de código y ejemplos sintéticos
 */

interface DisclaimerBannerProps {
  /** Mostrar como banner sticky en la parte superior */
  variant?: 'banner' | 'card' | 'inline';
  /** Permitir que el usuario cierre el banner */
  dismissible?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export function DisclaimerBanner({
  variant = 'card',
  dismissible = false,
  className,
}: DisclaimerBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const content = (
    <>
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0'>
          <div className='w-8 h-8 bg-sena-secondary-100 rounded-full flex items-center justify-center'>
            <span className='text-sena-secondary-600 text-lg'>⚠️</span>
          </div>
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-sena-heading font-semibold text-sena-neutral-700 mb-2'>
            🔒 Aviso de Exención de Responsabilidad
          </h3>
          <div className='text-sm font-sena-body text-sena-neutral-600 space-y-2'>
            <p>
              <strong>
                {IS_SENA_BUILD ? 'SICORA' : BRAND_CONFIG.name} - Entorno de Demostración
              </strong>
            </p>

            <div className='bg-sena-naranja bg-opacity-20 border border-sena-naranja-light rounded-lg p-3 space-y-2'>
              <p className='font-semibold text-sena-neutral-700'>
                📋 IMPORTANTE - Todos los datos son SINTÉTICOS:
              </p>
              <ul className='list-disc pl-5 space-y-1 text-sena-neutral-600'>
                <li>Los datos mostrados son completamente ficticios y autogenerados</li>
                <li>NO representan información real del SENA o cualquier institución</li>
                <li>Cualquier similitud con datos reales es PURA COINCIDENCIA</li>
                <li>Los ejemplos de código son solo para fines educativos</li>
              </ul>
            </div>

            <div className='bg-sena-secondary-50 border border-sena-secondary-200 rounded-lg p-3 space-y-2'>
              <p className='font-semibold text-sena-neutral-700'>
                ⚖️ Exención de Responsabilidad Legal:
              </p>
              <ul className='list-disc pl-5 space-y-1 text-sena-neutral-600'>
                <li>El código y ejemplos se proporcionan &ldquo;TAL COMO ESTÁN&rdquo;</li>
                <li>Sin garantías de ningún tipo, expresas o implícitas</li>
                <li>Use bajo su propio riesgo y responsabilidad</li>
                <li>Valide y adapte todo código antes de uso en producción</li>
              </ul>
            </div>

            <div className='bg-sena-secondary-100 border border-sena-secondary-300 rounded-lg p-3 space-y-2'>
              <p className='font-semibold text-sena-neutral-700'>
                📚 Propósito Educativo y Demostrativo:
              </p>
              <ul className='list-disc pl-5 space-y-1 text-sena-neutral-600'>
                <li>Sistema diseñado exclusivamente para demostración</li>
                <li>Ejemplos de mejores prácticas en desarrollo web</li>
                <li>Arquitectura de referencia para sistemas académicos</li>
                <li>Separación total de sistemas productivos institucionales</li>
              </ul>
            </div>

            <p className='text-xs text-sena-neutral-500 italic border-t pt-2'>
              Al usar este sistema, usted acepta estos términos y reconoce que comprende la
              naturaleza sintética de todos los datos presentados.
            </p>
          </div>
        </div>

        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className='flex-shrink-0 w-6 h-6 bg-sena-secondary-200 hover:bg-sena-secondary-300 rounded-full flex items-center justify-center transition-colors'
            title='Cerrar aviso'
          >
            <span className='text-sena-neutral-700 text-sm'>×</span>
          </button>
        )}
      </div>
    </>
  );

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'bg-sena-naranja border-b border-sena-naranja-light py-3',
          dismissible && 'sticky top-0 z-50',
          className
        )}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>{content}</div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('text-xs text-gray-600 font-sena-body', className)}>
        <span className='inline-flex items-center space-x-1'>
          <span>⚠️</span>
          <span>Datos sintéticos - Solo demostración</span>
        </span>
      </div>
    );
  }

  // variant === 'card' (default)
  return (
    <div
      className={cn(
        'bg-sena-naranja bg-opacity-10 border border-sena-naranja-light rounded-lg shadow-md p-6 mb-8',
        className
      )}
    >
      {content}
    </div>
  );
}

export default DisclaimerBanner;

'use client';

import { cn } from '../../utils/cn';

export interface VisuallyHiddenProps {
  /** Contenido oculto visualmente pero accesible para lectores de pantalla */
  children: React.ReactNode;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * VisuallyHidden - Oculta contenido visualmente pero lo mantiene accesible
 *
 * Implementa WCAG 2.1:
 * - 1.1.1 Non-text Content (alternativas de texto)
 * - 1.3.1 Info and Relationships (información estructural)
 *
 * Usa la técnica sr-only de Tailwind que:
 * - Oculta visualmente el contenido
 * - Mantiene el contenido en el DOM
 * - Permite lectura por screen readers
 *
 * @example
 * // Texto descriptivo para iconos
 * <button>
 *   <TrashIcon />
 *   <VisuallyHidden>Eliminar usuario</VisuallyHidden>
 * </button>
 */
export function VisuallyHidden({ children, className }: VisuallyHiddenProps) {
  return <span className={cn('sr-only', className)}>{children}</span>;
}

export interface LiveRegionProps {
  /** Contenido a anunciar */
  children: React.ReactNode;
  /**
   * Tipo de anuncio:
   * - polite: Espera a que el usuario termine de interactuar
   * - assertive: Interrumpe inmediatamente
   */
  politeness?: 'polite' | 'assertive';
  /**
   * Si es true, lee todo el contenido aunque solo cambie una parte
   */
  atomic?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Rol ARIA del elemento */
  role?: 'status' | 'alert' | 'log' | 'marquee' | 'timer';
}

/**
 * LiveRegion - Región viva para anuncios dinámicos
 *
 * Implementa WCAG 2.1 Criterio 4.1.3 - Status Messages
 * Anuncia cambios de contenido a tecnologías asistivas.
 *
 * Usa aria-live para notificar cambios sin mover el foco.
 *
 * @example
 * // Mensaje de estado (no urgente)
 * <LiveRegion politeness="polite">
 *   {isLoading ? 'Cargando datos...' : `${count} resultados encontrados`}
 * </LiveRegion>
 *
 * @example
 * // Alerta importante (urgente)
 * <LiveRegion politeness="assertive" role="alert">
 *   {errorMessage}
 * </LiveRegion>
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
  className,
  role = 'status',
}: LiveRegionProps) {
  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn('sr-only', className)}>
      {children}
    </div>
  );
}

export default VisuallyHidden;

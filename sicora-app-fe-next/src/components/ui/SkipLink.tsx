'use client';

import { cn } from '../../utils/cn';

export interface SkipLinkProps {
  /** ID del elemento al que saltar (sin #) */
  targetId: string;
  /** Texto del enlace */
  children: React.ReactNode;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * SkipLink - Enlace de salto para navegación por teclado
 *
 * Implementa WCAG 2.1 Criterio 2.4.1 - Bypass Blocks
 * Permite a usuarios de teclado/lectores de pantalla saltar
 * directamente al contenido principal.
 *
 * El enlace es invisible hasta que recibe foco por teclado.
 *
 * @example
 * // En el layout principal
 * <SkipLink targetId="main-content">
 *   Saltar al contenido principal
 * </SkipLink>
 * <Header />
 * <main id="main-content">
 *   ...
 * </main>
 *
 * @example
 * // Múltiples skip links
 * <div className="skip-links">
 *   <SkipLink targetId="main-content">Ir al contenido</SkipLink>
 *   <SkipLink targetId="main-nav">Ir a navegación</SkipLink>
 *   <SkipLink targetId="footer">Ir al pie de página</SkipLink>
 * </div>
 */
export function SkipLink({ targetId, children, className }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        // Invisible por defecto
        'sr-only',
        // Visible al recibir foco
        'focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]',
        // Estilos visuales
        'focus:bg-sena-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md',
        'focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sena-primary',
        'focus:font-medium focus:text-sm focus:shadow-lg',
        // Transición suave
        'focus:animate-in focus:fade-in focus:duration-150',
        className
      )}>
      {children}
    </a>
  );
}

/**
 * SkipLinks - Grupo de enlaces de salto predefinidos para SICORA
 *
 * Incluye los skip links más comunes para la aplicación.
 * Colocar al inicio del body/layout.
 *
 * @example
 * // En layout.tsx de Next.js
 * <body>
 *   <SkipLinks />
 *   <InstitutionalLayout>
 *     ...
 *   </InstitutionalLayout>
 * </body>
 */
export function SkipLinks() {
  return (
    <div
      className="skip-links"
      role="navigation"
      aria-label="Saltar navegación">
      <SkipLink targetId="main-content">Saltar al contenido principal</SkipLink>
      <SkipLink targetId="main-nav">Saltar a navegación principal</SkipLink>
    </div>
  );
}

export default SkipLink;

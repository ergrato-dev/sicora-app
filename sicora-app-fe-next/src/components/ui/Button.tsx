'use client';

import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { buttonVariants } from './button-variants';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Muestra spinner de carga y deshabilita el botón */
  loading?: boolean;
  /** Icono a mostrar a la izquierda del texto */
  leftIcon?: React.ReactNode;
  /** Icono a mostrar a la derecha del texto */
  rightIcon?: React.ReactNode;
  /**
   * aria-label para botones sin texto visible (ej: solo icono)
   * WCAG 2.1 - 1.1.1 Text Alternatives
   */
  ariaLabel?: string;
  /**
   * Texto para lectores de pantalla durante estado loading
   * @default 'Cargando...'
   */
  loadingText?: string;
}

/**
 * Componente Button accesible según WCAG 2.1/2.2 Level AA
 *
 * Características de accesibilidad:
 * - Focus visible con ring de alto contraste (WCAG 2.4.7)
 * - Estados disabled claramente identificables (WCAG 1.4.11)
 * - Soporte para aria-label en botones solo icono
 * - Anuncio de estado loading para screen readers
 * - Contraste de color cumple ratio 4.5:1 (WCAG 1.4.3)
 *
 * @example
 * // Botón primario (acción principal - posicionar a la derecha)
 * <Button variant="primary">Guardar</Button>
 *
 * @example
 * // Botón secundario (acción secundaria - posicionar a la izquierda)
 * <Button variant="outline">Cancelar</Button>
 *
 * @example
 * // Botón solo icono con aria-label
 * <Button variant="ghost" size="icon" ariaLabel="Cerrar menú">
 *   <XIcon />
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ariaLabel,
      loadingText = 'Cargando...',
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...props}>
        {loading && (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">{loadingText}</span>
          </>
        )}

        {leftIcon && !loading && (
          <span
            className="mr-2 flex items-center"
            aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {children}

        {rightIcon && (
          <span
            className="ml-2 flex items-center"
            aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

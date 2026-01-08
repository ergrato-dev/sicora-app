import { cva } from 'class-variance-authority';

/**
 * Button Variants - Sistema de estilos accesible WCAG 2.1 AA
 *
 * Patrón UX de botones:
 * - primary: Acción principal (CTA) → Posicionar a la DERECHA, máximo peso visual
 * - outline: Acción secundaria → Posicionar a la IZQUIERDA, peso visual bajo
 * - ghost: Acción terciaria → Mínimo peso visual
 * - danger: Confirmación destructiva → Peso visual alto (rojo)
 *
 * Accesibilidad:
 * - Focus visible con ring de alto contraste (WCAG 2.4.7)
 * - Estados disabled claramente identificables (WCAG 1.4.11)
 * - Contraste de color cumple ratio 4.5:1 (WCAG 1.4.3)
 */
export const buttonVariants = cva(
  // Base classes con focus visible para navegación por teclado (WCAG 2.4.7)
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // ═══════════════════════════════════════════════════════════════
        // BOTONES PRIMARIOS - Alta prioridad visual (FILLED)
        // Usar para: CTAs, acciones principales, confirmaciones positivas
        // Posición recomendada: DERECHA en grupos de botones
        // ═══════════════════════════════════════════════════════════════
        primary: 'bg-sena-primary hover:bg-sena-primary/90 text-white shadow-sm',
        secondary: 'bg-sena-secondary hover:bg-sena-secondary/90 text-white shadow-sm',
        tertiary: 'bg-sena-tertiary hover:bg-sena-tertiary/90 text-white shadow-sm',

        // ═══════════════════════════════════════════════════════════════
        // BOTONES DE CONTEXTO - Para estados específicos
        // ═══════════════════════════════════════════════════════════════
        success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
        /**
         * Botón destructivo - SOLO para acciones irreversibles
         * Posición: DERECHA en confirmaciones de eliminación
         */
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',

        // ═══════════════════════════════════════════════════════════════
        // BOTONES SECUNDARIOS - Baja prioridad visual (OUTLINE/GHOST)
        // Usar para: Cancelar, cerrar, acciones secundarias
        // Posición recomendada: IZQUIERDA en grupos de botones
        // ═══════════════════════════════════════════════════════════════
        /**
         * Botón outline - Para acciones secundarias
         * Visualmente más ligero que primary (solo borde)
         */
        outline:
          'border-2 border-sena-primary text-sena-primary bg-transparent hover:bg-sena-primary hover:text-white',
        /**
         * Botón ghost - Para acciones terciarias o navegación
         * Mínimo peso visual
         */
        ghost: 'hover:bg-sena-light text-sena-primary bg-transparent',
        link: 'text-sena-primary underline-offset-4 hover:underline bg-transparent',

        // ═══════════════════════════════════════════════════════════════
        // BOTONES NEUTROS - Para interfaces secundarias
        // ═══════════════════════════════════════════════════════════════
        default: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
        muted: 'bg-gray-50 hover:bg-gray-100 text-gray-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-8 text-base',
        xl: 'h-14 rounded-lg px-10 text-base',
        /** Tamaño para botones solo icono - requiere aria-label */
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

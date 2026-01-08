/**
 * SICORA - Estilos CVA para Calendario Académico
 *
 * Este archivo define todas las variantes de estilo usando class-variance-authority
 * para los componentes del calendario de horarios académicos.
 *
 * @fileoverview Variantes de estilo CVA para Calendar
 * @module components/ui/Calendar/calendar-variants
 */

import { cva } from 'class-variance-authority';

/* =============================================================================
   CALENDARIO CONTAINER
   ============================================================================= */

/**
 * Contenedor principal del calendario
 */
export const calendarContainerVariants = cva(
  [
    // Base
    'relative flex flex-col overflow-hidden',
    'bg-white dark:bg-gray-900',
    'border border-gray-200 dark:border-gray-700',
    'rounded-lg shadow-sm',
  ],
  {
    variants: {
      fullHeight: {
        true: 'h-full min-h-[600px]',
        false: 'h-auto',
      },
      loading: {
        true: 'opacity-75 pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      fullHeight: true,
      loading: false,
    },
  }
);

/* =============================================================================
   HEADER DEL CALENDARIO
   ============================================================================= */

/**
 * Header del calendario con navegación y controles
 */
export const calendarHeaderVariants = cva(
  [
    'flex items-center justify-between',
    'px-4 py-3',
    'border-b border-gray-200 dark:border-gray-700',
    'bg-gray-50 dark:bg-gray-800/50',
  ],
  {
    variants: {
      sticky: {
        true: 'sticky top-0 z-20',
        false: '',
      },
    },
    defaultVariants: {
      sticky: true,
    },
  }
);

/**
 * Navegación temporal (anterior/hoy/siguiente)
 */
export const calendarNavigationVariants = cva(
  [
    'flex items-center gap-1',
    'rounded-lg',
    'bg-white dark:bg-gray-800',
    'border border-gray-200 dark:border-gray-700',
    'p-0.5',
  ],
  {
    variants: {
      size: {
        sm: 'gap-0.5 p-0.5',
        md: 'gap-1 p-1',
        lg: 'gap-2 p-1.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/**
 * Botón de navegación
 */
export const calendarNavButtonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-md',
    'font-medium',
    'transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-primary/50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        default: [
          'text-gray-600 dark:text-gray-400',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          'active:bg-gray-200 dark:active:bg-gray-600',
        ],
        primary: [
          'bg-primary text-white',
          'hover:bg-primary/90',
          'active:bg-primary/80',
        ],
        outline: [
          'border border-gray-300 dark:border-gray-600',
          'text-gray-700 dark:text-gray-300',
          'hover:bg-gray-50 dark:hover:bg-gray-800',
        ],
      },
      size: {
        sm: 'h-7 w-7 text-sm',
        md: 'h-8 w-8 text-sm',
        lg: 'h-9 w-9 text-base',
      },
      active: {
        true: 'bg-primary text-white hover:bg-primary/90',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      active: false,
    },
  }
);

/**
 * Selector de vista (día/semana/mes)
 */
export const viewSelectorVariants = cva(
  [
    'inline-flex items-center',
    'rounded-lg',
    'bg-gray-100 dark:bg-gray-800',
    'p-0.5',
  ],
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/**
 * Botón del selector de vista
 */
export const viewSelectorButtonVariants = cva(
  [
    'px-3 py-1.5',
    'rounded-md',
    'font-medium',
    'transition-all duration-150',
    'focus:outline-none focus:ring-2 focus:ring-primary/50',
  ],
  {
    variants: {
      active: {
        true: [
          'bg-white dark:bg-gray-700',
          'text-gray-900 dark:text-white',
          'shadow-sm',
        ],
        false: [
          'text-gray-600 dark:text-gray-400',
          'hover:text-gray-900 dark:hover:text-white',
        ],
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

/* =============================================================================
   GRILLA DEL CALENDARIO
   ============================================================================= */

/**
 * Contenedor de la grilla
 */
export const calendarGridContainerVariants = cva(['flex-1 overflow-auto'], {
  variants: {
    view: {
      day: 'flex flex-col',
      week: 'flex flex-col',
      month: 'flex flex-col',
    },
  },
  defaultVariants: {
    view: 'week',
  },
});

/**
 * Header de la grilla (días de la semana)
 */
export const gridHeaderVariants = cva(
  [
    'grid',
    'border-b border-gray-200 dark:border-gray-700',
    'bg-gray-50 dark:bg-gray-800/30',
    'sticky top-0 z-10',
  ],
  {
    variants: {
      columns: {
        1: 'grid-cols-[60px_1fr]',
        6: 'grid-cols-[60px_repeat(6,1fr)]',
        7: 'grid-cols-[60px_repeat(7,1fr)]',
      },
    },
    defaultVariants: {
      columns: 6,
    },
  }
);

/**
 * Celda del header (nombre del día)
 */
export const gridHeaderCellVariants = cva(
  [
    'flex flex-col items-center justify-center',
    'py-2 px-1',
    'text-center',
    'border-l border-gray-200 dark:border-gray-700',
    'first:border-l-0',
  ],
  {
    variants: {
      isToday: {
        true: 'bg-primary/10',
        false: '',
      },
      isWeekend: {
        true: 'bg-gray-100/50 dark:bg-gray-800/50',
        false: '',
      },
    },
    defaultVariants: {
      isToday: false,
      isWeekend: false,
    },
  }
);

/**
 * Número del día en el header
 */
export const dayNumberVariants = cva(
  [
    'w-8 h-8',
    'flex items-center justify-center',
    'rounded-full',
    'text-sm font-semibold',
    'transition-colors duration-150',
  ],
  {
    variants: {
      isToday: {
        true: 'bg-primary text-white',
        false: 'text-gray-900 dark:text-gray-100',
      },
      isSelected: {
        true: 'ring-2 ring-primary ring-offset-2',
        false: '',
      },
    },
    defaultVariants: {
      isToday: false,
      isSelected: false,
    },
  }
);

/**
 * Cuerpo de la grilla horaria
 */
export const gridBodyVariants = cva(['grid relative'], {
  variants: {
    columns: {
      1: 'grid-cols-[60px_1fr]',
      6: 'grid-cols-[60px_repeat(6,1fr)]',
      7: 'grid-cols-[60px_repeat(7,1fr)]',
    },
  },
  defaultVariants: {
    columns: 6,
  },
});

/**
 * Columna de horas (eje Y)
 */
export const timeColumnVariants = cva([
  'sticky left-0 z-10',
  'bg-white dark:bg-gray-900',
  'border-r border-gray-200 dark:border-gray-700',
]);

/**
 * Celda de hora
 */
export const timeSlotLabelVariants = cva([
  'flex items-start justify-end',
  'pr-2 pt-0',
  'text-xs font-medium',
  'text-gray-500 dark:text-gray-400',
  '-mt-2', // Offset para alinear con la línea
]);

/**
 * Fila horaria
 */
export const hourRowVariants = cva(
  ['border-t border-gray-200 dark:border-gray-700', 'first:border-t-0'],
  {
    variants: {
      density: {
        compact: 'h-10',
        comfortable: 'h-14',
        spacious: 'h-20',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  }
);

/**
 * Celda del día (contenedor de clases)
 */
export const dayCellVariants = cva(
  [
    'relative',
    'border-l border-gray-200 dark:border-gray-700',
    'transition-colors duration-150',
  ],
  {
    variants: {
      isToday: {
        true: 'bg-primary/5',
        false: '',
      },
      isWeekend: {
        true: 'bg-gray-50 dark:bg-gray-800/30',
        false: '',
      },
      isDropTarget: {
        true: 'bg-primary/10 ring-2 ring-primary ring-inset',
        false: '',
      },
      isSelecting: {
        true: 'bg-blue-100/50 dark:bg-blue-900/30',
        false: '',
      },
    },
    defaultVariants: {
      isToday: false,
      isWeekend: false,
      isDropTarget: false,
      isSelecting: false,
    },
  }
);

/* =============================================================================
   BLOQUE DE CLASE
   ============================================================================= */

/**
 * Bloque de clase programada
 */
export const classBlockVariants = cva(
  [
    'absolute inset-x-1',
    'rounded-md',
    'border-l-4',
    'shadow-sm',
    'overflow-hidden',
    'cursor-pointer',
    'transition-all duration-150',
    'hover:shadow-md hover:z-10',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
    'group',
  ],
  {
    variants: {
      jornada: {
        manana: 'bg-blue-50 dark:bg-blue-900/30 border-blue-500',
        tarde: 'bg-orange-50 dark:bg-orange-900/30 border-orange-500',
        noche: 'bg-purple-50 dark:bg-purple-900/30 border-purple-500',
      },
      status: {
        nueva: 'ring-2 ring-blue-400 ring-offset-1',
        confirmada: '',
        pendiente: 'border-dashed opacity-80',
        conflicto: 'ring-2 ring-red-400 ring-offset-1 animate-pulse',
        bloqueada: 'opacity-60 cursor-not-allowed',
        cancelada: 'opacity-40 line-through',
      },
      selected: {
        true: 'ring-2 ring-primary ring-offset-2 shadow-lg z-20',
        false: '',
      },
      dragging: {
        true: 'opacity-50 scale-95 shadow-2xl z-50',
        false: '',
      },
      size: {
        compact: 'text-xs',
        comfortable: 'text-sm',
        spacious: 'text-sm',
      },
    },
    defaultVariants: {
      jornada: 'manana',
      status: 'confirmada',
      selected: false,
      dragging: false,
      size: 'comfortable',
    },
  }
);

/**
 * Contenido del bloque de clase
 */
export const classBlockContentVariants = cva(
  ['px-2 py-1 h-full flex flex-col justify-between overflow-hidden'],
  {
    variants: {
      size: {
        compact: 'gap-0',
        comfortable: 'gap-0.5',
        spacious: 'gap-1',
      },
    },
    defaultVariants: {
      size: 'comfortable',
    },
  }
);

/**
 * Título del bloque de clase
 */
export const classBlockTitleVariants = cva([
  'font-medium truncate',
  'text-gray-900 dark:text-white',
]);

/**
 * Subtítulo/info del bloque
 */
export const classBlockSubtitleVariants = cva([
  'text-xs truncate',
  'text-gray-600 dark:text-gray-400',
  'flex items-center gap-1',
]);

/**
 * Badge de estado en el bloque
 */
export const classBlockBadgeVariants = cva(
  [
    'absolute top-1 right-1',
    'px-1.5 py-0.5',
    'rounded text-xs font-medium',
    'opacity-0 group-hover:opacity-100',
    'transition-opacity duration-150',
  ],
  {
    variants: {
      status: {
        nueva: 'bg-blue-500 text-white',
        confirmada: 'bg-green-500 text-white',
        pendiente: 'bg-yellow-500 text-gray-900',
        conflicto: 'bg-red-500 text-white',
        bloqueada: 'bg-gray-500 text-white',
        cancelada: 'bg-red-700 text-white',
      },
    },
    defaultVariants: {
      status: 'confirmada',
    },
  }
);

/* =============================================================================
   INDICADOR DE HORA ACTUAL
   ============================================================================= */

/**
 * Línea indicadora de la hora actual
 */
export const currentTimeIndicatorVariants = cva([
  'absolute left-0 right-0 z-30',
  'pointer-events-none',
  'flex items-center',
]);

/**
 * Punto de la línea de hora actual
 */
export const currentTimeDotVariants = cva([
  'w-3 h-3',
  'rounded-full',
  'bg-red-500',
  '-ml-1.5',
  'shadow-sm',
]);

/**
 * Línea de la hora actual
 */
export const currentTimeLineVariants = cva(['flex-1 h-0.5', 'bg-red-500']);

/* =============================================================================
   SIDEBAR
   ============================================================================= */

/**
 * Sidebar del calendario
 */
export const calendarSidebarVariants = cva(
  [
    'flex flex-col',
    'border-l border-gray-200 dark:border-gray-700',
    'bg-gray-50 dark:bg-gray-800/50',
    'overflow-y-auto',
  ],
  {
    variants: {
      collapsed: {
        true: 'w-0 overflow-hidden',
        false: 'w-72',
      },
      position: {
        left: 'border-l-0 border-r',
        right: 'border-l border-r-0',
      },
    },
    defaultVariants: {
      collapsed: false,
      position: 'right',
    },
  }
);

/**
 * Sección del sidebar
 */
export const sidebarSectionVariants = cva([
  'p-4',
  'border-b border-gray-200 dark:border-gray-700',
  'last:border-b-0',
]);

/**
 * Título de sección del sidebar
 */
export const sidebarSectionTitleVariants = cva([
  'text-xs font-semibold uppercase tracking-wider',
  'text-gray-500 dark:text-gray-400',
  'mb-3',
]);

/* =============================================================================
   MINI CALENDARIO
   ============================================================================= */

/**
 * Mini calendario mensual
 */
export const miniCalendarVariants = cva([
  'w-full',
  'bg-white dark:bg-gray-800',
  'rounded-lg',
  'p-2',
]);

/**
 * Día del mini calendario
 */
export const miniCalendarDayVariants = cva(
  [
    'w-8 h-8',
    'flex items-center justify-center',
    'rounded-full',
    'text-sm',
    'cursor-pointer',
    'transition-colors duration-150',
  ],
  {
    variants: {
      isToday: {
        true: 'bg-primary text-white font-bold',
        false: '',
      },
      isSelected: {
        true: 'bg-primary/20 text-primary font-medium',
        false: '',
      },
      isCurrentMonth: {
        true: 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700',
        false: 'text-gray-400 dark:text-gray-600',
      },
      hasClasses: {
        true: 'font-bold',
        false: '',
      },
    },
    defaultVariants: {
      isToday: false,
      isSelected: false,
      isCurrentMonth: true,
      hasClasses: false,
    },
  }
);

/* =============================================================================
   ESTADÍSTICAS
   ============================================================================= */

/**
 * Card de estadística
 */
export const statCardVariants = cva([
  'rounded-lg',
  'p-3',
  'bg-white dark:bg-gray-800',
  'border border-gray-200 dark:border-gray-700',
]);

/**
 * Valor de estadística
 */
export const statValueVariants = cva([
  'text-2xl font-bold',
  'text-gray-900 dark:text-white',
]);

/**
 * Label de estadística
 */
export const statLabelVariants = cva([
  'text-xs',
  'text-gray-500 dark:text-gray-400',
  'uppercase tracking-wider',
]);

/* =============================================================================
   LEYENDA
   ============================================================================= */

/**
 * Contenedor de leyenda
 */
export const legendContainerVariants = cva(['flex flex-wrap gap-3']);

/**
 * Item de leyenda
 */
export const legendItemVariants = cva([
  'flex items-center gap-1.5',
  'text-xs',
  'text-gray-600 dark:text-gray-400',
]);

/**
 * Color de leyenda
 */
export const legendColorVariants = cva(['w-3 h-3 rounded-sm'], {
  variants: {
    jornada: {
      manana: 'bg-blue-500',
      tarde: 'bg-orange-500',
      noche: 'bg-purple-500',
    },
  },
  defaultVariants: {
    jornada: 'manana',
  },
});

/* =============================================================================
   PANEL DE DETALLES
   ============================================================================= */

/**
 * Panel de detalles de clase
 */
export const detailsPanelVariants = cva(
  [
    'fixed inset-y-0 right-0 z-50',
    'flex flex-col',
    'bg-white dark:bg-gray-900',
    'border-l border-gray-200 dark:border-gray-700',
    'shadow-xl',
    'transition-transform duration-300',
  ],
  {
    variants: {
      open: {
        true: 'translate-x-0',
        false: 'translate-x-full',
      },
      size: {
        sm: 'w-80',
        md: 'w-96',
        lg: 'w-[480px]',
      },
    },
    defaultVariants: {
      open: false,
      size: 'md',
    },
  }
);

/**
 * Header del panel de detalles
 */
export const detailsPanelHeaderVariants = cva([
  'flex items-center justify-between',
  'px-4 py-3',
  'border-b border-gray-200 dark:border-gray-700',
]);

/**
 * Contenido del panel de detalles
 */
export const detailsPanelContentVariants = cva([
  'flex-1 overflow-y-auto',
  'p-4',
]);

/**
 * Footer del panel de detalles
 */
export const detailsPanelFooterVariants = cva([
  'flex items-center justify-end gap-2',
  'px-4 py-3',
  'border-t border-gray-200 dark:border-gray-700',
  'bg-gray-50 dark:bg-gray-800/50',
]);

/* =============================================================================
   CONFLICTOS
   ============================================================================= */

/**
 * Banner de conflicto
 */
export const conflictBannerVariants = cva(
  ['flex items-start gap-3', 'p-3', 'rounded-lg', 'border'],
  {
    variants: {
      severity: {
        critical:
          'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800',
        warning:
          'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800',
        suggestion:
          'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800',
      },
    },
    defaultVariants: {
      severity: 'warning',
    },
  }
);

/**
 * Icono de conflicto
 */
export const conflictIconVariants = cva(['flex-shrink-0 w-5 h-5'], {
  variants: {
    severity: {
      critical: 'text-red-500',
      warning: 'text-orange-500',
      suggestion: 'text-yellow-500',
    },
  },
  defaultVariants: {
    severity: 'warning',
  },
});

/**
 * Texto de conflicto
 */
export const conflictTextVariants = cva(['text-sm'], {
  variants: {
    severity: {
      critical: 'text-red-800 dark:text-red-200',
      warning: 'text-orange-800 dark:text-orange-200',
      suggestion: 'text-yellow-800 dark:text-yellow-200',
    },
  },
  defaultVariants: {
    severity: 'warning',
  },
});

/* =============================================================================
   FILTROS
   ============================================================================= */

/**
 * Contenedor de filtros
 */
export const filtersContainerVariants = cva([
  'flex flex-wrap items-center gap-2',
]);

/**
 * Chip de filtro activo
 */
export const filterChipVariants = cva([
  'inline-flex items-center gap-1',
  'px-2 py-1',
  'rounded-full',
  'text-xs font-medium',
  'bg-primary/10 text-primary',
  'hover:bg-primary/20',
  'transition-colors duration-150',
]);

/* =============================================================================
   FORMULARIO WIZARD
   ============================================================================= */

/**
 * Indicador de pasos del wizard
 */
export const wizardStepsVariants = cva([
  'flex items-center justify-between',
  'mb-6',
]);

/**
 * Paso individual del wizard
 */
export const wizardStepVariants = cva(['flex items-center gap-2'], {
  variants: {
    status: {
      completed: 'text-green-600 dark:text-green-400',
      current: 'text-primary',
      upcoming: 'text-gray-400 dark:text-gray-600',
    },
  },
  defaultVariants: {
    status: 'upcoming',
  },
});

/**
 * Número del paso
 */
export const wizardStepNumberVariants = cva(
  [
    'w-8 h-8',
    'rounded-full',
    'flex items-center justify-center',
    'text-sm font-semibold',
    'transition-colors duration-150',
  ],
  {
    variants: {
      status: {
        completed: 'bg-green-500 text-white',
        current: 'bg-primary text-white',
        upcoming:
          'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
      },
    },
    defaultVariants: {
      status: 'upcoming',
    },
  }
);

/**
 * Línea conectora entre pasos
 */
export const wizardStepConnectorVariants = cva(['flex-1 h-0.5 mx-2'], {
  variants: {
    completed: {
      true: 'bg-green-500',
      false: 'bg-gray-200 dark:bg-gray-700',
    },
  },
  defaultVariants: {
    completed: false,
  },
});

/* =============================================================================
   VISTA MÓVIL
   ============================================================================= */

/**
 * Card de clase para vista móvil
 */
export const mobileClassCardVariants = cva(
  [
    'rounded-lg',
    'border-l-4',
    'p-3',
    'mb-2',
    'shadow-sm',
    'active:shadow-md',
    'transition-shadow duration-150',
  ],
  {
    variants: {
      jornada: {
        manana: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500',
        tarde: 'bg-orange-50 dark:bg-orange-900/20 border-orange-500',
        noche: 'bg-purple-50 dark:bg-purple-900/20 border-purple-500',
      },
    },
    defaultVariants: {
      jornada: 'manana',
    },
  }
);

/**
 * Header de día móvil
 */
export const mobileDayHeaderVariants = cva(
  [
    'sticky top-0 z-10',
    'px-4 py-2',
    'text-sm font-semibold',
    'bg-gray-100 dark:bg-gray-800',
    'border-b border-gray-200 dark:border-gray-700',
  ],
  {
    variants: {
      isToday: {
        true: 'bg-primary/10 text-primary',
        false: 'text-gray-700 dark:text-gray-300',
      },
    },
    defaultVariants: {
      isToday: false,
    },
  }
);

/* =============================================================================
   DRAG & DROP
   ============================================================================= */

/**
 * Preview de drag
 */
export const dragPreviewVariants = cva([
  'fixed pointer-events-none z-[100]',
  'opacity-80',
  'scale-105',
  'shadow-2xl',
  'rounded-lg',
]);

/**
 * Drop zone
 */
export const dropZoneVariants = cva(
  ['absolute inset-0', 'transition-colors duration-150'],
  {
    variants: {
      active: {
        true: 'bg-primary/20 ring-2 ring-primary ring-inset',
        false: '',
      },
      valid: {
        true: 'bg-green-100/50 dark:bg-green-900/20',
        false: 'bg-red-100/50 dark:bg-red-900/20',
      },
    },
    defaultVariants: {
      active: false,
      valid: true,
    },
  }
);

/* =============================================================================
   TOOLBAR
   ============================================================================= */

/**
 * Toolbar contextual
 */
export const toolbarVariants = cva([
  'flex items-center gap-2',
  'px-3 py-2',
  'rounded-lg',
  'bg-white dark:bg-gray-800',
  'border border-gray-200 dark:border-gray-700',
  'shadow-lg',
]);

/**
 * Botón de toolbar
 */
export const toolbarButtonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'p-2',
    'rounded-md',
    'text-gray-600 dark:text-gray-400',
    'hover:bg-gray-100 dark:hover:bg-gray-700',
    'hover:text-gray-900 dark:hover:text-white',
    'transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-primary/50',
  ],
  {
    variants: {
      active: {
        true: 'bg-gray-100 dark:bg-gray-700 text-primary',
        false: '',
      },
      destructive: {
        true: 'hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600',
        false: '',
      },
    },
    defaultVariants: {
      active: false,
      destructive: false,
    },
  }
);

/**
 * Separador de toolbar
 */
export const toolbarSeparatorVariants = cva([
  'w-px h-6',
  'bg-gray-200 dark:bg-gray-700',
]);

/* =============================================================================
   EXPORTS
   ============================================================================= */

export const calendarVariants = {
  container: calendarContainerVariants,
  header: calendarHeaderVariants,
  navigation: calendarNavigationVariants,
  navButton: calendarNavButtonVariants,
  viewSelector: viewSelectorVariants,
  viewSelectorButton: viewSelectorButtonVariants,
  gridContainer: calendarGridContainerVariants,
  gridHeader: gridHeaderVariants,
  gridHeaderCell: gridHeaderCellVariants,
  dayNumber: dayNumberVariants,
  gridBody: gridBodyVariants,
  timeColumn: timeColumnVariants,
  timeSlotLabel: timeSlotLabelVariants,
  hourRow: hourRowVariants,
  dayCell: dayCellVariants,
  classBlock: classBlockVariants,
  classBlockContent: classBlockContentVariants,
  classBlockTitle: classBlockTitleVariants,
  classBlockSubtitle: classBlockSubtitleVariants,
  classBlockBadge: classBlockBadgeVariants,
  currentTimeIndicator: currentTimeIndicatorVariants,
  currentTimeDot: currentTimeDotVariants,
  currentTimeLine: currentTimeLineVariants,
  sidebar: calendarSidebarVariants,
  sidebarSection: sidebarSectionVariants,
  sidebarSectionTitle: sidebarSectionTitleVariants,
  miniCalendar: miniCalendarVariants,
  miniCalendarDay: miniCalendarDayVariants,
  statCard: statCardVariants,
  statValue: statValueVariants,
  statLabel: statLabelVariants,
  legendContainer: legendContainerVariants,
  legendItem: legendItemVariants,
  legendColor: legendColorVariants,
  detailsPanel: detailsPanelVariants,
  detailsPanelHeader: detailsPanelHeaderVariants,
  detailsPanelContent: detailsPanelContentVariants,
  detailsPanelFooter: detailsPanelFooterVariants,
  conflictBanner: conflictBannerVariants,
  conflictIcon: conflictIconVariants,
  conflictText: conflictTextVariants,
  filtersContainer: filtersContainerVariants,
  filterChip: filterChipVariants,
  wizardSteps: wizardStepsVariants,
  wizardStep: wizardStepVariants,
  wizardStepNumber: wizardStepNumberVariants,
  wizardStepConnector: wizardStepConnectorVariants,
  mobileClassCard: mobileClassCardVariants,
  mobileDayHeader: mobileDayHeaderVariants,
  dragPreview: dragPreviewVariants,
  dropZone: dropZoneVariants,
  toolbar: toolbarVariants,
  toolbarButton: toolbarButtonVariants,
  toolbarSeparator: toolbarSeparatorVariants,
};

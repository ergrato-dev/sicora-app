/**
 * @fileoverview Variantes de estilo para el componente DataTable
 * @description Sistema de variantes con class-variance-authority para tablas configurables
 *
 * DENSIDAD:
 * - compact: Para dashboards con mucha información (altura fila: 32px)
 * - comfortable: Balance ideal para uso general (altura fila: 48px) [default]
 * - spacious: Mejor legibilidad, datos importantes (altura fila: 64px)
 *
 * PATRONES UX:
 * - Zebra striping: Mejora lectura en tablas largas
 * - Bordes: Define límites claros entre celdas
 * - Hover: Feedback visual al pasar sobre filas
 * - Selección: Resaltado claro de filas seleccionadas
 */

import { cva, type VariantProps } from 'class-variance-authority';

// ============================================================================
// CONTENEDOR PRINCIPAL
// ============================================================================

export const dataTableContainerVariants = cva(
  [
    'relative',
    'w-full',
    'overflow-hidden',
    'rounded-lg',
    'border',
    'border-gray-200',
    'dark:border-gray-700',
    'bg-white',
    'dark:bg-gray-900',
  ],
  {
    variants: {
      bordered: {
        true: 'border',
        false: 'border-0',
      },
    },
    defaultVariants: {
      bordered: true,
    },
  }
);

// ============================================================================
// WRAPPER CON SCROLL
// ============================================================================

export const dataTableScrollWrapperVariants = cva(['w-full', 'overflow-auto'], {
  variants: {
    hasMaxHeight: {
      true: 'max-h-[var(--table-max-height)]',
      false: '',
    },
  },
  defaultVariants: {
    hasMaxHeight: false,
  },
});

// ============================================================================
// TABLA PRINCIPAL
// ============================================================================

export const dataTableVariants = cva(
  [
    'w-full',
    'border-collapse',
    'text-left',
    'text-sm',
    'text-gray-700',
    'dark:text-gray-200',
  ],
  {
    variants: {
      density: {
        compact: '',
        comfortable: '',
        spacious: '',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  }
);

// ============================================================================
// HEADER (THEAD)
// ============================================================================

export const dataTableHeaderVariants = cva(
  [
    'bg-gray-50',
    'dark:bg-gray-800',
    'border-b',
    'border-gray-200',
    'dark:border-gray-700',
  ],
  {
    variants: {
      sticky: {
        true: 'sticky top-0 z-10',
        false: '',
      },
    },
    defaultVariants: {
      sticky: false,
    },
  }
);

// ============================================================================
// CELDA DE HEADER (TH)
// ============================================================================

export const dataTableHeaderCellVariants = cva(
  [
    'font-semibold',
    'text-gray-900',
    'dark:text-gray-100',
    'whitespace-nowrap',
    'select-none',
    'border-b',
    'border-gray-200',
    'dark:border-gray-700',
  ],
  {
    variants: {
      density: {
        compact: 'px-3 py-2 text-xs',
        comfortable: 'px-4 py-3 text-sm',
        spacious: 'px-6 py-4 text-sm',
      },
      sortable: {
        true: 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
        false: '',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      resizable: {
        true: 'relative',
        false: '',
      },
    },
    defaultVariants: {
      density: 'comfortable',
      sortable: false,
      align: 'left',
      resizable: false,
    },
  }
);

// ============================================================================
// CUERPO (TBODY)
// ============================================================================

export const dataTableBodyVariants = cva(
  ['divide-y', 'divide-gray-200', 'dark:divide-gray-700'],
  {
    variants: {
      striped: {
        true: '[&>tr:nth-child(even)]:bg-gray-50 dark:[&>tr:nth-child(even)]:bg-gray-800/50',
        false: '',
      },
    },
    defaultVariants: {
      striped: false,
    },
  }
);

// ============================================================================
// FILA (TR)
// ============================================================================

export const dataTableRowVariants = cva(
  ['transition-colors', 'hover:bg-gray-50', 'dark:hover:bg-gray-800/70'],
  {
    variants: {
      selected: {
        true: 'bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30',
        false: '',
      },
      clickable: {
        true: 'cursor-pointer',
        false: '',
      },
      editing: {
        true: 'bg-yellow-50 dark:bg-yellow-900/20',
        false: '',
      },
    },
    defaultVariants: {
      selected: false,
      clickable: false,
      editing: false,
    },
  }
);

// ============================================================================
// CELDA (TD)
// ============================================================================

export const dataTableCellVariants = cva(
  ['text-gray-700', 'dark:text-gray-300'],
  {
    variants: {
      density: {
        compact: 'px-3 py-1.5 text-xs',
        comfortable: 'px-4 py-3 text-sm',
        spacious: 'px-6 py-4 text-sm',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      truncate: {
        true: 'truncate max-w-[200px]',
        false: '',
      },
      editable: {
        true: 'cursor-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
        false: '',
      },
      editing: {
        true: 'p-0',
        false: '',
      },
    },
    defaultVariants: {
      density: 'comfortable',
      align: 'left',
      truncate: false,
      editable: false,
      editing: false,
    },
  }
);

// ============================================================================
// INDICADOR DE ORDENAMIENTO
// ============================================================================

export const sortIndicatorVariants = cva(
  ['inline-flex', 'items-center', 'justify-center', 'w-4', 'h-4', 'ml-1'],
  {
    variants: {
      active: {
        true: 'text-brand-600 dark:text-brand-400',
        false: 'text-gray-400 dark:text-gray-500',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

// ============================================================================
// CHECKBOX DE SELECCIÓN
// ============================================================================

export const selectionCheckboxVariants = cva(
  [
    'h-4',
    'w-4',
    'rounded',
    'border-gray-300',
    'dark:border-gray-600',
    'text-brand-600',
    'focus:ring-brand-500',
    'focus:ring-2',
    'focus:ring-offset-0',
    'cursor-pointer',
    'transition-colors',
  ],
  {
    variants: {
      indeterminate: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      indeterminate: false,
    },
  }
);

// ============================================================================
// TOOLBAR
// ============================================================================

export const dataTableToolbarVariants = cva(
  [
    'flex',
    'flex-wrap',
    'items-center',
    'gap-3',
    'p-4',
    'border-b',
    'border-gray-200',
    'dark:border-gray-700',
    'bg-white',
    'dark:bg-gray-900',
  ],
  {
    variants: {
      position: {
        top: '',
        bottom: 'border-t border-b-0',
      },
    },
    defaultVariants: {
      position: 'top',
    },
  }
);

// ============================================================================
// BÚSQUEDA GLOBAL
// ============================================================================

export const globalSearchVariants = cva([
  'flex',
  'items-center',
  'gap-2',
  'px-3',
  'py-2',
  'bg-gray-100',
  'dark:bg-gray-800',
  'rounded-lg',
  'border',
  'border-transparent',
  'focus-within:border-brand-500',
  'focus-within:ring-2',
  'focus-within:ring-brand-500/20',
  'transition-all',
  'min-w-[200px]',
  'max-w-[300px]',
]);

// ============================================================================
// CHIP DE FILTRO ACTIVO
// ============================================================================

export const filterChipVariants = cva(
  [
    'inline-flex',
    'items-center',
    'gap-1.5',
    'px-2.5',
    'py-1',
    'text-xs',
    'font-medium',
    'rounded-full',
    'transition-colors',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        active:
          'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
      },
    },
    defaultVariants: {
      variant: 'active',
    },
  }
);

// ============================================================================
// PAGINACIÓN
// ============================================================================

export const paginationContainerVariants = cva([
  'flex',
  'flex-wrap',
  'items-center',
  'justify-between',
  'gap-4',
  'p-4',
  'border-t',
  'border-gray-200',
  'dark:border-gray-700',
  'bg-white',
  'dark:bg-gray-900',
]);

export const paginationInfoVariants = cva([
  'text-sm',
  'text-gray-600',
  'dark:text-gray-400',
]);

export const paginationButtonVariants = cva(
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'border',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-brand-500',
    'focus:ring-offset-1',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-9 px-3 text-sm',
      },
      active: {
        true: 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700',
        false:
          'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      size: 'sm',
      active: false,
      disabled: false,
    },
  }
);

// ============================================================================
// ACCIONES DE FILA
// ============================================================================

export const rowActionsContainerVariants = cva([
  'flex',
  'items-center',
  'justify-end',
  'gap-1',
]);

export const rowActionButtonVariants = cva(
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'p-1.5',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-brand-500',
  ],
  {
    variants: {
      variant: {
        default:
          'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700',
        danger:
          'text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ============================================================================
// ESTADOS VACÍO Y ERROR
// ============================================================================

export const emptyStateVariants = cva([
  'flex',
  'flex-col',
  'items-center',
  'justify-center',
  'py-12',
  'px-6',
  'text-center',
]);

export const errorStateVariants = cva([
  'flex',
  'flex-col',
  'items-center',
  'justify-center',
  'py-12',
  'px-6',
  'text-center',
  'text-red-600',
  'dark:text-red-400',
]);

// ============================================================================
// SKELETON LOADING
// ============================================================================

export const skeletonRowVariants = cva(['animate-pulse'], {
  variants: {
    density: {
      compact: 'h-8',
      comfortable: 'h-12',
      spacious: 'h-16',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
});

export const skeletonCellVariants = cva([
  'bg-gray-200',
  'dark:bg-gray-700',
  'rounded',
]);

// ============================================================================
// RESIZE HANDLE
// ============================================================================

export const resizeHandleVariants = cva([
  'absolute',
  'right-0',
  'top-0',
  'h-full',
  'w-1',
  'cursor-col-resize',
  'bg-transparent',
  'hover:bg-brand-500',
  'active:bg-brand-600',
  'transition-colors',
]);

// ============================================================================
// EXPORTS DE TIPOS
// ============================================================================

export type DataTableContainerVariants = VariantProps<
  typeof dataTableContainerVariants
>;
export type DataTableVariants = VariantProps<typeof dataTableVariants>;
export type DataTableHeaderCellVariants = VariantProps<
  typeof dataTableHeaderCellVariants
>;
export type DataTableBodyVariants = VariantProps<typeof dataTableBodyVariants>;
export type DataTableRowVariants = VariantProps<typeof dataTableRowVariants>;
export type DataTableCellVariants = VariantProps<typeof dataTableCellVariants>;
export type PaginationButtonVariants = VariantProps<
  typeof paginationButtonVariants
>;
export type RowActionButtonVariants = VariantProps<
  typeof rowActionButtonVariants
>;

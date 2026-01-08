/**
 * Tipos para el componente DataTable configurable
 */

import type { ReactNode } from 'react';

// ============================================================================
// COLUMN DEFINITION
// ============================================================================

export interface ColumnDef<T> {
  /** Identificador único de la columna */
  id: string;
  /** Texto o componente del header */
  header: string | ReactNode;
  /** Clave del objeto para acceder al valor */
  accessorKey?: keyof T;
  /** Función para obtener el valor (alternativa a accessorKey) */
  accessorFn?: (row: T) => unknown;
  /** Renderizado personalizado de celda */
  cell?: (info: CellContext<T>) => ReactNode;
  /** Permite ordenar por esta columna */
  sortable?: boolean;
  /** Permite filtrar por esta columna */
  filterable?: boolean;
  /** Tipo de filtro */
  filterType?: FilterType;
  /** Opciones para filtro tipo select */
  filterOptions?: FilterOption[];
  /** Ancho de columna */
  width?: string | number;
  /** Ancho mínimo */
  minWidth?: string | number;
  /** Ancho máximo */
  maxWidth?: string | number;
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right';
  /** Visible por defecto */
  defaultVisible?: boolean;
  /** Se puede ocultar */
  hideable?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Clase CSS para header */
  headerClassName?: string;
}

export interface CellContext<T> {
  row: T;
  rowIndex: number;
  column: ColumnDef<T>;
  value: unknown;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginationConfig {
  /** Habilitar paginación */
  enabled: boolean;
  /** Opciones de tamaño de página */
  pageSizes?: number[];
  /** Tamaño de página por defecto */
  defaultPageSize?: number;
  /** Mostrar info de rango */
  showInfo?: boolean;
  /** Posición de la paginación */
  position?: 'top' | 'bottom' | 'both';
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ============================================================================
// SORTING
// ============================================================================

export interface SortConfig {
  /** Habilitar ordenación */
  enabled: boolean;
  /** Permitir ordenación múltiple */
  multi?: boolean;
  /** Ordenación por defecto */
  defaultSort?: SortState;
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// FILTERING
// ============================================================================

export type FilterType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'dateRange';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  /** ID de la columna */
  columnId: string;
  /** Tipo de filtro */
  type: FilterType;
  /** Placeholder del input */
  placeholder?: string;
  /** Opciones para select */
  options?: FilterOption[];
}

export interface ActiveFilter {
  columnId: string;
  type: FilterType;
  value: string | number | boolean | DateRange | null;
  operator?: FilterOperator;
}

export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

export interface DateRange {
  from: string | null;
  to: string | null;
}

// ============================================================================
// SELECTION
// ============================================================================

export interface SelectionConfig {
  /** Habilitar selección */
  enabled: boolean;
  /** Modo de selección */
  mode: 'single' | 'multiple';
  /** Mostrar select all en header */
  showSelectAll?: boolean;
}

export interface SelectionState {
  selectedIds: string[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

// ============================================================================
// ACTIONS
// ============================================================================

export interface RowAction<T> {
  /** Identificador único */
  id: string;
  /** Etiqueta de la acción */
  label: string;
  /** Icono de la acción */
  icon?: ReactNode;
  /** Handler de click */
  onClick: (row: T) => void;
  /** Es acción destructiva (rojo) */
  isDestructive?: boolean;
  /** Requiere confirmación */
  requireConfirmation?: boolean;
  /** Mensaje de confirmación */
  confirmMessage?: string;
  /** Condición de visibilidad */
  isVisible?: (row: T) => boolean;
  /** Condición de deshabilitado */
  isDisabled?: (row: T) => boolean;
}

export interface BulkAction<T> {
  /** Identificador único */
  id: string;
  /** Etiqueta de la acción */
  label: string;
  /** Icono de la acción */
  icon?: ReactNode;
  /** Handler de click */
  onClick: (selectedRows: T[]) => void;
  /** Es acción destructiva */
  isDestructive?: boolean;
  /** Requiere confirmación */
  requireConfirmation?: boolean;
  /** Mensaje de confirmación */
  confirmMessage?: string;
  /** Mínimo de filas seleccionadas */
  minSelection?: number;
}

// ============================================================================
// EXPORT
// ============================================================================

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportConfig {
  /** Habilitar exportación */
  enabled: boolean;
  /** Formatos disponibles */
  formats: ExportFormat[];
  /** Permitir exportar selección */
  exportSelection?: boolean;
  /** Permitir exportar todo */
  exportAll?: boolean;
  /** Handler de exportación */
  onExport?: (format: ExportFormat, data: unknown[], selectedOnly: boolean) => Promise<void>;
}

// ============================================================================
// VISUAL CONFIG
// ============================================================================

export type TableDensity = 'compact' | 'normal' | 'spacious';

export interface VisualConfig {
  /** Densidad de la tabla */
  density?: TableDensity;
  /** Header sticky */
  stickyHeader?: boolean;
  /** Altura máxima */
  maxHeight?: string | number;
  /** Filas con zebra striping */
  zebraStripes?: boolean;
  /** Bordes visibles */
  bordered?: boolean;
  /** Hover en filas */
  hoverable?: boolean;
}

// ============================================================================
// EMPTY & LOADING STATES
// ============================================================================

export interface EmptyStateConfig {
  /** Título */
  title?: string;
  /** Descripción */
  description?: string;
  /** Icono */
  icon?: ReactNode;
  /** Acción (botón) */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingConfig {
  /** Número de filas skeleton */
  skeletonRows?: number;
  /** Texto de carga */
  loadingText?: string;
}

// ============================================================================
// MAIN DATATABLE PROPS
// ============================================================================

export interface DataTableProps<T> {
  // ===== DATOS =====
  /** Array de datos a mostrar */
  data: T[];
  /** Definición de columnas */
  columns: ColumnDef<T>[];
  /** Campo clave para identificar filas */
  keyField: keyof T;

  // ===== PAGINACIÓN =====
  /** Configuración de paginación */
  pagination?: PaginationConfig;
  /** Total de items (para paginación server-side) */
  totalItems?: number;
  /** Página actual (controlada) */
  currentPage?: number;
  /** Handler de cambio de página */
  onPageChange?: (page: number) => void;
  /** Handler de cambio de tamaño de página */
  onPageSizeChange?: (size: number) => void;

  // ===== FILTROS =====
  /** Configuración de filtros por columna */
  filters?: FilterConfig[];
  /** Filtros activos (controlados) */
  activeFilters?: ActiveFilter[];
  /** Handler de cambio de filtros */
  onFilterChange?: (filters: ActiveFilter[]) => void;
  /** Habilitar búsqueda global */
  globalSearch?: boolean;
  /** Valor de búsqueda global (controlado) */
  searchValue?: string;
  /** Handler de búsqueda global */
  onSearch?: (query: string) => void;
  /** Placeholder de búsqueda */
  searchPlaceholder?: string;

  // ===== ORDENACIÓN =====
  /** Configuración de ordenación */
  sorting?: SortConfig;
  /** Estado de ordenación (controlado) */
  sortState?: SortState[];
  /** Handler de cambio de ordenación */
  onSortChange?: (sort: SortState[]) => void;

  // ===== SELECCIÓN =====
  /** Configuración de selección */
  selection?: SelectionConfig;
  /** IDs seleccionados (controlado) */
  selectedIds?: string[];
  /** Handler de cambio de selección */
  onSelectionChange?: (ids: string[]) => void;

  // ===== ACCIONES =====
  /** Acciones por fila */
  rowActions?: RowAction<T>[];
  /** Acciones masivas */
  bulkActions?: BulkAction<T>[];

  // ===== ESTADOS =====
  /** Estado de carga */
  isLoading?: boolean;
  /** Mensaje de error */
  error?: string | null;
  /** Handler de retry */
  onRetry?: () => void;
  /** Configuración de estado vacío */
  emptyState?: EmptyStateConfig;
  /** Configuración de carga */
  loadingConfig?: LoadingConfig;

  // ===== VISUAL =====
  /** Configuración visual */
  visual?: VisualConfig;

  // ===== EXPORTACIÓN =====
  /** Configuración de exportación */
  export?: ExportConfig;

  // ===== CONFIGURACIÓN COLUMNAS =====
  /** Permitir ocultar columnas */
  columnToggle?: boolean;
  /** Columnas visibles (controlado) */
  visibleColumns?: string[];
  /** Handler de cambio de columnas visibles */
  onVisibleColumnsChange?: (columns: string[]) => void;

  // ===== PERSONALIZACIÓN =====
  /** Clase CSS del contenedor */
  className?: string;
  /** Clase CSS del header */
  headerClassName?: string;
  /** Función para clase de fila */
  rowClassName?: (row: T, index: number) => string;
  /** Título de la tabla */
  title?: string;
  /** Descripción de la tabla */
  description?: string;
  /** Contenido extra en toolbar */
  toolbarExtra?: ReactNode;
}

// ============================================================================
// INTERNAL STATE
// ============================================================================

export interface DataTableState<T> {
  // Datos procesados
  processedData: T[];

  // Paginación
  pagination: PaginationState;

  // Ordenación
  sortState: SortState[];

  // Filtros
  activeFilters: ActiveFilter[];
  searchQuery: string;

  // Selección
  selection: SelectionState;

  // Columnas
  visibleColumns: string[];
  columnOrder: string[];

  // UI
  density: TableDensity;
  isFilterPanelOpen: boolean;
  isColumnConfigOpen: boolean;
}

// ============================================================================
// DENSITY STYLES
// ============================================================================

export const DENSITY_STYLES: Record<
  TableDensity,
  {
    rowHeight: string;
    cellPadding: string;
    fontSize: string;
  }
> = {
  compact: {
    rowHeight: 'h-9',
    cellPadding: 'px-3 py-2',
    fontSize: 'text-xs',
  },
  normal: {
    rowHeight: 'h-12',
    cellPadding: 'px-4 py-3',
    fontSize: 'text-sm',
  },
  spacious: {
    rowHeight: 'h-14',
    cellPadding: 'px-5 py-4',
    fontSize: 'text-sm',
  },
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;
export const DEFAULT_SKELETON_ROWS = 5;

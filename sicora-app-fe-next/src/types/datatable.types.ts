/**
 * @fileoverview Tipos TypeScript para el componente DataTable
 * @description Sistema de tipado completo para tablas configurables
 *
 * Guía de Elementos de UI/UX para Componente de Tabla/Grid Configurable
 * =====================================================================
 *
 * 📋 ELEMENTOS FUNDAMENTALES DE UI/UX
 *
 * 1. ESTRUCTURA VISUAL Y LAYOUT
 *    - Diseño responsive: Adaptable a móvil, tablet y desktop
 *    - Densidad configurable: Compact, comfortable, spacious
 *    - Sticky header: Cabecera fija al hacer scroll
 *    - Altura definida: Con scroll interno o paginación
 *    - Columnas redimensionables: Permitir ajustar ancho
 *    - Zebra striping: Filas alternadas para mejor lectura
 *
 * 2. PAGINACIÓN
 *    - Selector de items por página (10, 25, 50, 100)
 *    - Navegación: Primera, Anterior, Números, Siguiente, Última
 *    - Info de rango: "Mostrando 1-10 de 100"
 *    - Skeleton loading durante carga
 *    - Posición: Superior y/o inferior
 *
 * 3. FILTROS
 *    - Global search: Búsqueda rápida en todas las columnas
 *    - Filtros por columna: Específicos según tipo de dato
 *      • Text: Input con debounce
 *      • Number: Rangos (min-max)
 *      • Date: Date picker con rangos
 *      • Select: Dropdown con opciones
 *      • Boolean: Toggle/Checkbox
 *    - Filtros activos: Chips removibles mostrando filtros aplicados
 *    - Reset filters: Botón para limpiar todos
 *
 * 4. ORDENACIÓN
 *    - Indicadores visuales claros (↑↓)
 *    - Multi-column sorting (Shift + Click)
 *    - Estado: ASC, DESC, NONE
 *    - Persistencia del estado
 *
 * 5. SELECCION DE FILAS
 *    - Checkbox en primera columna
 *    - Select all en header
 *    - Acciones bulk sobre seleccionadas
 *    - Indicador de cantidad seleccionada
 *
 * 6. EDICION
 *    - Inline editing: Click en celda para editar
 *    - Modal o Drawer: Para edicion completa
 *    - Validacion en tiempo real
 *    - Estados: Saving, Error, Success
 *    - Cancelar y Guardar opciones claras
 *
 * 7. ACCIONES
 *    - Columna de acciones (Ver, Editar, Eliminar)
 *    - Dropdown menu para mas opciones
 *    - Confirmaciones para acciones destructivas
 *    - Tooltips descriptivos
 *
 * 8. ESTADOS Y FEEDBACK
 *    - Loading skeletons
 *    - Empty states con ilustracion y CTA
 *    - Error states con retry
 *    - Success notifications
 *    - Optimistic updates
 *
 * 9. EXPORTACION
 *    - Botones para CSV, Excel, PDF
 *    - Exportar seleccion o todo
 *    - Progreso de exportacion
 *
 * 10. CONFIGURACION
 *     - Show y Hide columns
 *     - Reordenar columnas (drag and drop)
 *     - Guardar preferencias del usuario
 *     - Tema claro y oscuro
 */

import type { ReactNode } from 'react';

// ============================================================================
// TIPOS BASE
// ============================================================================

/**
 * Identificador único para filas
 */
export type RowId = string | number;

/**
 * Densidad visual de la tabla
 * - compact: Filas de 32px, ideal para datos densos
 * - comfortable: Filas de 48px, balance ideal (default)
 * - spacious: Filas de 64px, mejor legibilidad
 */
export type TableDensity = 'compact' | 'comfortable' | 'spacious';

/**
 * Dirección de ordenamiento
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * Tipos de filtro soportados
 */
export type FilterType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'boolean'
  | 'dateRange'
  | 'numberRange';

/**
 * Estado de carga
 */
export type LoadingState = 'idle' | 'loading' | 'error' | 'success';

/**
 * Formato de exportación
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

// ============================================================================
// DEFINICIÓN DE COLUMNAS
// ============================================================================

/**
 * Opciones para filtros tipo select
 */
export interface SelectFilterOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

/**
 * Configuración de filtro por columna
 */
export interface ColumnFilter {
  /** Tipo de filtro */
  type: FilterType;
  /** Placeholder del input */
  placeholder?: string;
  /** Opciones para filtros select */
  options?: SelectFilterOption[];
  /** Valor mínimo para rangos numéricos */
  min?: number;
  /** Valor máximo para rangos numéricos */
  max?: number;
  /** Debounce en ms para filtros de texto (default: 300) */
  debounceMs?: number;
}

/**
 * Definición completa de una columna
 * @template TData - Tipo de datos de la fila
 */
export interface ColumnDef<TData = unknown> {
  /** Identificador único de la columna */
  id: string;
  /** Clave del objeto de datos (puede ser anidada: 'user.name') */
  accessorKey?: keyof TData | string;
  /** Función de acceso personalizada */
  accessorFn?: (row: TData) => unknown;
  /** Texto del header */
  header: string | ((props: { column: ColumnDef<TData> }) => ReactNode);
  /** Renderizado personalizado de celda */
  cell?: (props: { row: TData; value: unknown; rowIndex: number }) => ReactNode;
  /** Renderizado del footer */
  footer?:
    | string
    | ((props: { column: ColumnDef<TData>; rows: TData[] }) => ReactNode);

  // Configuración visual
  /** Ancho mínimo en px */
  minWidth?: number;
  /** Ancho máximo en px */
  maxWidth?: number;
  /** Ancho inicial en px o porcentaje */
  width?: number | string;
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right';
  /** Si la columna es sticky (fija al scroll) */
  sticky?: 'left' | 'right';

  // Comportamiento
  /** Si la columna es ordenable */
  sortable?: boolean;
  /** Función de ordenamiento personalizada */
  sortingFn?: (rowA: TData, rowB: TData, columnId: string) => number;
  /** Configuración de filtro */
  filter?: ColumnFilter;
  /** Si la columna es redimensionable */
  resizable?: boolean;
  /** Si la columna puede ocultarse */
  hideable?: boolean;
  /** Si la columna está visible por defecto */
  defaultVisible?: boolean;
  /** Si la celda es editable inline */
  editable?: boolean;
  /** Validación para edición inline */
  validate?: (value: unknown) => string | null;

  // Accesibilidad
  /** Descripción para lectores de pantalla */
  ariaLabel?: string;
  /** Cabecera abreviada para pantallas pequeñas */
  shortHeader?: string;
}

// ============================================================================
// ESTADO DE LA TABLA
// ============================================================================

/**
 * Estado de ordenamiento
 */
export interface SortingState {
  /** ID de la columna */
  columnId: string;
  /** Dirección */
  direction: SortDirection;
}

/**
 * Valor de filtro activo
 */
export interface FilterValue {
  /** ID de la columna */
  columnId: string;
  /** Tipo de filtro */
  type: FilterType;
  /** Valor del filtro */
  value: unknown;
  /** Para rangos: valor mínimo */
  min?: number | Date;
  /** Para rangos: valor máximo */
  max?: number | Date;
}

/**
 * Estado de paginación
 */
export interface PaginationState {
  /** Página actual (0-indexed) */
  pageIndex: number;
  /** Elementos por página */
  pageSize: number;
  /** Total de elementos */
  totalItems: number;
  /** Total de páginas */
  totalPages: number;
}

/**
 * Estado de selección
 */
export interface SelectionState {
  /** IDs de filas seleccionadas */
  selectedIds: Set<RowId>;
  /** Si todas las filas visibles están seleccionadas */
  allSelected: boolean;
  /** Si hay selección parcial (indeterminate) */
  indeterminate: boolean;
}

/**
 * Estado de edición inline
 */
export interface EditingState {
  /** ID de la fila en edición */
  rowId: RowId | null;
  /** ID de la columna en edición */
  columnId: string | null;
  /** Valor original antes de editar */
  originalValue: unknown;
  /** Valor actual en edición */
  currentValue: unknown;
  /** Estado de guardado */
  saveState: LoadingState;
  /** Error de validación */
  error: string | null;
}

/**
 * Preferencias del usuario
 */
export interface TablePreferences {
  /** Orden de columnas */
  columnOrder: string[];
  /** Columnas visibles */
  visibleColumns: string[];
  /** Anchos de columnas */
  columnWidths: Record<string, number>;
  /** Densidad seleccionada */
  density: TableDensity;
  /** Elementos por página preferido */
  pageSize: number;
}

/**
 * Estado completo de la tabla
 */
export interface TableState<TData = unknown> {
  /** Datos mostrados */
  data: TData[];
  /** Estado de carga */
  loadingState: LoadingState;
  /** Mensaje de error si aplica */
  error: string | null;
  /** Estado de ordenamiento (multi-column) */
  sorting: SortingState[];
  /** Filtros activos */
  filters: FilterValue[];
  /** Búsqueda global */
  globalFilter: string;
  /** Estado de paginación */
  pagination: PaginationState;
  /** Estado de selección */
  selection: SelectionState;
  /** Estado de edición */
  editing: EditingState;
  /** Preferencias del usuario */
  preferences: TablePreferences;
}

// ============================================================================
// ACCIONES Y CALLBACKS
// ============================================================================

/**
 * Acción de fila disponible
 */
export interface RowAction<TData = unknown> {
  /** Identificador único */
  id: string;
  /** Etiqueta visible */
  label: string;
  /** Ícono */
  icon?: ReactNode;
  /** Si es acción destructiva (requiere confirmación) */
  destructive?: boolean;
  /** Si está deshabilitada */
  disabled?: boolean | ((row: TData) => boolean);
  /** Tooltip */
  tooltip?: string;
  /** Handler */
  onClick: (row: TData) => void | Promise<void>;
  /** Si mostrar en dropdown o directamente */
  showInDropdown?: boolean;
}

/**
 * Acción masiva (bulk action)
 */
export interface BulkAction<TData = unknown> {
  /** Identificador único */
  id: string;
  /** Etiqueta visible */
  label: string;
  /** Ícono */
  icon?: ReactNode;
  /** Si es acción destructiva */
  destructive?: boolean;
  /** Mínimo de filas seleccionadas requerido */
  minSelected?: number;
  /** Máximo de filas seleccionadas permitido */
  maxSelected?: number;
  /** Handler */
  onClick: (selectedRows: TData[]) => void | Promise<void>;
}

/**
 * Callbacks de eventos de la tabla
 */
export interface TableCallbacks<TData = unknown> {
  /** Cuando cambia el ordenamiento */
  onSortingChange?: (sorting: SortingState[]) => void;
  /** Cuando cambian los filtros */
  onFiltersChange?: (filters: FilterValue[]) => void;
  /** Cuando cambia la búsqueda global */
  onGlobalFilterChange?: (value: string) => void;
  /** Cuando cambia la paginación */
  onPaginationChange?: (pagination: PaginationState) => void;
  /** Cuando cambia la selección */
  onSelectionChange?: (
    selection: SelectionState,
    selectedRows: TData[]
  ) => void;
  /** Cuando se hace click en una fila */
  onRowClick?: (row: TData, event: React.MouseEvent) => void;
  /** Cuando se hace doble click en una fila */
  onRowDoubleClick?: (row: TData, event: React.MouseEvent) => void;
  /** Cuando se guarda una edición inline */
  onCellEdit?: (
    rowId: RowId,
    columnId: string,
    value: unknown,
    originalValue: unknown
  ) => void | Promise<void>;
  /** Cuando cambian las preferencias */
  onPreferencesChange?: (preferences: TablePreferences) => void;
  /** Cuando se exporta */
  onExport?: (
    format: ExportFormat,
    selectedOnly: boolean
  ) => void | Promise<void>;
  /** Cuando se refresca la tabla */
  onRefresh?: () => void | Promise<void>;
}

// ============================================================================
// PROPS DEL COMPONENTE
// ============================================================================

/**
 * Configuración del empty state
 */
export interface EmptyStateConfig {
  /** Título */
  title: string;
  /** Descripción */
  description?: string;
  /** Ícono o ilustración */
  icon?: ReactNode;
  /** Acción principal (CTA) */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Configuración de paginación
 */
export interface PaginationConfig {
  /** Opciones de elementos por página */
  pageSizeOptions?: number[];
  /** Posición de la paginación */
  position?: 'top' | 'bottom' | 'both';
  /** Mostrar info de rango */
  showInfo?: boolean;
  /** Mostrar selector de página */
  showPageSelector?: boolean;
  /** Mostrar botones primera/última */
  showFirstLast?: boolean;
}

/**
 * Configuración de exportación
 */
export interface ExportConfig {
  /** Formatos habilitados */
  formats: ExportFormat[];
  /** Nombre del archivo (sin extensión) */
  filename?: string;
  /** Incluir headers */
  includeHeaders?: boolean;
  /** Columnas a exportar (por defecto todas visibles) */
  columns?: string[];
}

/**
 * Props principales del componente DataTable
 * @template TData - Tipo de datos de las filas
 */
export interface DataTableProps<TData = unknown> {
  // Datos y columnas
  /** Datos a mostrar */
  data: TData[];
  /** Definición de columnas */
  columns: ColumnDef<TData>[];
  /** Función para obtener el ID único de cada fila */
  getRowId: (row: TData) => RowId;

  // Estado de carga
  /** Si está cargando */
  isLoading?: boolean;
  /** Si hay error */
  error?: string | null;
  /** Callback para reintentar */
  onRetry?: () => void;

  // Configuración visual
  /** Densidad de la tabla */
  density?: TableDensity;
  /** Si mostrar zebra striping */
  striped?: boolean;
  /** Si mostrar bordes */
  bordered?: boolean;
  /** Si el header es sticky */
  stickyHeader?: boolean;
  /** Altura máxima (activa scroll interno) */
  maxHeight?: number | string;
  /** Clases CSS adicionales */
  className?: string;

  // Paginación
  /** Si habilitar paginación */
  paginated?: boolean;
  /** Configuración de paginación */
  paginationConfig?: PaginationConfig;
  /** Total de items (para server-side pagination) */
  totalItems?: number;
  /** Página inicial */
  initialPage?: number;
  /** Elementos por página inicial */
  initialPageSize?: number;

  // Ordenamiento
  /** Si habilitar ordenamiento */
  sortable?: boolean;
  /** Si permitir multi-column sorting */
  multiSort?: boolean;
  /** Ordenamiento inicial */
  initialSorting?: SortingState[];

  // Filtros
  /** Si habilitar búsqueda global */
  globalSearch?: boolean;
  /** Placeholder de búsqueda global */
  globalSearchPlaceholder?: string;
  /** Si mostrar filtros por columna */
  columnFilters?: boolean;

  // Selección
  /** Si habilitar selección de filas */
  selectable?: boolean;
  /** Modo de selección */
  selectionMode?: 'single' | 'multiple';
  /** Filas seleccionadas inicialmente */
  initialSelection?: RowId[];

  // Acciones
  /** Acciones por fila */
  rowActions?: RowAction<TData>[];
  /** Acciones masivas */
  bulkActions?: BulkAction<TData>[];

  // Edición
  /** Si habilitar edición inline */
  editable?: boolean;

  // Configuración
  /** Si mostrar controles de configuración */
  configurable?: boolean;
  /** Preferencias iniciales */
  initialPreferences?: Partial<TablePreferences>;
  /** Key para persistir preferencias en localStorage */
  preferencesKey?: string;

  // Exportación
  /** Configuración de exportación */
  exportConfig?: ExportConfig;

  // Empty state
  /** Configuración del empty state */
  emptyState?: EmptyStateConfig;

  // Server-side
  /** Si usar paginación/filtros server-side */
  serverSide?: boolean;
  /** Callback para fetch de datos server-side */
  onFetchData?: (params: {
    pagination: PaginationState;
    sorting: SortingState[];
    filters: FilterValue[];
    globalFilter: string;
  }) => void | Promise<void>;

  // Callbacks
  /** Callbacks de eventos */
  callbacks?: TableCallbacks<TData>;

  // Accesibilidad
  /** Título de la tabla para screen readers */
  ariaLabel?: string;
  /** Descripción de la tabla */
  ariaDescription?: string;

  // Toolbar personalizado
  /** Contenido adicional en el toolbar izquierdo */
  toolbarLeft?: ReactNode;
  /** Contenido adicional en el toolbar derecho */
  toolbarRight?: ReactNode;
}

// ============================================================================
// HOOKS Y CONTEXTO
// ============================================================================

/**
 * Valor del contexto de la tabla
 */
export interface DataTableContextValue<TData = unknown> {
  /** Estado actual */
  state: TableState<TData>;
  /** Columnas configuradas */
  columns: ColumnDef<TData>[];
  /** Props del componente */
  props: DataTableProps<TData>;
  /** Datos procesados (filtrados, ordenados, paginados) */
  processedData: TData[];
  /** Filas seleccionadas */
  selectedRows: TData[];
  /** Columnas visibles ordenadas */
  visibleColumns: ColumnDef<TData>[];
  /** Si hay filtros activos */
  hasActiveFilters: boolean;
  /** Si hay selección */
  hasSelection: boolean;

  // Acciones de estado
  /** Establecer ordenamiento */
  setSorting: (sorting: SortingState[]) => void;
  /** Toggle ordenamiento de columna */
  toggleSort: (columnId: string, multiSort?: boolean) => void;
  /** Establecer filtros */
  setFilters: (filters: FilterValue[]) => void;
  /** Actualizar un filtro */
  updateFilter: (columnId: string, value: unknown) => void;
  /** Eliminar un filtro */
  removeFilter: (columnId: string) => void;
  /** Limpiar todos los filtros */
  clearFilters: () => void;
  /** Establecer búsqueda global */
  setGlobalFilter: (value: string) => void;
  /** Ir a página */
  goToPage: (page: number) => void;
  /** Cambiar elementos por página */
  setPageSize: (size: number) => void;
  /** Toggle selección de fila */
  toggleRowSelection: (rowId: RowId) => void;
  /** Seleccionar/deseleccionar todas */
  toggleAllSelection: () => void;
  /** Limpiar selección */
  clearSelection: () => void;
  /** Iniciar edición de celda */
  startEditing: (rowId: RowId, columnId: string) => void;
  /** Cancelar edición */
  cancelEditing: () => void;
  /** Guardar edición */
  saveEditing: () => Promise<void>;
  /** Actualizar valor en edición */
  updateEditingValue: (value: unknown) => void;
  /** Actualizar preferencias */
  updatePreferences: (preferences: Partial<TablePreferences>) => void;
}

/**
 * Retorno del hook useDataTable (igual que DataTableContextValue)
 */
export type UseDataTableReturn<TData = unknown> = DataTableContextValue<TData>;

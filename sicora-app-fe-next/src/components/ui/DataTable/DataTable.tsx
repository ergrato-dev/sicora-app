'use client';

/**
 * @fileoverview Componente DataTable - Tabla configurable profesional
 * @description Componente de tabla con todas las funcionalidades de UI/UX
 *
 * @features
 * - Responsive (mobile, tablet, desktop)
 * - Densidad configurable (compact, comfortable, spacious)
 * - Sticky header con scroll interno
 * - Columnas redimensionables
 * - Zebra striping
 * - Paginacion completa
 * - Filtros globales y por columna
 * - Ordenamiento multi-columna
 * - Seleccion de filas con acciones bulk
 * - Edicion inline
 * - Exportacion (CSV, Excel, PDF)
 * - Preferencias persistentes
 * - Accesibilidad WCAG 2.1
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={userColumns}
 *   getRowId={(row) => row.id}
 *   paginated
 *   selectable
 *   globalSearch
 *   density="comfortable"
 * />
 * ```
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useId,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Settings2,
  Download,
  MoreHorizontal,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import { useDataTable } from '@/hooks/useDataTable';
import type {
  DataTableProps,
  DataTableContextValue,
  ColumnDef,
  SortDirection,
  RowId,
  TableDensity,
} from '@/types/datatable.types';

import {
  dataTableContainerVariants,
  dataTableScrollWrapperVariants,
  dataTableVariants,
  dataTableHeaderVariants,
  dataTableHeaderCellVariants,
  dataTableBodyVariants,
  dataTableRowVariants,
  dataTableCellVariants,
  sortIndicatorVariants,
  selectionCheckboxVariants,
  dataTableToolbarVariants,
  globalSearchVariants,
  filterChipVariants,
  paginationContainerVariants,
  paginationInfoVariants,
  paginationButtonVariants,
  rowActionsContainerVariants,
  rowActionButtonVariants,
  emptyStateVariants,
  errorStateVariants,
  skeletonRowVariants,
  skeletonCellVariants,
} from './datatable-variants';

import { Button } from '../Button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../Tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu';

// ============================================================================
// CONTEXTO
// ============================================================================

const DataTableContext = createContext<DataTableContextValue | null>(null);

function useDataTableContext<TData>(): DataTableContextValue<TData> {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error('DataTable components must be used within a DataTable');
  }
  return context as DataTableContextValue<TData>;
}

// ============================================================================
// SUB-COMPONENTES
// ============================================================================

/**
 * Indicador de ordenamiento
 */
function SortIndicator({
  direction,
  active,
}: {
  direction: SortDirection;
  active: boolean;
}) {
  return (
    <span className={cn(sortIndicatorVariants({ active }))}>
      {direction === 'asc' ? (
        <ChevronUp
          className="h-4 w-4"
          aria-hidden="true"
        />
      ) : direction === 'desc' ? (
        <ChevronDown
          className="h-4 w-4"
          aria-hidden="true"
        />
      ) : (
        <ChevronsUpDown
          className="h-4 w-4 opacity-50"
          aria-hidden="true"
        />
      )}
    </span>
  );
}

/**
 * Checkbox de seleccion
 */
function SelectionCheckbox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={cn(selectionCheckboxVariants({ indeterminate }))}
      aria-label={ariaLabel}
    />
  );
}

/**
 * Busqueda global
 */
function GlobalSearch<TData>({
  placeholder = 'Buscar...',
}: {
  placeholder?: string;
}) {
  const { state, setGlobalFilter } = useDataTableContext<TData>();
  const inputId = useId();
  const [localValue, setLocalValue] = React.useState(state.globalFilter);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalValue(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setGlobalFilter(value);
      }, 300);
    },
    [setGlobalFilter]
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    setGlobalFilter('');
  }, [setGlobalFilter]);

  return (
    <div className={cn(globalSearchVariants())}>
      <label
        htmlFor={inputId}
        className="sr-only">
        {placeholder}
      </label>
      <Search
        className="h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
      <input
        id={inputId}
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Limpiar busqueda">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Chips de filtros activos
 */
function ActiveFilters<TData>() {
  const { state, columns, removeFilter, clearFilters, hasActiveFilters } =
    useDataTableContext<TData>();

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400">Filtros:</span>
      <AnimatePresence>
        {state.filters.map((filter) => {
          const column = columns.find((c) => c.id === filter.columnId);
          const label =
            typeof column?.header === 'string'
              ? column.header
              : filter.columnId;

          return (
            <motion.span
              key={filter.columnId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(filterChipVariants({ variant: 'active' }))}>
              {label}: {String(filter.value)}
              <button
                type="button"
                onClick={() => removeFilter(filter.columnId)}
                className="ml-1 hover:text-red-500"
                aria-label={`Eliminar filtro ${label}`}>
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          );
        })}
      </AnimatePresence>
      <button
        type="button"
        onClick={clearFilters}
        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline">
        Limpiar todos
      </button>
    </div>
  );
}

/**
 * Toolbar superior
 */
function DataTableToolbar<TData>({
  showGlobalSearch,
  globalSearchPlaceholder,
  showBulkActions,
  showExport,
  showConfig,
  toolbarLeft,
  toolbarRight,
  onRefresh,
  onExport,
}: {
  showGlobalSearch?: boolean;
  globalSearchPlaceholder?: string;
  showBulkActions?: boolean;
  showExport?: boolean;
  showConfig?: boolean;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
}) {
  const { state, props, selectedRows, clearSelection, updatePreferences } =
    useDataTableContext<TData>();

  const bulkActions = (props as DataTableProps<TData>).bulkActions ?? [];
  const hasSelection = selectedRows.length > 0;

  return (
    <div className={cn(dataTableToolbarVariants({ position: 'top' }))}>
      {/* Lado izquierdo */}
      <div className="flex items-center gap-3 flex-1">
        {showGlobalSearch && (
          <GlobalSearch<TData> placeholder={globalSearchPlaceholder} />
        )}
        {toolbarLeft}
        <ActiveFilters<TData> />
      </div>

      {/* Centro - Acciones bulk cuando hay seleccion */}
      {showBulkActions && hasSelection && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
          <span className="text-sm text-brand-700 dark:text-brand-300">
            {selectedRows.length} seleccionado
            {selectedRows.length !== 1 ? 's' : ''}
          </span>
          {bulkActions.map((action) => (
            <Button
              key={action.id}
              variant={action.destructive ? 'danger' : 'outline'}
              size="sm"
              onClick={() => action.onClick(selectedRows)}
              disabled={
                (action.minSelected !== undefined &&
                  selectedRows.length < action.minSelected) ||
                (action.maxSelected !== undefined &&
                  selectedRows.length > action.maxSelected)
              }>
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </Button>
          ))}
          <button
            type="button"
            onClick={clearSelection}
            className="text-xs text-gray-500 hover:text-gray-700">
            Cancelar
          </button>
        </motion.div>
      )}

      {/* Lado derecho */}
      <div className="flex items-center gap-2">
        {toolbarRight}

        {onRefresh && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onRefresh}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                  aria-label="Actualizar tabla">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Actualizar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {showExport && onExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                aria-label="Exportar datos">
                <Download className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('csv')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('pdf')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {showConfig && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                aria-label="Configurar tabla">
                <Settings2 className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                Densidad
              </div>
              {(['compact', 'comfortable', 'spacious'] as TableDensity[]).map(
                (d) => (
                  <DropdownMenuItem
                    key={d}
                    onClick={() => updatePreferences({ density: d })}
                    className={
                      state.preferences.density === d
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : ''
                    }>
                    {d === 'compact' && 'Compacta'}
                    {d === 'comfortable' && 'Normal'}
                    {d === 'spacious' && 'Espaciosa'}
                  </DropdownMenuItem>
                )
              )}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                Columnas
              </div>
              {(props as DataTableProps<TData>).columns
                .filter((col) => col.hideable !== false)
                .map((col) => {
                  const isVisible = state.preferences.visibleColumns.includes(
                    col.id
                  );
                  const label =
                    typeof col.header === 'string' ? col.header : col.id;
                  return (
                    <DropdownMenuItem
                      key={col.id}
                      onClick={() => {
                        const newVisible = isVisible
                          ? state.preferences.visibleColumns.filter(
                              (id) => id !== col.id
                            )
                          : [...state.preferences.visibleColumns, col.id];
                        updatePreferences({ visibleColumns: newVisible });
                      }}>
                      <input
                        type="checkbox"
                        checked={isVisible}
                        readOnly
                        className="mr-2 h-4 w-4"
                      />
                      {label}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

/**
 * Paginacion
 */
function DataTablePagination<TData>({
  showInfo = true,
  showPageSelector = true,
  showFirstLast = true,
  pageSizeOptions = [10, 25, 50, 100],
}: {
  showInfo?: boolean;
  showPageSelector?: boolean;
  showFirstLast?: boolean;
  pageSizeOptions?: number[];
}) {
  const { state, goToPage, setPageSize } = useDataTableContext<TData>();
  const { pagination } = state;

  const startItem = pagination.pageIndex * pagination.pageSize + 1;
  const endItem = Math.min(
    startItem + pagination.pageSize - 1,
    pagination.totalItems
  );

  // Generar numeros de pagina a mostrar
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    const current = pagination.pageIndex;
    const total = pagination.totalPages;

    if (total <= maxVisible + 2) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      pages.push(0);

      let start = Math.max(1, current - 1);
      let end = Math.min(total - 2, current + 1);

      if (current <= 2) {
        end = Math.min(maxVisible - 1, total - 2);
      } else if (current >= total - 3) {
        start = Math.max(1, total - maxVisible);
      }

      if (start > 1) pages.push('ellipsis');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total - 2) pages.push('ellipsis');

      pages.push(total - 1);
    }

    return pages;
  }, [pagination.pageIndex, pagination.totalPages]);

  if (pagination.totalItems === 0) return null;

  return (
    <div className={cn(paginationContainerVariants())}>
      {/* Info de rango */}
      {showInfo && (
        <div className={cn(paginationInfoVariants())}>
          Mostrando <span className="font-medium">{startItem}</span> a{' '}
          <span className="font-medium">{endItem}</span> de{' '}
          <span className="font-medium">{pagination.totalItems}</span>{' '}
          resultados
        </div>
      )}

      {/* Selector de paginas y controles */}
      <div className="flex items-center gap-2">
        {/* Selector de items por pagina */}
        <select
          value={pagination.pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="h-9 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          aria-label="Elementos por pagina">
          {pageSizeOptions.map((size) => (
            <option
              key={size}
              value={size}>
              {size} por pagina
            </option>
          ))}
        </select>

        {/* Botones de navegacion */}
        <nav
          className="flex items-center gap-1"
          aria-label="Paginacion">
          {showFirstLast && (
            <button
              type="button"
              onClick={() => goToPage(0)}
              disabled={pagination.pageIndex === 0}
              className={cn(
                paginationButtonVariants({
                  size: 'sm',
                  disabled: pagination.pageIndex === 0,
                })
              )}
              aria-label="Primera pagina">
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => goToPage(pagination.pageIndex - 1)}
            disabled={pagination.pageIndex === 0}
            className={cn(
              paginationButtonVariants({
                size: 'sm',
                disabled: pagination.pageIndex === 0,
              })
            )}
            aria-label="Pagina anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>

          {showPageSelector &&
            pageNumbers.map((page, i) =>
              page === 'ellipsis' ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={cn(
                    paginationButtonVariants({
                      size: 'sm',
                      active: pagination.pageIndex === page,
                    })
                  )}
                  aria-label={`Pagina ${page + 1}`}
                  aria-current={
                    pagination.pageIndex === page ? 'page' : undefined
                  }>
                  {page + 1}
                </button>
              )
            )}

          <button
            type="button"
            onClick={() => goToPage(pagination.pageIndex + 1)}
            disabled={pagination.pageIndex >= pagination.totalPages - 1}
            className={cn(
              paginationButtonVariants({
                size: 'sm',
                disabled: pagination.pageIndex >= pagination.totalPages - 1,
              })
            )}
            aria-label="Pagina siguiente">
            <ChevronRight className="h-4 w-4" />
          </button>

          {showFirstLast && (
            <button
              type="button"
              onClick={() => goToPage(pagination.totalPages - 1)}
              disabled={pagination.pageIndex >= pagination.totalPages - 1}
              className={cn(
                paginationButtonVariants({
                  size: 'sm',
                  disabled: pagination.pageIndex >= pagination.totalPages - 1,
                })
              )}
              aria-label="Ultima pagina">
              <ChevronsRight className="h-4 w-4" />
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}

/**
 * Estado vacio
 */
function EmptyState({
  title = 'Sin datos',
  description = 'No hay datos para mostrar.',
  icon,
  action,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className={cn(emptyStateVariants())}>
      {icon ?? (
        <FileSpreadsheet className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {description}
      </p>
      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Estado de error
 */
function ErrorState({
  message = 'Error al cargar datos',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className={cn(errorStateVariants())}>
      <AlertCircle className="h-12 w-12 mb-4" />
      <h3 className="text-lg font-medium mb-1">Error</h3>
      <p className="text-sm mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      )}
    </div>
  );
}

/**
 * Skeleton de carga
 */
function LoadingSkeleton<TData>({ rowCount = 5 }: { rowCount?: number }) {
  const { visibleColumns, state } = useDataTableContext<TData>();
  const density = state.preferences.density;

  return (
    <tbody>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className={cn(skeletonRowVariants({ density }))}>
          {visibleColumns.map((col, colIndex) => (
            <td
              key={col.id}
              className={cn(dataTableCellVariants({ density }))}>
              <div
                className={cn(
                  skeletonCellVariants(),
                  'h-4',
                  colIndex === 0
                    ? 'w-24'
                    : colIndex === visibleColumns.length - 1
                    ? 'w-16'
                    : 'w-32'
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/**
 * Acciones de fila
 */
function RowActions<TData>({ row }: { row: TData }) {
  const { props } = useDataTableContext<TData>();
  const rowActions = (props as DataTableProps<TData>).rowActions ?? [];

  if (rowActions.length === 0) return null;

  const visibleActions = rowActions
    .filter((a) => !a.showInDropdown)
    .slice(0, 2);
  const dropdownActions = rowActions.filter(
    (a) => a.showInDropdown || rowActions.indexOf(a) >= 2
  );

  return (
    <div className={cn(rowActionsContainerVariants())}>
      {visibleActions.map((action) => {
        const isDisabled =
          typeof action.disabled === 'function'
            ? action.disabled(row)
            : action.disabled;

        return (
          <TooltipProvider key={action.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => action.onClick(row)}
                  disabled={isDisabled}
                  className={cn(
                    rowActionButtonVariants({
                      variant: action.destructive ? 'danger' : 'default',
                    }),
                    isDisabled && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label={action.label}>
                  {action.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent>{action.tooltip ?? action.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}

      {dropdownActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(rowActionButtonVariants({ variant: 'default' }))}
              aria-label="Mas acciones">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {dropdownActions.map((action, index) => {
              const isDisabled =
                typeof action.disabled === 'function'
                  ? action.disabled(row)
                  : action.disabled;

              return (
                <React.Fragment key={action.id}>
                  {action.destructive && index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => action.onClick(row)}
                    disabled={isDisabled}
                    className={
                      action.destructive
                        ? 'text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300'
                        : ''
                    }>
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente DataTable - Tabla configurable profesional
 *
 * @template TData - Tipo de datos de las filas
 */
function DataTableInner<TData>() {
  const {
    state,
    props,
    processedData,
    visibleColumns,
    toggleSort,
    toggleRowSelection,
    toggleAllSelection,
    startEditing,
  } = useDataTableContext<TData>();

  const tableProps = props as DataTableProps<TData>;
  const { pagination, selection, preferences, loadingState, error } = state;
  const density = preferences.density;

  // Handlers
  const handleHeaderClick = useCallback(
    (column: ColumnDef<TData>, event: React.MouseEvent) => {
      if (column.sortable !== false && tableProps.sortable !== false) {
        toggleSort(column.id, event.shiftKey);
      }
    },
    [toggleSort, tableProps.sortable]
  );

  const handleRowClick = useCallback(
    (row: TData, event: React.MouseEvent) => {
      tableProps.callbacks?.onRowClick?.(row, event);
    },
    [tableProps.callbacks]
  );

  const handleCellDoubleClick = useCallback(
    (rowId: RowId, columnId: string) => {
      if (tableProps.editable) {
        startEditing(rowId, columnId);
      }
    },
    [tableProps.editable, startEditing]
  );

  // Obtener direccion de ordenamiento de una columna
  const getSortDirection = (columnId: string): SortDirection => {
    const sort = state.sorting.find((s) => s.columnId === columnId);
    return sort?.direction ?? null;
  };

  return (
    <table
      className={cn(dataTableVariants({ density }))}
      role="grid"
      aria-label={tableProps.ariaLabel ?? 'Tabla de datos'}
      aria-describedby={tableProps.ariaDescription}
      aria-busy={loadingState === 'loading'}>
      <thead
        className={cn(
          dataTableHeaderVariants({ sticky: tableProps.stickyHeader })
        )}>
        <tr>
          {/* Columna de seleccion */}
          {tableProps.selectable && (
            <th
              className={cn(
                dataTableHeaderCellVariants({ density, align: 'center' }),
                'w-12'
              )}
              scope="col">
              <SelectionCheckbox
                checked={selection.allSelected}
                indeterminate={selection.indeterminate}
                onChange={toggleAllSelection}
                ariaLabel="Seleccionar todas las filas"
              />
            </th>
          )}

          {/* Columnas de datos */}
          {visibleColumns.map((column) => {
            const isSortable =
              column.sortable !== false && tableProps.sortable !== false;
            const sortDirection = getSortDirection(column.id);
            const headerLabel =
              typeof column.header === 'string'
                ? column.header
                : column.header({ column });

            return (
              <th
                key={column.id}
                className={cn(
                  dataTableHeaderCellVariants({
                    density,
                    sortable: isSortable,
                    align: column.align,
                    resizable: column.resizable,
                  })
                )}
                style={{
                  minWidth: column.minWidth,
                  maxWidth: column.maxWidth,
                  width: column.width,
                }}
                scope="col"
                aria-sort={
                  sortDirection === 'asc'
                    ? 'ascending'
                    : sortDirection === 'desc'
                    ? 'descending'
                    : undefined
                }
                onClick={
                  isSortable ? (e) => handleHeaderClick(column, e) : undefined
                }>
                <div className="flex items-center gap-1">
                  <span>{headerLabel}</span>
                  {isSortable && (
                    <SortIndicator
                      direction={sortDirection}
                      active={sortDirection !== null}
                    />
                  )}
                </div>
              </th>
            );
          })}

          {/* Columna de acciones */}
          {tableProps.rowActions && tableProps.rowActions.length > 0 && (
            <th
              className={cn(
                dataTableHeaderCellVariants({ density, align: 'right' }),
                'w-24'
              )}
              scope="col">
              <span className="sr-only">Acciones</span>
            </th>
          )}
        </tr>
      </thead>

      {/* Estados especiales */}
      {loadingState === 'loading' ? (
        <LoadingSkeleton<TData> rowCount={pagination.pageSize} />
      ) : loadingState === 'error' ? (
        <tbody>
          <tr>
            <td
              colSpan={
                visibleColumns.length +
                (tableProps.selectable ? 1 : 0) +
                (tableProps.rowActions?.length ? 1 : 0)
              }>
              <ErrorState
                message={error ?? undefined}
                onRetry={tableProps.onRetry}
              />
            </td>
          </tr>
        </tbody>
      ) : processedData.length === 0 ? (
        <tbody>
          <tr>
            <td
              colSpan={
                visibleColumns.length +
                (tableProps.selectable ? 1 : 0) +
                (tableProps.rowActions?.length ? 1 : 0)
              }>
              <EmptyState {...tableProps.emptyState} />
            </td>
          </tr>
        </tbody>
      ) : (
        <tbody
          className={cn(
            dataTableBodyVariants({ striped: tableProps.striped })
          )}>
          {processedData.map((row, rowIndex) => {
            const rowId = tableProps.getRowId(row);
            const isSelected = selection.selectedIds.has(rowId);

            return (
              <tr
                key={rowId}
                className={cn(
                  dataTableRowVariants({
                    selected: isSelected,
                    clickable: !!tableProps.callbacks?.onRowClick,
                  })
                )}
                onClick={(e) => handleRowClick(row, e)}
                role="row"
                aria-selected={isSelected}>
                {/* Celda de seleccion */}
                {tableProps.selectable && (
                  <td
                    className={cn(
                      dataTableCellVariants({ density, align: 'center' })
                    )}
                    onClick={(e) => e.stopPropagation()}>
                    <SelectionCheckbox
                      checked={isSelected}
                      onChange={() => toggleRowSelection(rowId)}
                      ariaLabel={`Seleccionar fila ${rowIndex + 1}`}
                    />
                  </td>
                )}

                {/* Celdas de datos */}
                {visibleColumns.map((column) => {
                  // Obtener valor
                  const value = column.accessorFn
                    ? column.accessorFn(row)
                    : column.accessorKey
                    ? (row as Record<string, unknown>)[
                        column.accessorKey as string
                      ]
                    : null;

                  // Renderizar celda
                  const cellContent = column.cell
                    ? column.cell({ row, value, rowIndex })
                    : value !== null && value !== undefined
                    ? String(value)
                    : '-';

                  return (
                    <td
                      key={column.id}
                      className={cn(
                        dataTableCellVariants({
                          density,
                          align: column.align,
                          editable: column.editable,
                        })
                      )}
                      style={{
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                        width: column.width,
                      }}
                      onDoubleClick={() =>
                        column.editable &&
                        handleCellDoubleClick(rowId, column.id)
                      }
                      role="gridcell">
                      {cellContent}
                    </td>
                  );
                })}

                {/* Celda de acciones */}
                {tableProps.rowActions && tableProps.rowActions.length > 0 && (
                  <td
                    className={cn(
                      dataTableCellVariants({ density, align: 'right' })
                    )}
                    onClick={(e) => e.stopPropagation()}>
                    <RowActions<TData> row={row} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      )}
    </table>
  );
}

/**
 * DataTable - Componente principal exportado
 */
export function DataTable<TData>(props: DataTableProps<TData>) {
  const tableState = useDataTable(props);

  // Contexto como unknown para evitar problemas de tipado
  const contextValue = tableState as unknown as DataTableContextValue;

  return (
    <DataTableContext.Provider value={contextValue}>
      <div
        className={cn(
          dataTableContainerVariants({ bordered: props.bordered }),
          props.className
        )}>
        {/* Toolbar */}
        <DataTableToolbar<TData>
          showGlobalSearch={props.globalSearch}
          globalSearchPlaceholder={props.globalSearchPlaceholder}
          showBulkActions={
            props.selectable && (props.bulkActions?.length ?? 0) > 0
          }
          showExport={!!props.exportConfig}
          showConfig={props.configurable}
          toolbarLeft={props.toolbarLeft}
          toolbarRight={props.toolbarRight}
          onRefresh={props.callbacks?.onRefresh}
          onExport={
            props.exportConfig
              ? (format) => props.callbacks?.onExport?.(format, false)
              : undefined
          }
        />

        {/* Tabla con scroll */}
        <div
          className={cn(
            dataTableScrollWrapperVariants({
              hasMaxHeight: !!props.maxHeight,
            })
          )}
          style={
            props.maxHeight
              ? {
                  ['--table-max-height' as string]:
                    typeof props.maxHeight === 'number'
                      ? `${props.maxHeight}px`
                      : props.maxHeight,
                }
              : undefined
          }>
          <DataTableInner<TData> />
        </div>

        {/* Paginacion */}
        {props.paginated && (
          <DataTablePagination<TData> {...props.paginationConfig} />
        )}
      </div>
    </DataTableContext.Provider>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { useDataTableContext };
export type { DataTableProps };

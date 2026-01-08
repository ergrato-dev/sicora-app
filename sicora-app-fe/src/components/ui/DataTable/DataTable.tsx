/**
 * DataTable - Componente de tabla configurable
 * Implementa todas las características de UI/UX documentadas
 */

import { useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
  X,
  Settings2,
  RefreshCw,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import type { DataTableProps, SortState, TableDensity } from '../../../types/datatable.types';

// Utility function for className merging
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Density styles
const densityStyles: Record<TableDensity, { row: string; cell: string; text: string }> = {
  compact: { row: 'h-9', cell: 'px-3 py-2', text: 'text-xs' },
  normal: { row: 'h-12', cell: 'px-4 py-3', text: 'text-sm' },
  spacious: { row: 'h-14', cell: 'px-5 py-4', text: 'text-sm' },
};

export function DataTable<T>({
  // Data
  data,
  columns,
  keyField,
  // Pagination
  pagination,
  totalItems,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  // Filters
  globalSearch,
  searchValue = '',
  onSearch,
  searchPlaceholder = 'Buscar...',
  activeFilters = [],
  onFilterChange,
  // Sorting
  sorting,
  sortState = [],
  onSortChange,
  // Selection
  selection,
  selectedIds = [],
  onSelectionChange,
  // Actions
  rowActions,
  // bulkActions - reserved for future use
  // States
  isLoading,
  error,
  onRetry,
  emptyState,
  loadingConfig,
  // Visual
  visual,
  // Export
  export: exportConfig,
  // Column config
  columnToggle,
  visibleColumns,
  // Customization
  className,
  headerClassName,
  rowClassName,
  title,
  description,
  toolbarExtra,
}: DataTableProps<T>) {
  const density = visual?.density || 'normal';
  const styles = densityStyles[density];
  const pageSize = pagination?.defaultPageSize || 25;
  const pageSizes = pagination?.pageSizes || [10, 25, 50, 100];
  const total = totalItems || data.length;
  const totalPages = Math.ceil(total / pageSize);

  // Visible columns
  const displayColumns = useMemo(() => {
    if (!visibleColumns || visibleColumns.length === 0) {
      return columns.filter((col) => col.defaultVisible !== false);
    }
    return columns.filter((col) => visibleColumns.includes(col.id));
  }, [columns, visibleColumns]);

  // Get sort state for column
  const getSortState = (columnId: string): 'asc' | 'desc' | null => {
    const sort = sortState.find((s) => s.column === columnId);
    return sort?.direction || null;
  };

  // Handle sort click
  const handleSort = (columnId: string) => {
    if (!sorting?.enabled || !onSortChange) return;

    const currentSort = getSortState(columnId);
    let newSortState: SortState[];

    if (currentSort === null) {
      newSortState = [{ column: columnId, direction: 'asc' }];
    } else if (currentSort === 'asc') {
      newSortState = [{ column: columnId, direction: 'desc' }];
    } else {
      newSortState = [];
    }

    onSortChange(newSortState);
  };

  // Handle row selection
  const handleRowSelect = (rowId: string) => {
    if (!selection?.enabled || !onSelectionChange) return;

    if (selection.mode === 'single') {
      onSelectionChange(selectedIds.includes(rowId) ? [] : [rowId]);
    } else {
      onSelectionChange(
        selectedIds.includes(rowId)
          ? selectedIds.filter((id) => id !== rowId)
          : [...selectedIds, rowId]
      );
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!selection?.enabled || !onSelectionChange) return;

    const allIds = data.map((row) => String((row as Record<string, unknown>)[keyField as string]));
    const allSelected = allIds.every((id) => selectedIds.includes(id));

    onSelectionChange(allSelected ? [] : allIds);
  };

  // Render sort icon
  const renderSortIcon = (columnId: string) => {
    const sortDirection = getSortState(columnId);

    if (sortDirection === 'asc') {
      return <ChevronUp className='h-4 w-4 text-primary' />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className='h-4 w-4 text-primary' />;
    }
    return <ChevronsUpDown className='h-4 w-4 text-muted-foreground opacity-50' />;
  };

  // Calculate pagination info
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Check selection state
  const allIds = data.map((row) => String((row as Record<string, unknown>)[keyField as string]));
  const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const isIndeterminate = selectedIds.some((id) => allIds.includes(id)) && !isAllSelected;

  return (
    <div className={cn('bg-card rounded-lg border border-border overflow-hidden', className)}>
      {/* Toolbar */}
      <div className='px-4 py-3 border-b border-border bg-muted/30'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          {/* Left side - Title & Search */}
          <div className='flex items-center gap-4 flex-1'>
            {(title || description) && (
              <div>
                {title && <h3 className='font-semibold text-foreground'>{title}</h3>}
                {description && <p className='text-sm text-muted-foreground'>{description}</p>}
              </div>
            )}

            {globalSearch && onSearch && (
              <div className='relative flex-1 max-w-sm'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <input
                  type='text'
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearch(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50'
                />
                {searchValue && (
                  <button
                    onClick={() => onSearch('')}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className='flex items-center gap-2'>
            {/* Selected count & bulk actions */}
            {selection?.enabled && selectedIds.length > 0 && (
              <span className='text-sm text-muted-foreground mr-2'>
                {selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}
              </span>
            )}

            {/* Refresh */}
            {onRetry && (
              <button
                onClick={onRetry}
                className='p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted'
                title='Actualizar'
              >
                <RefreshCw className='h-4 w-4' />
              </button>
            )}

            {/* Export */}
            {exportConfig?.enabled && (
              <div className='flex items-center gap-1'>
                {exportConfig.formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => exportConfig.onExport?.(format, data, selectedIds.length > 0)}
                    className='px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-input rounded hover:bg-muted'
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Column config */}
            {columnToggle && (
              <button
                className='p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted'
                title='Configurar columnas'
              >
                <Settings2 className='h-4 w-4' />
              </button>
            )}

            {/* Extra toolbar content */}
            {toolbarExtra}
          </div>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className='flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border'>
            <span className='text-xs text-muted-foreground'>Filtros:</span>
            {activeFilters.map((filter) => (
              <span
                key={filter.columnId}
                className='inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full'
              >
                {filter.columnId}: {String(filter.value)}
                <button
                  onClick={() =>
                    onFilterChange?.(activeFilters.filter((f) => f.columnId !== filter.columnId))
                  }
                  className='hover:text-primary/70'
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            ))}
            <button
              onClick={() => onFilterChange?.([])}
              className='text-xs text-muted-foreground hover:text-foreground'
            >
              Limpiar todos
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className={cn('overflow-auto', visual?.maxHeight ? `max-h-[${visual.maxHeight}]` : '')}>
        <table className='w-full'>
          <thead
            className={cn(
              'bg-muted/50',
              visual?.stickyHeader && 'sticky top-0 z-10',
              headerClassName
            )}
          >
            <tr>
              {/* Selection checkbox column */}
              {selection?.enabled && (
                <th className={cn('w-12', styles.cell)}>
                  {selection.showSelectAll && selection.mode === 'multiple' && (
                    <input
                      type='checkbox'
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={handleSelectAll}
                      className='h-4 w-4 rounded border-input'
                    />
                  )}
                </th>
              )}

              {/* Data columns */}
              {displayColumns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    styles.cell,
                    styles.text,
                    'text-left font-medium text-muted-foreground',
                    column.sortable && sorting?.enabled && 'cursor-pointer select-none',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.headerClassName
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className='flex items-center gap-1'>
                    <span>{column.header}</span>
                    {column.sortable && sorting?.enabled && renderSortIcon(column.id)}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              {rowActions && rowActions.length > 0 && (
                <th className={cn('w-20', styles.cell, styles.text, 'text-right')}>Acciones</th>
              )}
            </tr>
          </thead>

          <tbody>
            {/* Loading state */}
            {isLoading && (
              <>
                {Array.from({ length: loadingConfig?.skeletonRows || 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className='border-b border-border'>
                    {selection?.enabled && (
                      <td className={styles.cell}>
                        <div className='h-4 w-4 bg-muted rounded animate-pulse' />
                      </td>
                    )}
                    {displayColumns.map((col) => (
                      <td key={col.id} className={styles.cell}>
                        <div className='h-4 bg-muted rounded animate-pulse' />
                      </td>
                    ))}
                    {rowActions && (
                      <td className={styles.cell}>
                        <div className='h-4 w-8 bg-muted rounded animate-pulse ml-auto' />
                      </td>
                    )}
                  </tr>
                ))}
              </>
            )}

            {/* Error state */}
            {!isLoading && error && (
              <tr>
                <td
                  colSpan={
                    displayColumns.length + (selection?.enabled ? 1 : 0) + (rowActions ? 1 : 0)
                  }
                  className='py-12'
                >
                  <div className='flex flex-col items-center justify-center text-center'>
                    <AlertCircle className='h-12 w-12 text-destructive mb-4' />
                    <h3 className='font-semibold text-foreground mb-1'>Error al cargar datos</h3>
                    <p className='text-sm text-muted-foreground mb-4'>{error}</p>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className='px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90'
                      >
                        Reintentar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && !error && data.length === 0 && (
              <tr>
                <td
                  colSpan={
                    displayColumns.length + (selection?.enabled ? 1 : 0) + (rowActions ? 1 : 0)
                  }
                  className='py-12'
                >
                  <div className='flex flex-col items-center justify-center text-center'>
                    {emptyState?.icon || <Inbox className='h-12 w-12 text-muted-foreground mb-4' />}
                    <h3 className='font-semibold text-foreground mb-1'>
                      {emptyState?.title || 'Sin datos'}
                    </h3>
                    <p className='text-sm text-muted-foreground mb-4'>
                      {emptyState?.description || 'No hay registros para mostrar'}
                    </p>
                    {emptyState?.action && (
                      <button
                        onClick={emptyState.action.onClick}
                        className='px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90'
                      >
                        {emptyState.action.label}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!isLoading &&
              !error &&
              data.map((row, rowIndex) => {
                const rowId = String((row as Record<string, unknown>)[keyField as string]);
                const isSelected = selectedIds.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'border-b border-border transition-colors',
                      visual?.hoverable !== false && 'hover:bg-muted/50',
                      visual?.zebraStripes && rowIndex % 2 === 1 && 'bg-muted/30',
                      isSelected && 'bg-primary/5',
                      rowClassName?.(row, rowIndex)
                    )}
                  >
                    {/* Selection checkbox */}
                    {selection?.enabled && (
                      <td className={styles.cell}>
                        <input
                          type={selection.mode === 'single' ? 'radio' : 'checkbox'}
                          checked={isSelected}
                          onChange={() => handleRowSelect(rowId)}
                          className='h-4 w-4 rounded border-input'
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {displayColumns.map((column) => {
                      const value = column.accessorFn
                        ? column.accessorFn(row)
                        : column.accessorKey
                          ? (row as Record<string, unknown>)[column.accessorKey as string]
                          : null;

                      return (
                        <td
                          key={column.id}
                          className={cn(
                            styles.cell,
                            styles.text,
                            'text-foreground',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.className
                          )}
                        >
                          {column.cell
                            ? column.cell({ row, rowIndex, column, value })
                            : String(value ?? '')}
                        </td>
                      );
                    })}

                    {/* Actions */}
                    {rowActions && rowActions.length > 0 && (
                      <td className={cn(styles.cell, 'text-right')}>
                        <div className='flex items-center justify-end gap-1'>
                          {rowActions.slice(0, 2).map((action) => {
                            if (action.isVisible && !action.isVisible(row)) return null;
                            const isDisabled = action.isDisabled?.(row);

                            return (
                              <button
                                key={action.id}
                                onClick={() => {
                                  if (action.requireConfirmation) {
                                    if (window.confirm(action.confirmMessage || '¿Está seguro?')) {
                                      action.onClick(row);
                                    }
                                  } else {
                                    action.onClick(row);
                                  }
                                }}
                                disabled={isDisabled}
                                className={cn(
                                  'p-1.5 rounded hover:bg-muted',
                                  action.isDestructive
                                    ? 'text-destructive hover:text-destructive'
                                    : 'text-muted-foreground hover:text-foreground',
                                  isDisabled && 'opacity-50 cursor-not-allowed'
                                )}
                                title={action.label}
                              >
                                {action.icon || action.label}
                              </button>
                            );
                          })}
                          {rowActions.length > 2 && (
                            <button
                              className='p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted'
                              title='Más acciones'
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination?.enabled && (
        <div className='px-4 py-3 border-t border-border bg-muted/30'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
            {/* Page size selector */}
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Mostrar:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                className='px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50'
              >
                {pageSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Info */}
            {pagination.showInfo && (
              <span className='text-sm text-muted-foreground'>
                Mostrando {startItem}-{endItem} de {total} registros
              </span>
            )}

            {/* Navigation */}
            <div className='flex items-center gap-1'>
              <button
                onClick={() => onPageChange?.(1)}
                disabled={currentPage === 1}
                className='p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
                title='Primera página'
              >
                <ChevronsLeft className='h-4 w-4' />
              </button>
              <button
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
                className='p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
                title='Anterior'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={cn(
                      'px-3 py-1 text-sm rounded',
                      currentPage === pageNum
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
                title='Siguiente'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
              <button
                onClick={() => onPageChange?.(totalPages)}
                disabled={currentPage === totalPages}
                className='p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed'
                title='Última página'
              >
                <ChevronsRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

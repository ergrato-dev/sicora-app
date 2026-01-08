'use client';

/**
 * @fileoverview Hook principal para gestión del estado del DataTable
 * @description Maneja paginación, ordenamiento, filtros, selección y preferencias
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  TableState,
  TablePreferences,
  SortingState,
  FilterValue,
  PaginationState,
  SelectionState,
  EditingState,
  ColumnDef,
  DataTableProps,
  UseDataTableReturn,
  RowId,
  LoadingState,
} from '@/types/datatable.types';

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PREFERENCES: TablePreferences = {
  columnOrder: [],
  visibleColumns: [],
  columnWidths: {},
  density: 'comfortable',
  pageSize: DEFAULT_PAGE_SIZE,
};

const DEFAULT_PAGINATION: PaginationState = {
  pageIndex: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
};

const DEFAULT_SELECTION: SelectionState = {
  selectedIds: new Set(),
  allSelected: false,
  indeterminate: false,
};

const DEFAULT_EDITING: EditingState = {
  rowId: null,
  columnId: null,
  originalValue: null,
  currentValue: null,
  saveState: 'idle',
  error: null,
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtiene el valor de una propiedad anidada
 */
function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Compara dos valores para ordenamiento
 */
function compareValues(
  a: unknown,
  b: unknown,
  direction: 'asc' | 'desc'
): number {
  const multiplier = direction === 'asc' ? 1 : -1;

  if (a === null || a === undefined) return 1 * multiplier;
  if (b === null || b === undefined) return -1 * multiplier;

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b) * multiplier;
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * multiplier;
  }

  if (a instanceof Date && b instanceof Date) {
    return (a.getTime() - b.getTime()) * multiplier;
  }

  return String(a).localeCompare(String(b)) * multiplier;
}

/**
 * Aplica filtro a un valor
 */
function matchesFilter(value: unknown, filter: FilterValue): boolean {
  if (
    filter.value === null ||
    filter.value === undefined ||
    filter.value === ''
  ) {
    return true;
  }

  switch (filter.type) {
    case 'text':
      return String(value)
        .toLowerCase()
        .includes(String(filter.value).toLowerCase());

    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) return false;
      return numValue === Number(filter.value);

    case 'numberRange':
      const rangeNumValue = Number(value);
      if (isNaN(rangeNumValue)) return false;
      const minNum = filter.min !== undefined ? Number(filter.min) : -Infinity;
      const maxNum = filter.max !== undefined ? Number(filter.max) : Infinity;
      return rangeNumValue >= minNum && rangeNumValue <= maxNum;

    case 'date':
      const dateValue = value instanceof Date ? value : new Date(String(value));
      const filterDate =
        filter.value instanceof Date
          ? filter.value
          : new Date(String(filter.value));
      return dateValue.toDateString() === filterDate.toDateString();

    case 'dateRange':
      const dateRangeValue =
        value instanceof Date ? value : new Date(String(value));
      const minDate = filter.min instanceof Date ? filter.min : new Date(0);
      const maxDate =
        filter.max instanceof Date ? filter.max : new Date(8640000000000000);
      return dateRangeValue >= minDate && dateRangeValue <= maxDate;

    case 'select':
      if (Array.isArray(filter.value)) {
        return filter.value.includes(String(value));
      }
      return String(value) === String(filter.value);

    case 'boolean':
      return Boolean(value) === Boolean(filter.value);

    default:
      return true;
  }
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para gestión completa del estado del DataTable
 *
 * @example
 * ```tsx
 * const {
 *   processedData,
 *   pagination,
 *   sorting,
 *   goToPage,
 *   toggleSort,
 *   selectedRows
 * } = useDataTable({
 *   data: users,
 *   columns: userColumns,
 *   getRowId: (row) => row.id,
 *   paginated: true,
 *   selectable: true,
 * });
 * ```
 */
export function useDataTable<TData>(
  props: DataTableProps<TData>
): UseDataTableReturn<TData> {
  const {
    data,
    columns,
    getRowId,
    isLoading = false,
    error = null,
    initialPage = 0,
    initialPageSize = DEFAULT_PAGE_SIZE,
    initialSorting = [],
    initialSelection = [],
    initialPreferences,
    paginated = false,
    serverSide = false,
    totalItems: serverTotalItems,
    multiSort = false,
    preferencesKey,
    callbacks,
  } = props;

  // =========================================================================
  // ESTADO
  // =========================================================================

  // Preferencias (persistentes si hay key)
  const [preferences, setPreferences] = useState<TablePreferences>(() => {
    if (preferencesKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`datatable-prefs-${preferencesKey}`);
      if (saved) {
        try {
          return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
        } catch {
          // Ignore parse errors
        }
      }
    }
    return {
      ...DEFAULT_PREFERENCES,
      ...initialPreferences,
      columnOrder: initialPreferences?.columnOrder ?? columns.map((c) => c.id),
      visibleColumns:
        initialPreferences?.visibleColumns ??
        columns.filter((c) => c.defaultVisible !== false).map((c) => c.id),
      pageSize: initialPreferences?.pageSize ?? initialPageSize,
    };
  });

  // Estados principales
  const [sorting, setSortingState] = useState<SortingState[]>(initialSorting);
  const [filters, setFiltersState] = useState<FilterValue[]>([]);
  const [globalFilter, setGlobalFilterState] = useState('');
  const [selection, setSelection] = useState<SelectionState>(() => ({
    selectedIds: new Set(initialSelection),
    allSelected: false,
    indeterminate: initialSelection.length > 0,
  }));
  const [editing, setEditing] = useState<EditingState>(DEFAULT_EDITING);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    isLoading ? 'loading' : 'idle'
  );

  // Paginación
  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: initialPage,
    pageSize: preferences.pageSize,
    totalItems: serverTotalItems ?? data.length,
    totalPages: Math.ceil(
      (serverTotalItems ?? data.length) / preferences.pageSize
    ),
  });

  // =========================================================================
  // EFECTOS
  // =========================================================================

  // Sincronizar loading state
  useEffect(() => {
    setLoadingState(isLoading ? 'loading' : error ? 'error' : 'idle');
  }, [isLoading, error]);

  // Persistir preferencias
  useEffect(() => {
    if (preferencesKey && typeof window !== 'undefined') {
      localStorage.setItem(
        `datatable-prefs-${preferencesKey}`,
        JSON.stringify(preferences)
      );
    }
  }, [preferences, preferencesKey]);

  // Actualizar total cuando cambian datos
  useEffect(() => {
    if (!serverSide) {
      setPaginationState((prev) => ({
        ...prev,
        totalItems: data.length,
        totalPages: Math.ceil(data.length / prev.pageSize),
      }));
    }
  }, [data.length, serverSide]);

  // =========================================================================
  // PROCESAMIENTO DE DATOS (client-side)
  // =========================================================================

  const processedData = useMemo(() => {
    if (serverSide) {
      return data;
    }

    let result = [...data];

    // 1. Aplicar búsqueda global
    if (globalFilter) {
      const searchLower = globalFilter.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const value = col.accessorFn
            ? col.accessorFn(row)
            : col.accessorKey
            ? getNestedValue(row, String(col.accessorKey))
            : null;
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // 2. Aplicar filtros por columna
    if (filters.length > 0) {
      result = result.filter((row) =>
        filters.every((filter) => {
          const column = columns.find((c) => c.id === filter.columnId);
          if (!column) return true;

          const value = column.accessorFn
            ? column.accessorFn(row)
            : column.accessorKey
            ? getNestedValue(row, String(column.accessorKey))
            : null;

          return matchesFilter(value, filter);
        })
      );
    }

    // 3. Aplicar ordenamiento
    if (sorting.length > 0) {
      result.sort((a, b) => {
        for (const sort of sorting) {
          if (!sort.direction) continue;

          const column = columns.find((c) => c.id === sort.columnId);
          if (!column) continue;

          const aValue = column.accessorFn
            ? column.accessorFn(a)
            : column.accessorKey
            ? getNestedValue(a, String(column.accessorKey))
            : null;

          const bValue = column.accessorFn
            ? column.accessorFn(b)
            : column.accessorKey
            ? getNestedValue(b, String(column.accessorKey))
            : null;

          // Custom sorting function
          if (column.sortingFn) {
            const result = column.sortingFn(a, b, sort.columnId);
            if (result !== 0)
              return sort.direction === 'desc' ? -result : result;
          }

          const comparison = compareValues(aValue, bValue, sort.direction);
          if (comparison !== 0) return comparison;
        }
        return 0;
      });
    }

    // Actualizar paginación con datos filtrados
    const totalFiltered = result.length;

    // 4. Aplicar paginación (solo si no es server-side)
    if (paginated) {
      const start = pagination.pageIndex * pagination.pageSize;
      const end = start + pagination.pageSize;
      result = result.slice(start, end);
    }

    // Actualizar total items si cambió por filtros
    if (totalFiltered !== pagination.totalItems) {
      setPaginationState((prev) => ({
        ...prev,
        totalItems: totalFiltered,
        totalPages: Math.ceil(totalFiltered / prev.pageSize),
        pageIndex: Math.min(
          prev.pageIndex,
          Math.max(0, Math.ceil(totalFiltered / prev.pageSize) - 1)
        ),
      }));
    }

    return result;
  }, [
    data,
    columns,
    globalFilter,
    filters,
    sorting,
    paginated,
    pagination.pageIndex,
    pagination.pageSize,
    serverSide,
    pagination.totalItems,
  ]);

  // =========================================================================
  // COLUMNAS VISIBLES Y ORDENADAS
  // =========================================================================

  const visibleColumns = useMemo(() => {
    const visible = columns.filter((col) =>
      preferences.visibleColumns.includes(col.id)
    );
    return preferences.columnOrder.length > 0
      ? preferences.columnOrder
          .filter((id) => preferences.visibleColumns.includes(id))
          .map((id) => visible.find((col) => col.id === id))
          .filter((col): col is ColumnDef<TData> => col !== undefined)
      : visible;
  }, [columns, preferences.columnOrder, preferences.visibleColumns]);

  // =========================================================================
  // FILAS SELECCIONADAS
  // =========================================================================

  const selectedRows = useMemo(() => {
    return data.filter((row) => selection.selectedIds.has(getRowId(row)));
  }, [data, selection.selectedIds, getRowId]);

  // =========================================================================
  // ACCIONES DE ORDENAMIENTO
  // =========================================================================

  const setSorting = useCallback(
    (newSorting: SortingState[]) => {
      setSortingState(newSorting);
      callbacks?.onSortingChange?.(newSorting);
    },
    [callbacks]
  );

  const toggleSort = useCallback(
    (columnId: string, isMultiSort = false) => {
      setSortingState((prev) => {
        const existing = prev.find((s) => s.columnId === columnId);

        if (isMultiSort && multiSort) {
          // Multi-column sorting
          if (!existing) {
            return [...prev, { columnId, direction: 'asc' }];
          }
          if (existing.direction === 'asc') {
            return prev.map((s) =>
              s.columnId === columnId ? { ...s, direction: 'desc' as const } : s
            );
          }
          return prev.filter((s) => s.columnId !== columnId);
        } else {
          // Single column sorting
          if (!existing) {
            return [{ columnId, direction: 'asc' }];
          }
          if (existing.direction === 'asc') {
            return [{ columnId, direction: 'desc' }];
          }
          return [];
        }
      });
    },
    [multiSort]
  );

  // =========================================================================
  // ACCIONES DE FILTROS
  // =========================================================================

  const setFilters = useCallback(
    (newFilters: FilterValue[]) => {
      setFiltersState(newFilters);
      callbacks?.onFiltersChange?.(newFilters);
    },
    [callbacks]
  );

  const updateFilter = useCallback(
    (columnId: string, value: unknown) => {
      setFiltersState((prev) => {
        const column = columns.find((c) => c.id === columnId);
        const filterType = column?.filter?.type ?? 'text';

        const existing = prev.find((f) => f.columnId === columnId);
        if (existing) {
          return prev.map((f) =>
            f.columnId === columnId ? { ...f, value } : f
          );
        }
        return [...prev, { columnId, type: filterType, value }];
      });
    },
    [columns]
  );

  const removeFilter = useCallback((columnId: string) => {
    setFiltersState((prev) => prev.filter((f) => f.columnId !== columnId));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState([]);
    setGlobalFilterState('');
    callbacks?.onFiltersChange?.([]);
    callbacks?.onGlobalFilterChange?.('');
  }, [callbacks]);

  const setGlobalFilter = useCallback(
    (value: string) => {
      setGlobalFilterState(value);
      callbacks?.onGlobalFilterChange?.(value);
    },
    [callbacks]
  );

  // =========================================================================
  // ACCIONES DE PAGINACIÓN
  // =========================================================================

  const goToPage = useCallback(
    (page: number) => {
      setPaginationState((prev) => {
        const newPage = Math.max(0, Math.min(page, prev.totalPages - 1));
        const newPagination = { ...prev, pageIndex: newPage };
        callbacks?.onPaginationChange?.(newPagination);
        return newPagination;
      });
    },
    [callbacks]
  );

  const setPageSize = useCallback(
    (size: number) => {
      setPaginationState((prev) => {
        const newPagination = {
          ...prev,
          pageSize: size,
          totalPages: Math.ceil(prev.totalItems / size),
          pageIndex: 0, // Reset to first page
        };
        callbacks?.onPaginationChange?.(newPagination);
        return newPagination;
      });
      setPreferences((prev) => ({ ...prev, pageSize: size }));
    },
    [callbacks]
  );

  // =========================================================================
  // ACCIONES DE SELECCIÓN
  // =========================================================================

  const toggleRowSelection = useCallback(
    (rowId: RowId) => {
      setSelection((prev) => {
        const newSelected = new Set(prev.selectedIds);
        if (newSelected.has(rowId)) {
          newSelected.delete(rowId);
        } else {
          newSelected.add(rowId);
        }

        const allSelected = processedData.every((row) =>
          newSelected.has(getRowId(row))
        );
        const indeterminate = newSelected.size > 0 && !allSelected;

        const newSelection: SelectionState = {
          selectedIds: newSelected,
          allSelected,
          indeterminate,
        };

        callbacks?.onSelectionChange?.(
          newSelection,
          data.filter((row) => newSelected.has(getRowId(row)))
        );

        return newSelection;
      });
    },
    [processedData, data, getRowId, callbacks]
  );

  const toggleAllSelection = useCallback(() => {
    setSelection((prev) => {
      let newSelected: Set<RowId>;

      if (prev.allSelected || prev.indeterminate) {
        // Deselect all
        newSelected = new Set();
      } else {
        // Select all visible rows
        newSelected = new Set(processedData.map((row) => getRowId(row)));
      }

      const allSelected =
        newSelected.size === processedData.length && processedData.length > 0;
      const indeterminate = newSelected.size > 0 && !allSelected;

      const newSelection: SelectionState = {
        selectedIds: newSelected,
        allSelected,
        indeterminate,
      };

      callbacks?.onSelectionChange?.(
        newSelection,
        data.filter((row) => newSelected.has(getRowId(row)))
      );

      return newSelection;
    });
  }, [processedData, data, getRowId, callbacks]);

  const clearSelection = useCallback(() => {
    const newSelection: SelectionState = {
      selectedIds: new Set(),
      allSelected: false,
      indeterminate: false,
    };
    setSelection(newSelection);
    callbacks?.onSelectionChange?.(newSelection, []);
  }, [callbacks]);

  // =========================================================================
  // ACCIONES DE EDICIÓN
  // =========================================================================

  const startEditing = useCallback(
    (rowId: RowId, columnId: string) => {
      const row = data.find((r) => getRowId(r) === rowId);
      if (!row) return;

      const column = columns.find((c) => c.id === columnId);
      if (!column || !column.editable) return;

      const value = column.accessorFn
        ? column.accessorFn(row)
        : column.accessorKey
        ? getNestedValue(row, String(column.accessorKey))
        : null;

      setEditing({
        rowId,
        columnId,
        originalValue: value,
        currentValue: value,
        saveState: 'idle',
        error: null,
      });
    },
    [data, columns, getRowId]
  );

  const cancelEditing = useCallback(() => {
    setEditing(DEFAULT_EDITING);
  }, []);

  const saveEditing = useCallback(async () => {
    if (!editing.rowId || !editing.columnId) return;

    const column = columns.find((c) => c.id === editing.columnId);
    if (column?.validate) {
      const error = column.validate(editing.currentValue);
      if (error) {
        setEditing((prev) => ({ ...prev, error }));
        return;
      }
    }

    setEditing((prev) => ({ ...prev, saveState: 'loading' }));

    try {
      await callbacks?.onCellEdit?.(
        editing.rowId,
        editing.columnId,
        editing.currentValue,
        editing.originalValue
      );
      setEditing((prev) => ({ ...prev, saveState: 'success' }));
      setTimeout(() => setEditing(DEFAULT_EDITING), 500);
    } catch (err) {
      setEditing((prev) => ({
        ...prev,
        saveState: 'error',
        error: err instanceof Error ? err.message : 'Error al guardar',
      }));
    }
  }, [editing, columns, callbacks]);

  const updateEditingValue = useCallback((value: unknown) => {
    setEditing((prev) => ({ ...prev, currentValue: value, error: null }));
  }, []);

  // =========================================================================
  // ACCIONES DE PREFERENCIAS
  // =========================================================================

  const updatePreferences = useCallback(
    (updates: Partial<TablePreferences>) => {
      setPreferences((prev) => {
        const newPrefs = { ...prev, ...updates };
        callbacks?.onPreferencesChange?.(newPrefs);
        return newPrefs;
      });
    },
    [callbacks]
  );

  // =========================================================================
  // ESTADO COMPLETO
  // =========================================================================

  const state: TableState<TData> = {
    data: processedData,
    loadingState,
    error,
    sorting,
    filters,
    globalFilter,
    pagination,
    selection,
    editing,
    preferences,
  };

  // =========================================================================
  // RETORNO
  // =========================================================================

  return {
    // Estado
    state,
    columns,
    props,
    processedData,
    selectedRows,
    visibleColumns,

    // Flags computados
    hasActiveFilters: filters.length > 0 || globalFilter.length > 0,
    hasSelection: selection.selectedIds.size > 0,

    // Acciones de ordenamiento
    setSorting,
    toggleSort,

    // Acciones de filtros
    setFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    setGlobalFilter,

    // Acciones de paginación
    goToPage,
    setPageSize,

    // Acciones de selección
    toggleRowSelection,
    toggleAllSelection,
    clearSelection,

    // Acciones de edición
    startEditing,
    cancelEditing,
    saveEditing,
    updateEditingValue,

    // Acciones de preferencias
    updatePreferences,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { UseDataTableReturn };

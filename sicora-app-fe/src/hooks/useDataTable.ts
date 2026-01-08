/**
 * Hook para gestión de estado de DataTable
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import type {
  SortState,
  ActiveFilter,
  PaginationState,
  SelectionState,
  TableDensity,
} from '../types/datatable.types';

interface UseDataTableOptions<T> {
  data: T[];
  keyField: keyof T;
  initialPageSize?: number;
  initialSort?: SortState;
  initialFilters?: ActiveFilter[];
  initialVisibleColumns?: string[];
  serverSide?: boolean;
}

export function useDataTable<T>({
  data,
  keyField,
  initialPageSize = 25,
  initialSort,
  initialFilters = [],
  initialVisibleColumns,
  serverSide = false,
}: UseDataTableOptions<T>) {
  // ===== PAGINATION STATE =====
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: initialPageSize,
    totalItems: data.length,
    totalPages: Math.ceil(data.length / initialPageSize),
  });

  // ===== SORT STATE =====
  const [sortState, setSortState] = useState<SortState[]>(initialSort ? [initialSort] : []);

  // ===== FILTER STATE =====
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');

  // ===== SELECTION STATE =====
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ===== COLUMN STATE =====
  const [visibleColumns, setVisibleColumns] = useState<string[]>(initialVisibleColumns || []);

  // ===== UI STATE =====
  const [density, setDensity] = useState<TableDensity>('normal');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);

  // ===== PROCESS DATA (Client-side) =====
  const processedData = useMemo(() => {
    if (serverSide) return data;

    let result = [...data];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((row) => {
        return Object.values(row as object).some((value) =>
          String(value).toLowerCase().includes(query)
        );
      });
    }

    // Apply filters
    activeFilters.forEach((filter) => {
      if (filter.value === null || filter.value === '') return;

      result = result.filter((row) => {
        const value = (row as Record<string, unknown>)[filter.columnId];
        return applyFilter(value, filter);
      });
    });

    // Apply sorting
    if (sortState.length > 0) {
      result.sort((a, b) => {
        for (const sort of sortState) {
          const aVal = String((a as Record<string, unknown>)[sort.column] ?? '');
          const bVal = String((b as Record<string, unknown>)[sort.column] ?? '');

          let comparison = 0;
          if (aVal < bVal) comparison = -1;
          if (aVal > bVal) comparison = 1;

          if (comparison !== 0) {
            return sort.direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, activeFilters, sortState, serverSide]);

  // Update pagination when data changes
  useEffect(() => {
    if (!serverSide) {
      setPagination((prev) => ({
        ...prev,
        totalItems: processedData.length,
        totalPages: Math.ceil(processedData.length / prev.pageSize),
        currentPage: 1,
      }));
    }
  }, [processedData.length, serverSide]);

  // ===== PAGINATED DATA =====
  const paginatedData = useMemo(() => {
    if (serverSide) return data;

    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return processedData.slice(start, end);
  }, [processedData, pagination.currentPage, pagination.pageSize, serverSide, data]);

  // ===== SELECTION COMPUTED =====
  const selectionState = useMemo<SelectionState>(() => {
    const currentPageIds = paginatedData.map((row) =>
      String((row as Record<string, unknown>)[keyField as string])
    );
    const selectedOnPage = selectedIds.filter((id) => currentPageIds.includes(id));

    return {
      selectedIds,
      isAllSelected: selectedOnPage.length === currentPageIds.length && currentPageIds.length > 0,
      isIndeterminate: selectedOnPage.length > 0 && selectedOnPage.length < currentPageIds.length,
    };
  }, [selectedIds, paginatedData, keyField]);

  // ===== PAGINATION ACTIONS =====
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages)),
    }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / size),
    }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, prev.totalPages),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  }, []);

  const firstPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const lastPage = useCallback(() => {
    setPagination((prev) => ({ ...prev, currentPage: prev.totalPages }));
  }, []);

  // ===== SORT ACTIONS =====
  const toggleSort = useCallback((columnId: string, multi = false) => {
    setSortState((prev) => {
      const existingIndex = prev.findIndex((s) => s.column === columnId);

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        if (existing.direction === 'asc') {
          // Toggle to desc
          const newState = [...prev];
          newState[existingIndex] = { column: columnId, direction: 'desc' };
          return newState;
        } else {
          // Remove sort
          return prev.filter((_, i) => i !== existingIndex);
        }
      } else {
        // Add new sort
        const newSort: SortState = { column: columnId, direction: 'asc' };
        return multi ? [...prev, newSort] : [newSort];
      }
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortState([]);
  }, []);

  // ===== FILTER ACTIONS =====
  const addFilter = useCallback((filter: ActiveFilter) => {
    setActiveFilters((prev) => {
      const existingIndex = prev.findIndex((f) => f.columnId === filter.columnId);
      if (existingIndex >= 0) {
        const newFilters = [...prev];
        newFilters[existingIndex] = filter;
        return newFilters;
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((columnId: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.columnId !== columnId));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters([]);
    setSearchQuery('');
  }, []);

  // ===== SELECTION ACTIONS =====
  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId);
      }
      return [...prev, rowId];
    });
  }, []);

  const toggleAllSelection = useCallback(() => {
    const currentPageIds = paginatedData.map((row) =>
      String((row as Record<string, unknown>)[keyField as string])
    );

    setSelectedIds((prev) => {
      const allSelected = currentPageIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !currentPageIds.includes(id));
      }
      return [...new Set([...prev, ...currentPageIds])];
    });
  }, [paginatedData, keyField]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectAll = useCallback(() => {
    const allIds = processedData.map((row) =>
      String((row as Record<string, unknown>)[keyField as string])
    );
    setSelectedIds(allIds);
  }, [processedData, keyField]);

  // ===== COLUMN ACTIONS =====
  const toggleColumn = useCallback((columnId: string) => {
    setVisibleColumns((prev) => {
      if (prev.includes(columnId)) {
        return prev.filter((id) => id !== columnId);
      }
      return [...prev, columnId];
    });
  }, []);

  // ===== RESET =====
  const reset = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    setSortState(initialSort ? [initialSort] : []);
    setActiveFilters(initialFilters);
    setSearchQuery('');
    setSelectedIds([]);
  }, [initialSort, initialFilters]);

  return {
    // Data
    data: paginatedData,
    processedData,
    totalFilteredItems: processedData.length,

    // Pagination
    pagination,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNextPage: pagination.currentPage < pagination.totalPages,
    hasPrevPage: pagination.currentPage > 1,

    // Sorting
    sortState,
    toggleSort,
    clearSort,
    setSortState,

    // Filtering
    activeFilters,
    searchQuery,
    setSearchQuery,
    addFilter,
    removeFilter,
    clearFilters,
    setActiveFilters,

    // Selection
    selectedIds,
    selectionState,
    toggleRowSelection,
    toggleAllSelection,
    clearSelection,
    selectAll,
    setSelectedIds,

    // Columns
    visibleColumns,
    setVisibleColumns,
    toggleColumn,

    // UI
    density,
    setDensity,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    isColumnConfigOpen,
    setIsColumnConfigOpen,

    // Reset
    reset,
  };
}

// ===== HELPER FUNCTIONS =====

function applyFilter(value: unknown, filter: ActiveFilter): boolean {
  const filterValue = filter.value;

  switch (filter.type) {
    case 'text':
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());

    case 'number': {
      const numValue = Number(value);
      const numFilter = Number(filterValue);
      switch (filter.operator) {
        case 'gt':
          return numValue > numFilter;
        case 'gte':
          return numValue >= numFilter;
        case 'lt':
          return numValue < numFilter;
        case 'lte':
          return numValue <= numFilter;
        case 'ne':
          return numValue !== numFilter;
        default:
          return numValue === numFilter;
      }
    }

    case 'select':
      if (Array.isArray(filterValue)) {
        return filterValue.includes(String(value));
      }
      return String(value) === String(filterValue);

    case 'boolean':
      return Boolean(value) === Boolean(filterValue);

    case 'date':
    case 'dateRange':
      if (typeof filterValue === 'object' && filterValue !== null && 'from' in filterValue) {
        const dateValue = new Date(String(value));
        const { from, to } = filterValue as { from: string | null; to: string | null };
        if (from && to) {
          return dateValue >= new Date(from) && dateValue <= new Date(to);
        }
        if (from) {
          return dateValue >= new Date(from);
        }
        if (to) {
          return dateValue <= new Date(to);
        }
      }
      return true;

    default:
      return true;
  }
}

// ===== SERVER-SIDE HOOK =====

interface UseServerDataTableOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialSort?: SortState;
  initialFilters?: ActiveFilter[];
}

export function useServerDataTable({
  initialPage = 1,
  initialPageSize = 25,
  initialSort,
  initialFilters = [],
}: UseServerDataTableOptions = {}) {
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    pageSize: initialPageSize,
    totalItems: 0,
    totalPages: 0,
  });

  const [sortState, setSortState] = useState<SortState[]>(initialSort ? [initialSort] : []);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Build query params for API
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {
      page: String(pagination.currentPage),
      page_size: String(pagination.pageSize),
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (sortState.length > 0) {
      params.sort_by = sortState[0].column;
      params.sort_order = sortState[0].direction;
    }

    activeFilters.forEach((filter) => {
      if (filter.value !== null && filter.value !== '') {
        params[`filter_${filter.columnId}`] = String(filter.value);
      }
    });

    return params;
  }, [pagination, searchQuery, sortState, activeFilters]);

  const updatePagination = useCallback((totalItems: number, totalPages: number) => {
    setPagination((prev) => ({
      ...prev,
      totalItems,
      totalPages,
    }));
  }, []);

  return {
    pagination,
    setPagination,
    sortState,
    setSortState,
    activeFilters,
    setActiveFilters,
    searchQuery,
    setSearchQuery,
    selectedIds,
    setSelectedIds,
    queryParams,
    updatePagination,
  };
}

/**
 * Tests para useDataTable hook
 * @module hooks/__tests__/useDataTable.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataTable } from '../useDataTable';
import type { ColumnDef } from '@/types/datatable.types';

// Datos de prueba
interface TestRow {
  id: string;
  name: string;
  email: string;
  age: number;
  status: string;
  createdAt: Date;
}

const testData: TestRow[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com', age: 30, status: 'enabled', createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Bob', email: 'bob@test.com', age: 25, status: 'disabled', createdAt: new Date('2024-01-02') },
  { id: '3', name: 'Charlie', email: 'charlie@test.com', age: 35, status: 'enabled', createdAt: new Date('2024-01-03') },
  { id: '4', name: 'Diana', email: 'diana@test.com', age: 28, status: 'pending', createdAt: new Date('2024-01-04') },
  { id: '5', name: 'Eve', email: 'eve@test.com', age: 32, status: 'enabled', createdAt: new Date('2024-01-05') },
];

const testColumns: ColumnDef<TestRow>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name', sortable: true, editable: true },
  { id: 'email', accessorKey: 'email', header: 'Email', sortable: true },
  { id: 'age', accessorKey: 'age', header: 'Age', sortable: true },
  { id: 'status', accessorKey: 'status', header: 'Status', sortable: true },
  { id: 'createdAt', accessorKey: 'createdAt', header: 'Created At', sortable: true },
];

const getRowId = (row: TestRow) => row.id;

describe('useDataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Inicialización', () => {
    it('debe inicializar con valores por defecto', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      expect(result.current.state.pagination.pageIndex).toBe(0);
      expect(result.current.state.pagination.pageSize).toBe(10);
      expect(result.current.state.sorting).toEqual([]);
      expect(result.current.state.filters).toEqual([]);
      expect(result.current.state.selection.selectedIds.size).toBe(0);
    });

    it('debe aceptar valores iniciales personalizados', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          initialPageSize: 5,
          initialSorting: [{ columnId: 'name', direction: 'asc' }],
        })
      );

      expect(result.current.state.pagination.pageSize).toBe(5);
      expect(result.current.state.sorting).toEqual([{ columnId: 'name', direction: 'asc' }]);
    });

    it('debe calcular totalItems correctamente', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          initialPageSize: 2,
        })
      );

      expect(result.current.state.pagination.totalItems).toBe(5);
    });
  });

  describe('Paginación', () => {
    it('debe cambiar de página con goToPage', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          initialPageSize: 2,
          paginated: true,
        })
      );

      act(() => {
        result.current.goToPage(1);
      });

      expect(result.current.state.pagination.pageIndex).toBe(1);
    });

    it('debe cambiar tamaño de página', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          initialPageSize: 10,
        })
      );

      act(() => {
        result.current.setPageSize(5);
      });

      expect(result.current.state.pagination.pageSize).toBe(5);
    });

    it('debe limitar página a rango válido', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          initialPageSize: 2,
          paginated: true,
        })
      );

      act(() => {
        result.current.goToPage(100);
      });

      expect(result.current.state.pagination.pageIndex).toBeLessThanOrEqual(2);
    });

    it('debe retornar datos paginados correctamente', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          initialPageSize: 2,
          paginated: true,
        })
      );

      expect(result.current.processedData).toHaveLength(2);
      expect(result.current.processedData[0].id).toBe('1');
      expect(result.current.processedData[1].id).toBe('2');

      act(() => {
        result.current.goToPage(1);
      });

      expect(result.current.processedData).toHaveLength(2);
      expect(result.current.processedData[0].id).toBe('3');
    });
  });

  describe('Ordenamiento', () => {
    it('debe ordenar por columna ascendente', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.setSorting([{ columnId: 'name', direction: 'asc' }]);
      });

      expect(result.current.processedData[0].name).toBe('Alice');
      expect(result.current.processedData[4].name).toBe('Eve');
    });

    it('debe ordenar por columna descendente', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.setSorting([{ columnId: 'name', direction: 'desc' }]);
      });

      expect(result.current.processedData[0].name).toBe('Eve');
      expect(result.current.processedData[4].name).toBe('Alice');
    });

    it('debe ordenar números correctamente', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.setSorting([{ columnId: 'age', direction: 'asc' }]);
      });

      expect(result.current.processedData[0].age).toBe(25);
      expect(result.current.processedData[4].age).toBe(35);
    });

    it('debe alternar ordenamiento con toggleSort', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.toggleSort('name');
      });
      expect(result.current.state.sorting).toEqual([{ columnId: 'name', direction: 'asc' }]);

      act(() => {
        result.current.toggleSort('name');
      });
      expect(result.current.state.sorting).toEqual([{ columnId: 'name', direction: 'desc' }]);

      act(() => {
        result.current.toggleSort('name');
      });
      expect(result.current.state.sorting).toEqual([]);
    });
  });

  describe('Filtrado', () => {
    it('debe filtrar por texto con updateFilter', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.updateFilter('name', 'Alice');
      });

      expect(result.current.processedData).toHaveLength(1);
      expect(result.current.processedData[0].name).toBe('Alice');
    });

    it('debe filtrar por status', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.updateFilter('status', 'enabled');
      });

      expect(result.current.processedData).toHaveLength(3);
    });

    it('debe limpiar filtro específico', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.updateFilter('status', 'enabled');
      });
      expect(result.current.processedData).toHaveLength(3);

      act(() => {
        result.current.removeFilter('status');
      });
      expect(result.current.processedData).toHaveLength(5);
    });

    it('debe limpiar todos los filtros', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.updateFilter('status', 'enabled');
        result.current.updateFilter('name', 'a');
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.state.filters).toEqual([]);
      expect(result.current.processedData).toHaveLength(5);
    });

    it('debe soportar búsqueda global', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.setGlobalFilter('alice');
      });

      expect(result.current.processedData.length).toBe(1);
      expect(result.current.processedData[0].name).toBe('Alice');
    });

    it('debe indicar si hay filtros activos', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);

      act(() => {
        result.current.updateFilter('status', 'active');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe('Selección', () => {
    it('debe seleccionar una fila', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.toggleRowSelection('1');
      });

      expect(result.current.state.selection.selectedIds.has('1')).toBe(true);
    });

    it('debe deseleccionar una fila', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.toggleRowSelection('1');
      });
      expect(result.current.state.selection.selectedIds.has('1')).toBe(true);

      act(() => {
        result.current.toggleRowSelection('1');
      });
      expect(result.current.state.selection.selectedIds.has('1')).toBe(false);
    });

    it('debe seleccionar múltiples filas', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.toggleRowSelection('1');
        result.current.toggleRowSelection('2');
        result.current.toggleRowSelection('3');
      });

      expect(result.current.state.selection.selectedIds.size).toBe(3);
    });

    it('debe alternar selección de todas las filas', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.toggleAllSelection();
      });

      expect(result.current.state.selection.allSelected).toBe(true);
      expect(result.current.state.selection.selectedIds.size).toBe(5);

      act(() => {
        result.current.toggleAllSelection();
      });

      expect(result.current.state.selection.selectedIds.size).toBe(0);
    });

    it('debe limpiar selección', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.toggleAllSelection();
      });
      expect(result.current.state.selection.selectedIds.size).toBe(5);

      act(() => {
        result.current.clearSelection();
      });
      expect(result.current.state.selection.selectedIds.size).toBe(0);
    });

    it('debe obtener filas seleccionadas', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.toggleRowSelection('1');
        result.current.toggleRowSelection('3');
      });

      expect(result.current.selectedRows).toHaveLength(2);
      expect(result.current.selectedRows[0].id).toBe('1');
      expect(result.current.selectedRows[1].id).toBe('3');
    });

    it('debe calcular estado indeterminate', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.toggleRowSelection('1');
      });

      expect(result.current.state.selection.indeterminate).toBe(true);
      expect(result.current.state.selection.allSelected).toBe(false);
    });

    it('debe indicar si hay selección', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      expect(result.current.hasSelection).toBe(false);

      act(() => {
        result.current.toggleRowSelection('1');
      });

      expect(result.current.hasSelection).toBe(true);
    });
  });

  describe('Edición inline', () => {
    it('debe iniciar edición de celda', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.startEditing('1', 'name');
      });

      expect(result.current.state.editing.rowId).toBe('1');
      expect(result.current.state.editing.columnId).toBe('name');
    });

    it('debe cancelar edición', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.startEditing('1', 'name');
      });

      act(() => {
        result.current.cancelEditing();
      });

      expect(result.current.state.editing.rowId).toBeNull();
      expect(result.current.state.editing.columnId).toBeNull();
    });

    it('debe actualizar valor en edición', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.startEditing('1', 'name');
      });

      act(() => {
        result.current.updateEditingValue('Alice Modified');
      });

      expect(result.current.state.editing.currentValue).toBe('Alice Modified');
    });
  });

  describe('Visibilidad de columnas', () => {
    it('debe retornar columnas visibles', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      expect(result.current.visibleColumns.length).toBe(5);
    });

    it('debe actualizar preferencias de columnas', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.updatePreferences({
          visibleColumns: ['name', 'email'],
        });
      });

      expect(result.current.state.preferences.visibleColumns).toEqual(['name', 'email']);
    });
  });

  describe('Estado de carga', () => {
    it('debe manejar estado de carga', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          isLoading: true,
        })
      );

      expect(result.current.state.loadingState).toBe('loading');
    });

    it('debe manejar estado de error', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          error: 'Error loading data',
        })
      );

      expect(result.current.state.error).toBe('Error loading data');
    });

    it('debe manejar estado idle', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          isLoading: false,
          error: null,
        })
      );

      expect(result.current.state.loadingState).toBe('idle');
    });
  });

  describe('Preferencias', () => {
    it('debe actualizar densidad', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.updatePreferences({ density: 'compact' });
      });

      expect(result.current.state.preferences.density).toBe('compact');
    });

    it('debe persistir preferencias con preferencesKey', () => {
      const tableKey = 'test-table-prefs-' + Date.now();

      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          preferencesKey: tableKey,
        })
      );

      act(() => {
        result.current.setPageSize(25);
      });

      // Las preferencias se actualizan en el estado
      expect(result.current.state.preferences.pageSize).toBe(25);
    });
  });

  describe('Callbacks', () => {
    it('debe llamar onSortingChange', () => {
      const onSortingChange = vi.fn();
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          callbacks: { onSortingChange },
        })
      );

      act(() => {
        result.current.setSorting([{ columnId: 'name', direction: 'asc' }]);
      });

      expect(onSortingChange).toHaveBeenCalledWith([{ columnId: 'name', direction: 'asc' }]);
    });

    it('debe llamar onSelectionChange', () => {
      const onSelectionChange = vi.fn();
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          callbacks: { onSelectionChange },
        })
      );

      act(() => {
        result.current.toggleRowSelection('1');
      });

      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('debe llamar onPaginationChange', () => {
      const onPaginationChange = vi.fn();
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          paginated: true,
          callbacks: { onPaginationChange },
        })
      );

      act(() => {
        result.current.goToPage(1);
      });

      expect(onPaginationChange).toHaveBeenCalled();
    });

    it('debe llamar onFiltersChange', () => {
      const onFiltersChange = vi.fn();
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          callbacks: { onFiltersChange },
        })
      );

      act(() => {
        result.current.setFilters([{ columnId: 'name', type: 'text', value: 'test' }]);
      });

      expect(onFiltersChange).toHaveBeenCalled();
    });
  });

  describe('Datos procesados', () => {
    it('debe aplicar filtros y ordenamiento juntos', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
        })
      );

      act(() => {
        result.current.updateFilter('status', 'enabled');
        result.current.setSorting([{ columnId: 'age', direction: 'desc' }]);
      });

      expect(result.current.processedData).toHaveLength(3);
      expect(result.current.processedData[0].age).toBe(35);
      expect(result.current.processedData[2].age).toBe(30);
    });

    it('debe retornar props originales', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: testData,
          columns: testColumns,
          getRowId,
          paginated: true,
        })
      );

      expect(result.current.props.paginated).toBe(true);
      expect(result.current.props.data).toBe(testData);
    });
  });
});

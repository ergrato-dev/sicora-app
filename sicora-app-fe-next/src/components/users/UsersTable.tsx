'use client';

import { useState, useCallback } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Power,
  Eye,
  UserPlus,
  RefreshCw,
  Download,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUsers } from '@/hooks/useUsers';
import type { User, UserRole, UserFilters as UserFiltersType } from '@/types/user.types';
import { UserRoleLabels, getRoleBadgeColor, getStatusBadgeColor, getUserInitials, roleOptions } from '@/types/user.types';

// ============================================================================
// TIPOS
// ============================================================================

interface UsersTableProps {
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  onCreate?: () => void;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors"
      >
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600">{label}:</span>
        <span className="font-medium text-gray-900">
          {value ? options.find(o => o.value === value)?.label || value : 'Todos'}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              <button
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-gray-50',
                  !value && 'bg-sena-primary-50 text-sena-primary-700'
                )}
              >
                Todos
              </button>
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm hover:bg-gray-50',
                    value === option.value && 'bg-sena-primary-50 text-sena-primary-700'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface UserRowActionsProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
}

function UserRowActions({ user, onEdit, onDelete, onView, onToggleStatus }: UserRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
            <button
              onClick={() => {
                onView?.(user);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              Ver detalles
            </button>
            <button
              onClick={() => {
                onEdit?.(user);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={() => {
                onToggleStatus?.(user);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Power className="w-4 h-4" />
              {user.is_active ? 'Desactivar' : 'Activar'}
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              onClick={() => {
                onDelete?.(user);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function UsersTable({ onEdit, onDelete, onView, onCreate }: UsersTableProps) {
  const {
    users,
    pagination,
    filters,
    sorting,
    isLoading,
    error,
    setFilters,
    clearFilters,
    setPage,
    setSorting,
    toggleUserStatus,
    refreshUsers,
    fetchUsers,
  } = useUsers(true);

  const [searchValue, setSearchValue] = useState('');

  // Manejar búsqueda con debounce manual
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    // Debounce simple
    const timeoutId = setTimeout(() => {
      setFilters({ search: value });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [setFilters]);

  // Manejar ordenamiento
  const handleSort = useCallback((field: typeof sorting.field) => {
    if (sorting.field === field) {
      setSorting(field, sorting.direction === 'asc' ? 'desc' : 'asc');
    } else {
      setSorting(field, 'asc');
    }
  }, [sorting, setSorting]);

  // Manejar toggle de estado
  const handleToggleStatus = useCallback(async (user: User) => {
    await toggleUserStatus(user.id, !user.is_active);
  }, [toggleUserStatus]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Renderizar header de columna sorteable
  const renderSortHeader = (field: typeof sorting.field, label: string) => (
    <button
      onClick={() => handleSort(field)}
      className="inline-flex items-center gap-1 font-medium hover:text-sena-primary-600 transition-colors"
    >
      {label}
      {sorting.field === field ? (
        sorting.direction === 'asc' ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )
      ) : (
        <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-50" />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Búsqueda y filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por rol */}
          <FilterDropdown
            label="Rol"
            value={filters.rol}
            options={roleOptions}
            onChange={(value) => setFilters({ rol: value as UserRole | '' })}
          />

          {/* Filtro por estado */}
          <FilterDropdown
            label="Estado"
            value={filters.is_active === null ? '' : filters.is_active ? 'active' : 'inactive'}
            options={[
              { value: 'active', label: 'Activos' },
              { value: 'inactive', label: 'Inactivos' },
            ]}
            onChange={(value) => setFilters({ is_active: value === '' ? null : value === 'active' })}
          />

          {/* Limpiar filtros */}
          {(filters.search || filters.rol || filters.is_active !== null) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => refreshUsers()}
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refrescar"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sena-primary-500 text-white rounded-lg hover:bg-sena-primary-600 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
          <button
            onClick={() => fetchUsers()}
            className="ml-2 text-red-800 underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {renderSortHeader('nombre', 'Usuario')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {renderSortHeader('email', 'Email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {renderSortHeader('created_at', 'Creado')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading && users.length === 0 ? (
                // Skeleton loading
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded" />
                          <div className="h-3 w-24 bg-gray-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full" /></td>
                    <td className="px-6 py-4 text-center"><div className="h-6 w-16 bg-gray-200 rounded-full mx-auto" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-8 bg-gray-200 rounded mx-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium">No se encontraron usuarios</p>
                    <p className="mt-1 text-sm">Intenta con otros filtros de búsqueda</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Usuario */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sena-primary-100 flex items-center justify-center text-sena-primary-700 font-medium">
                          {getUserInitials(user)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.programa_formacion}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-gray-600">
                      {user.email}
                    </td>

                    {/* Documento */}
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">
                      {user.documento}
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                        getRoleBadgeColor(user.rol)
                      )}>
                        <Shield className="w-3 h-3" />
                        {UserRoleLabels[user.rol]}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                        getStatusBadgeColor(user.is_active)
                      )}>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          user.is_active ? 'bg-green-500' : 'bg-red-500'
                        )} />
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Fecha creación */}
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {formatDate(user.created_at)}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-center">
                      <UserRowActions
                        user={user}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onView={onView}
                        onToggleStatus={handleToggleStatus}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Mostrando{' '}
              <span className="font-medium">{((pagination.page - 1) * pagination.pageSize) + 1}</span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.pageSize, pagination.total)}
              </span>
              {' '}de{' '}
              <span className="font-medium">{pagination.total}</span>
              {' '}usuarios
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={!pagination.hasPrevious}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              {/* Números de página */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        'w-8 h-8 text-sm rounded-lg transition-colors',
                        pagination.page === pageNum
                          ? 'bg-sena-primary-500 text-white'
                          : 'hover:bg-gray-100'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersTable;

'use client';

/**
 * SICORA - Tabla de Usuarios usando DataTable
 * 
 * Integración del componente DataTable genérico con la lógica
 * específica de usuarios (API, filtros, acciones).
 */

import { useMemo, useCallback, useState } from 'react';
import {
  Shield,
  UserPlus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Power,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { DataTable } from '@/components/ui/DataTable';
import { useUsers } from '@/hooks/useUsers';
import type { ColumnDef } from '@/types/datatable.types';
import type { User, UserRole } from '@/types/user.types';
import {
  UserRoleLabels,
  getRoleBadgeColor,
  getStatusBadgeColor,
  getUserInitials,
  roleOptions,
} from '@/types/user.types';

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
// COLUMNAS
// ============================================================================

function createUserColumns(
  onEdit?: (user: User) => void,
  onDelete?: (user: User) => void,
  onView?: (user: User) => void,
  onToggleStatus?: (user: User) => void
): ColumnDef<User>[] {
  return [
    {
      id: 'user',
      header: 'Usuario',
      accessorKey: 'full_name',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sena-primary-100 flex items-center justify-center text-sena-primary-700 font-medium flex-shrink-0">
            {getUserInitials(row)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{row.full_name}</p>
            <p className="text-sm text-gray-500 truncate">{row.programa_formacion}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-gray-600">{String(value)}</span>
      ),
    },
    {
      id: 'documento',
      header: 'Documento',
      accessorKey: 'documento',
      cell: ({ value }) => (
        <span className="text-gray-600 font-mono text-sm">{String(value)}</span>
      ),
    },
    {
      id: 'rol',
      header: 'Rol',
      accessorKey: 'rol',
      sortable: true,
      filter: {
        type: 'select',
        options: roleOptions.map(r => ({ value: r.value, label: r.label })),
      },
      cell: ({ value }) => (
        <span className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
          getRoleBadgeColor(value as UserRole)
        )}>
          <Shield className="w-3 h-3" />
          {UserRoleLabels[value as UserRole]}
        </span>
      ),
    },
    {
      id: 'is_active',
      header: 'Estado',
      accessorKey: 'is_active',
      sortable: true,
      align: 'center',
      filter: {
        type: 'select',
        options: [
          { value: 'true', label: 'Activo' },
          { value: 'false', label: 'Inactivo' },
        ],
      },
      cell: ({ value }) => (
        <span className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
          getStatusBadgeColor(value as boolean)
        )}>
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            value ? 'bg-green-500' : 'bg-red-500'
          )} />
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      id: 'created_at',
      header: 'Creado',
      accessorKey: 'created_at',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-gray-500 text-sm">
          {new Date(value as string).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      align: 'center',
      cell: ({ row }) => (
        <UserRowActions
          user={row}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onToggleStatus={onToggleStatus}
        />
      ),
    },
  ];
}

// ============================================================================
// COMPONENTE DE ACCIONES
// ============================================================================

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
        aria-label="Acciones"
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
    isLoading,
    error,
    fetchUsers,
    toggleUserStatus,
    refreshUsers,
  } = useUsers(true);

  // Manejar toggle de estado
  const handleToggleStatus = useCallback(async (user: User) => {
    await toggleUserStatus(user.id, !user.is_active);
  }, [toggleUserStatus]);

  // Crear columnas con callbacks
  const columns = useMemo(
    () => createUserColumns(onEdit, onDelete, onView, handleToggleStatus),
    [onEdit, onDelete, onView, handleToggleStatus]
  );

  // Toolbar personalizado
  const toolbarActions = useMemo(() => (
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
  ), [onCreate, refreshUsers, isLoading]);

  return (
    <div className="space-y-4">
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

      {/* DataTable */}
      <DataTable<User>
        data={users}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        paginated
        totalItems={pagination.total}
        initialPageSize={pagination.pageSize}
        globalSearch
        globalSearchPlaceholder="Buscar usuarios..."
        density="comfortable"
        stickyHeader
        emptyState={{
          title: 'No se encontraron usuarios',
          description: 'Intenta con otros filtros de búsqueda',
        }}
        toolbarRight={toolbarActions}
        exportConfig={{
          formats: ['csv', 'excel'],
          filename: 'usuarios-sicora',
        }}
        serverSide
        onFetchData={({ pagination: pag, sorting, filters, globalFilter }) => {
          fetchUsers({
            page: pag.pageIndex + 1,
            page_size: pag.pageSize,
            search: globalFilter || undefined,
            sort_by: sorting[0]?.columnId as 'nombre' | 'apellido' | 'email' | 'created_at' | 'updated_at' | undefined,
            sort_direction: sorting[0]?.direction || undefined,
          });
        }}
      />
    </div>
  );
}

export default UsersTable;

/**
 * Tabla de usuarios con paginación y acciones
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Key,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { User } from '../../types/user.types';
import { RoleLabels, StatusLabels } from '../../types/user.types';

interface UsersTableProps {
  users: User[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onActivate?: (user: User) => void;
  onDeactivate?: (user: User) => void;
  onChangePassword?: (user: User) => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function UsersTable({
  users,
  isLoading,
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onChangePassword,
}: UsersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className='bg-card rounded-lg border border-border overflow-hidden'>
        <div className='animate-pulse'>
          <div className='h-12 bg-muted' />
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-16 border-t border-border bg-muted/50' />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className='bg-card rounded-lg border border-border p-8 text-center'>
        <p className='text-muted-foreground'>No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div className='bg-card rounded-lg border border-border overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='px-4 py-3 text-left text-sm font-medium text-muted-foreground'>
                Usuario
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-muted-foreground'>
                Documento
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-muted-foreground'>Rol</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-muted-foreground'>
                Estado
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-muted-foreground'>
                Último acceso
              </th>
              <th className='px-4 py-3 text-right text-sm font-medium text-muted-foreground'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {users.map((user) => (
              <tr key={user.id} className='hover:bg-muted/30 transition-colors'>
                <td className='px-4 py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                      <span className='text-sm font-medium text-primary'>
                        {user.first_name[0]}
                        {user.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <Link
                        to={`/usuarios/${user.id}`}
                        className='font-medium text-foreground hover:text-primary'
                      >
                        {user.first_name} {user.last_name}
                      </Link>
                      <p className='text-sm text-muted-foreground'>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className='px-4 py-4'>
                  <span className='text-sm text-foreground'>
                    {user.document_type} {user.document_number}
                  </span>
                </td>
                <td className='px-4 py-4'>
                  <span className='text-sm text-foreground'>{RoleLabels[user.role]}</span>
                </td>
                <td className='px-4 py-4'>
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      statusColors[user.status]
                    )}
                  >
                    {StatusLabels[user.status]}
                  </span>
                </td>
                <td className='px-4 py-4'>
                  <span className='text-sm text-muted-foreground'>
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Nunca'}
                  </span>
                </td>
                <td className='px-4 py-4'>
                  <div className='flex items-center justify-end gap-2'>
                    <Link
                      to={`/usuarios/${user.id}`}
                      className='p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted'
                      title='Ver detalle'
                    >
                      <Eye className='h-4 w-4' />
                    </Link>
                    <button
                      onClick={() => onEdit?.(user)}
                      className='p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted'
                      title='Editar'
                    >
                      <Edit className='h-4 w-4' />
                    </button>
                    <div className='relative'>
                      <button
                        onClick={() => toggleMenu(user.id)}
                        className='p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted'
                      >
                        <MoreVertical className='h-4 w-4' />
                      </button>
                      {openMenuId === user.id && (
                        <>
                          <div className='fixed inset-0 z-10' onClick={() => setOpenMenuId(null)} />
                          <div className='absolute right-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-20'>
                            <div className='py-1'>
                              {user.status !== 'active' && (
                                <button
                                  onClick={() => {
                                    onActivate?.(user);
                                    setOpenMenuId(null);
                                  }}
                                  className='w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted'
                                >
                                  <UserCheck className='h-4 w-4' />
                                  Activar
                                </button>
                              )}
                              {user.status === 'active' && (
                                <button
                                  onClick={() => {
                                    onDeactivate?.(user);
                                    setOpenMenuId(null);
                                  }}
                                  className='w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted'
                                >
                                  <UserX className='h-4 w-4' />
                                  Desactivar
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  onChangePassword?.(user);
                                  setOpenMenuId(null);
                                }}
                                className='w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted'
                              >
                                <Key className='h-4 w-4' />
                                Cambiar contraseña
                              </button>
                              <hr className='my-1 border-border' />
                              <button
                                onClick={() => {
                                  onDelete?.(user);
                                  setOpenMenuId(null);
                                }}
                                className='w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10'
                              >
                                <Trash2 className='h-4 w-4' />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30'>
          <p className='text-sm text-muted-foreground'>
            Página {currentPage} de {totalPages}
          </p>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className={cn(
                'p-2 rounded-md border border-border',
                hasPrevPage
                  ? 'hover:bg-muted text-foreground'
                  : 'opacity-50 cursor-not-allowed text-muted-foreground'
              )}
            >
              <ChevronLeft className='h-4 w-4' />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className={cn(
                'p-2 rounded-md border border-border',
                hasNextPage
                  ? 'hover:bg-muted text-foreground'
                  : 'opacity-50 cursor-not-allowed text-muted-foreground'
              )}
            >
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

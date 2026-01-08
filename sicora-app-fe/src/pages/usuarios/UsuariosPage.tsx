/**
 * Página de gestión de usuarios
 * Integrada con el sistema de auth y API de usuarios
 */

import { useState } from 'react';
import { Plus, Search, Filter, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useUsers, useCreateUser, useUserActions } from '../../hooks/useUsers';
import { UsersTable } from '../../components/users/UsersTable';
import { UserForm } from '../../components/users/UserForm';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
  UserStatus,
} from '../../types/user.types';
import { RoleLabels, StatusLabels } from '../../types/user.types';
import { usersApi } from '../../lib/api/users';

export function UsuariosPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Hooks
  const {
    users,
    totalUsers,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    filters,
    isLoading,
    error,
    refresh,
    search,
    filterByRole,
    filterByStatus,
    clearFilters,
    setPage,
    clearError,
  } = useUsers();

  const { create, isCreating } = useCreateUser();
  const { activate, deactivate, changePassword } = useUserActions();

  // Handlers
  const handleSearch = () => {
    search(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreateUser = async (data: CreateUserRequest | UpdateUserRequest) => {
    await create(data as CreateUserRequest);
    setShowCreateModal(false);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (data: CreateUserRequest | UpdateUserRequest) => {
    if (!selectedUser) return;
    // TODO: Implementar actualización
    console.log('Update user:', selectedUser.id, data);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`¿Está seguro de eliminar a ${user.first_name} ${user.last_name}?`)) {
      // TODO: Implementar eliminación
      console.log('Delete user:', user.id);
    }
  };

  const handleActivateUser = async (user: User) => {
    await activate(user.id);
  };

  const handleDeactivateUser = async (user: User) => {
    await deactivate(user.id);
  };

  const handleChangePassword = async (user: User) => {
    const newPassword = window.prompt('Ingrese la nueva contraseña:');
    if (newPassword && newPassword.length >= 8) {
      await changePassword(user.id, newPassword);
    } else if (newPassword) {
      alert('La contraseña debe tener al menos 8 caracteres');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await usersApi.exportUsers(filters, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al exportar:', err);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Gestión de Usuarios</h1>
          <p className='text-muted-foreground mt-1'>
            Administrar usuarios del sistema ({totalUsers} registrados)
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <button
            onClick={() => refresh()}
            className='p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted'
            title='Actualizar'
          >
            <RefreshCw className='h-5 w-5' />
          </button>
          <button
            onClick={handleExport}
            className='px-3 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-lg hover:bg-muted flex items-center gap-2'
          >
            <Download className='h-4 w-4' />
            Exportar
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className='px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className='flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
          <AlertCircle className='h-5 w-5 text-destructive' />
          <p className='text-sm text-destructive'>{error}</p>
          <button onClick={clearError} className='ml-auto text-sm text-destructive hover:underline'>
            Cerrar
          </button>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className='bg-card p-4 rounded-lg border border-border'>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-4'>
          {/* Búsqueda */}
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Buscar por nombre, email o documento...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className='w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          {/* Filtros rápidos */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='px-3 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-lg hover:bg-muted flex items-center gap-2'
            >
              <Filter className='h-4 w-4' />
              Filtros
            </button>
            <button
              onClick={handleSearch}
              className='px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90'
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className='mt-4 pt-4 border-t border-border'>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              {/* Filtro por rol */}
              <div>
                <label className='block text-sm font-medium text-foreground mb-1'>Rol</label>
                <select
                  value={filters.role || ''}
                  onChange={(e) => filterByRole((e.target.value as UserRole) || undefined)}
                  className='w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground'
                >
                  <option value=''>Todos los roles</option>
                  {Object.entries(RoleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por estado */}
              <div>
                <label className='block text-sm font-medium text-foreground mb-1'>Estado</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => filterByStatus((e.target.value as UserStatus) || undefined)}
                  className='w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground'
                >
                  <option value=''>Todos los estados</option>
                  {Object.entries(StatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón limpiar */}
              <div className='flex items-end'>
                <button
                  onClick={clearFilters}
                  className='px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground'
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de usuarios */}
      <UsersTable
        users={users}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        onPageChange={setPage}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onActivate={handleActivateUser}
        onDeactivate={handleDeactivateUser}
        onChangePassword={handleChangePassword}
      />

      {/* Modal Crear Usuario */}
      {showCreateModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='fixed inset-0 bg-black/50' onClick={() => setShowCreateModal(false)} />
          <div className='relative bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4'>
            <div className='p-6'>
              <h2 className='text-xl font-semibold text-foreground mb-6'>Crear Nuevo Usuario</h2>
              <UserForm
                onSubmit={handleCreateUser}
                onCancel={() => setShowCreateModal(false)}
                isLoading={isCreating}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {showEditModal && selectedUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
          />
          <div className='relative bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4'>
            <div className='p-6'>
              <h2 className='text-xl font-semibold text-foreground mb-6'>Editar Usuario</h2>
              <UserForm
                user={selectedUser}
                onSubmit={handleUpdateUser}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosPage;

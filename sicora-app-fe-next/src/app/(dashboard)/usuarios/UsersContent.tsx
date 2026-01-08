'use client';

import { useState, useCallback } from 'react';
import { Users, Download, Upload } from 'lucide-react';
import { UsersTable, UserFormModal, DeleteUserModal } from '@/components/users';
import { useUsers } from '@/hooks/useUsers';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user.types';

/**
 * UsersContent - Contenido de la página de usuarios
 * Componente cliente que maneja el estado y las interacciones
 */
export function UsersContent() {
  const {
    createUser,
    updateUser,
    deleteUser,
    selectedUser,
    selectUser,
    isCreating,
    isUpdating,
    isDeleting,
  } = useUsers();

  // Estados de modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Abrir modal de creación
  const handleCreate = useCallback(() => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  }, []);

  // Abrir modal de edición
  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  }, []);

  // Abrir modal de eliminación
  const handleDelete = useCallback((user: User) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  }, []);

  // Ver detalles del usuario (por ahora solo selecciona)
  const handleView = useCallback((user: User) => {
    selectUser(user);
    // TODO: Navegar a página de detalles o abrir modal de detalles
    console.log('Ver usuario:', user);
  }, [selectUser]);

  // Manejar submit del formulario
  const handleFormSubmit = useCallback(async (data: CreateUserRequest | UpdateUserRequest) => {
    if (editingUser) {
      const result = await updateUser(editingUser.id, data as UpdateUserRequest);
      if (result) {
        setIsFormModalOpen(false);
        setEditingUser(null);
      }
    } else {
      const result = await createUser(data as CreateUserRequest);
      if (result) {
        setIsFormModalOpen(false);
      }
    }
  }, [editingUser, createUser, updateUser]);

  // Confirmar eliminación
  const handleConfirmDelete = useCallback(async () => {
    if (deletingUser) {
      const success = await deleteUser(deletingUser.id);
      if (success) {
        setIsDeleteModalOpen(false);
        setDeletingUser(null);
      }
    }
  }, [deletingUser, deleteUser]);

  // Cerrar modal de formulario
  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingUser(null);
  }, []);

  // Cerrar modal de eliminación
  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setDeletingUser(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="mt-1 text-gray-500">
            Gestión de instructores, aprendices y administrativos
          </p>
        </div>

        {/* Acciones adicionales */}
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Exportar usuarios"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Importar usuarios"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar</span>
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <UsersTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreate={handleCreate}
      />

      {/* Modal de formulario */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        user={editingUser}
        isLoading={isCreating || isUpdating}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        user={deletingUser}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default UsersContent;

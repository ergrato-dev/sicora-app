'use client';

import { AlertTriangle, X, Loader2 } from 'lucide-react';
import type { User } from '@/types/user.types';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: User | null;
  isLoading?: boolean;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading = false,
}: DeleteUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Eliminar Usuario
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar al usuario{' '}
              <span className="font-semibold text-gray-900">{user.full_name}</span>?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Esta acción no se puede deshacer. El usuario perderá acceso al sistema
              y todos sus datos asociados serán eliminados permanentemente.
            </p>

            {/* Info del usuario */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email:</dt>
                  <dd className="text-gray-900 font-medium">{user.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Documento:</dt>
                  <dd className="text-gray-900 font-medium">{user.documento}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Rol:</dt>
                  <dd className="text-gray-900 font-medium capitalize">{user.rol}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Eliminar Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;

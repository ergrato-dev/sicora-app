'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, User, Mail, CreditCard, Shield, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { User as UserType, CreateUserRequest, UpdateUserRequest, UserRole } from '@/types/user.types';
import { roleOptions, UserRoleLabels } from '@/types/user.types';

// ============================================================================
// TIPOS
// ============================================================================

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  user?: UserType | null;
  isLoading?: boolean;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  email?: string;
  documento?: string;
  rol?: string;
  password?: string;
  confirmPassword?: string;
  programa_formacion?: string;
}

// ============================================================================
// VALIDACIONES
// ============================================================================

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 10) {
    return 'La contraseña debe tener al menos 10 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Debe contener al menos una mayúscula';
  }
  if (!/[a-z]/.test(password)) {
    return 'Debe contener al menos una minúscula';
  }
  if (!/[0-9]/.test(password)) {
    return 'Debe contener al menos un número';
  }
  return null;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}: UserFormModalProps) {
  const isEditing = !!user;

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    rol: 'aprendiz' as UserRole,
    password: '',
    confirmPassword: '',
    programa_formacion: '',
    ficha_id: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Cargar datos del usuario si es edición
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        documento: user.documento,
        rol: user.rol,
        password: '',
        confirmPassword: '',
        programa_formacion: user.programa_formacion,
        ficha_id: user.ficha_id || '',
        is_active: user.is_active,
      });
    } else {
      // Reset para nuevo usuario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        documento: '',
        rol: 'aprendiz',
        password: '',
        confirmPassword: '',
        programa_formacion: '',
        ficha_id: '',
        is_active: true,
      });
    }
    setErrors({});
    setTouched({});
  }, [user, isOpen]);

  // Validar campo individual
  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case 'nombre':
      case 'apellido':
        if (!value.trim()) return 'Este campo es requerido';
        if (value.length < 2) return 'Mínimo 2 caracteres';
        if (value.length > 50) return 'Máximo 50 caracteres';
        return undefined;
      case 'email':
        if (!value.trim()) return 'El email es requerido';
        if (!validateEmail(value)) return 'Email inválido';
        return undefined;
      case 'documento':
        if (!value.trim()) return 'El documento es requerido';
        if (value.length < 7 || value.length > 15) return 'Entre 7 y 15 caracteres';
        return undefined;
      case 'password':
        if (!isEditing && !value) return 'La contraseña es requerida';
        if (value) return validatePassword(value) || undefined;
        return undefined;
      case 'confirmPassword':
        if (!isEditing && !value) return 'Confirme la contraseña';
        if (value && value !== formData.password) return 'Las contraseñas no coinciden';
        return undefined;
      case 'programa_formacion':
        if (!value.trim()) return 'El programa es requerido';
        return undefined;
      default:
        return undefined;
    }
  }, [isEditing, formData.password]);

  // Manejar cambio de campo
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // Manejar blur (marcar como tocado)
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  // Validar todo el formulario
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    newErrors.nombre = validateField('nombre', formData.nombre);
    newErrors.apellido = validateField('apellido', formData.apellido);
    newErrors.email = validateField('email', formData.email);
    newErrors.documento = validateField('documento', formData.documento);
    newErrors.programa_formacion = validateField('programa_formacion', formData.programa_formacion);

    if (!isEditing) {
      newErrors.password = validateField('password', formData.password);
      newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);
    }

    setErrors(newErrors);

    // Marcar todos como tocados
    setTouched({
      nombre: true,
      apellido: true,
      email: true,
      documento: true,
      password: true,
      confirmPassword: true,
      programa_formacion: true,
    });

    return !Object.values(newErrors).some(Boolean);
  }, [formData, isEditing, validateField]);

  // Manejar submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditing) {
        const updateData: UpdateUserRequest = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          documento: formData.documento,
          rol: formData.rol,
          programa_formacion: formData.programa_formacion,
          ficha_id: formData.ficha_id || undefined,
          is_active: formData.is_active,
        };
        await onSubmit(updateData);
      } else {
        const createData: CreateUserRequest = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          documento: formData.documento,
          rol: formData.rol,
          password: formData.password,
          programa_formacion: formData.programa_formacion,
          ficha_id: formData.ficha_id || undefined,
        };
        await onSubmit(createData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  }, [formData, isEditing, validateForm, onSubmit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      'w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-primary-500',
                      errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    )}
                    placeholder="Ingrese el nombre"
                  />
                </div>
                {errors.nombre && (
                  <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      'w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-primary-500',
                      errors.apellido ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    )}
                    placeholder="Ingrese el apellido"
                  />
                </div>
                {errors.apellido && (
                  <p className="mt-1 text-xs text-red-500">{errors.apellido}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={cn(
                    'w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-primary-500',
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  )}
                  placeholder="usuario@onevision.edu.co"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Documento y Rol */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documento *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      'w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-primary-500',
                      errors.documento ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    )}
                    placeholder="Número de documento"
                  />
                </div>
                {errors.documento && (
                  <p className="mt-1 text-xs text-red-500">{errors.documento}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-primary-500 appearance-none bg-white"
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Programa y Ficha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programa de Formación *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="programa_formacion"
                    value={formData.programa_formacion}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      'w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-primary-500',
                      errors.programa_formacion ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    )}
                    placeholder="Ej: Desarrollo de Software"
                  />
                </div>
                {errors.programa_formacion && (
                  <p className="mt-1 text-xs text-red-500">{errors.programa_formacion}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ficha (Opcional)
                </label>
                <input
                  type="text"
                  name="ficha_id"
                  value={formData.ficha_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-primary-500"
                  placeholder="Número de ficha"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Contraseña (solo para creación) */}
            {!isEditing && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={cn(
                        'w-full pl-4 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-primary-500',
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      )}
                      placeholder="Mínimo 10 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sena-primary-500',
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    )}
                    placeholder="Repita la contraseña"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}

            {/* Estado (solo para edición) */}
            {isEditing && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-sena-primary-600 focus:ring-sena-primary-500"
                />
                <label className="text-sm text-gray-700">
                  Usuario activo
                </label>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sena-primary-500 text-white text-sm font-medium rounded-lg hover:bg-sena-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserFormModal;

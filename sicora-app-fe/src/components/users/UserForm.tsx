/**
 * Formulario de usuario (crear/editar)
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import type { User, CreateUserRequest, UpdateUserRequest } from '../../types/user.types';
import { UserRole, DocumentType, RoleLabels, DocumentTypeLabels } from '../../types/user.types';

// Schema de validación para crear usuario
const createUserSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Ingrese un correo válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  first_name: z.string().min(1, 'El nombre es requerido').min(2, 'Mínimo 2 caracteres'),
  last_name: z.string().min(1, 'El apellido es requerido').min(2, 'Mínimo 2 caracteres'),
  document_type: z.enum(['CC', 'TI', 'CE', 'PASSPORT'], {
    required_error: 'Seleccione el tipo de documento',
  }),
  document_number: z.string().min(1, 'El número de documento es requerido'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'coordinador', 'instructor', 'aprendiz', 'administrativo'], {
    required_error: 'Seleccione un rol',
  }),
  coordination: z.string().optional(),
  program: z.string().optional(),
  ficha: z.string().optional(),
});

// Schema para editar usuario (sin password obligatorio)
const updateUserSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido').min(2, 'Mínimo 2 caracteres'),
  last_name: z.string().min(1, 'El apellido es requerido').min(2, 'Mínimo 2 caracteres'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'coordinador', 'instructor', 'aprendiz', 'administrativo'], {
    required_error: 'Seleccione un rol',
  }),
  coordination: z.string().optional(),
  program: z.string().optional(),
  ficha: z.string().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: user
      ? {
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone || '',
          role: user.role,
          coordination: user.coordination || '',
          program: user.program || '',
          ficha: user.ficha || '',
        }
      : {
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          document_type: 'CC',
          document_number: '',
          phone: '',
          role: 'aprendiz',
          coordination: '',
          program: '',
          ficha: '',
        },
  });

  const selectedRole = watch('role');

  const handleFormSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    await onSubmit(data as CreateUserRequest | UpdateUserRequest);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Nombre */}
        <div className='space-y-2'>
          <label htmlFor='first_name' className='block text-sm font-medium text-foreground'>
            Nombre <span className='text-destructive'>*</span>
          </label>
          <input
            id='first_name'
            type='text'
            {...register('first_name')}
            className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder='Nombre'
          />
          {errors.first_name && (
            <p className='text-sm text-destructive'>{errors.first_name.message}</p>
          )}
        </div>

        {/* Apellido */}
        <div className='space-y-2'>
          <label htmlFor='last_name' className='block text-sm font-medium text-foreground'>
            Apellido <span className='text-destructive'>*</span>
          </label>
          <input
            id='last_name'
            type='text'
            {...register('last_name')}
            className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder='Apellido'
          />
          {errors.last_name && (
            <p className='text-sm text-destructive'>{errors.last_name.message}</p>
          )}
        </div>

        {/* Email - Solo para crear */}
        {!isEditing && (
          <div className='space-y-2'>
            <label htmlFor='email' className='block text-sm font-medium text-foreground'>
              Correo Electrónico <span className='text-destructive'>*</span>
            </label>
            <input
              id='email'
              type='email'
              {...register('email' as keyof CreateUserFormData)}
              className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='correo@ejemplo.com'
            />
            {(errors as { email?: { message?: string } }).email && (
              <p className='text-sm text-destructive'>
                {(errors as { email?: { message?: string } }).email?.message}
              </p>
            )}
          </div>
        )}

        {/* Contraseña - Solo para crear */}
        {!isEditing && (
          <div className='space-y-2'>
            <label htmlFor='password' className='block text-sm font-medium text-foreground'>
              Contraseña <span className='text-destructive'>*</span>
            </label>
            <input
              id='password'
              type='password'
              {...register('password' as keyof CreateUserFormData)}
              className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='Mínimo 8 caracteres'
            />
            {(errors as { password?: { message?: string } }).password && (
              <p className='text-sm text-destructive'>
                {(errors as { password?: { message?: string } }).password?.message}
              </p>
            )}
          </div>
        )}

        {/* Tipo de documento - Solo para crear */}
        {!isEditing && (
          <div className='space-y-2'>
            <label htmlFor='document_type' className='block text-sm font-medium text-foreground'>
              Tipo de Documento <span className='text-destructive'>*</span>
            </label>
            <select
              id='document_type'
              {...register('document_type' as keyof CreateUserFormData)}
              className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
            >
              {Object.entries(DocumentType).map(([key, value]) => (
                <option key={key} value={value}>
                  {DocumentTypeLabels[value]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Número de documento - Solo para crear */}
        {!isEditing && (
          <div className='space-y-2'>
            <label htmlFor='document_number' className='block text-sm font-medium text-foreground'>
              Número de Documento <span className='text-destructive'>*</span>
            </label>
            <input
              id='document_number'
              type='text'
              {...register('document_number' as keyof CreateUserFormData)}
              className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='1234567890'
            />
            {(errors as { document_number?: { message?: string } }).document_number && (
              <p className='text-sm text-destructive'>
                {(errors as { document_number?: { message?: string } }).document_number?.message}
              </p>
            )}
          </div>
        )}

        {/* Teléfono */}
        <div className='space-y-2'>
          <label htmlFor='phone' className='block text-sm font-medium text-foreground'>
            Teléfono
          </label>
          <input
            id='phone'
            type='tel'
            {...register('phone')}
            className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder='300 123 4567'
          />
        </div>

        {/* Rol */}
        <div className='space-y-2'>
          <label htmlFor='role' className='block text-sm font-medium text-foreground'>
            Rol <span className='text-destructive'>*</span>
          </label>
          <select
            id='role'
            {...register('role')}
            className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
          >
            {Object.entries(UserRole).map(([key, value]) => (
              <option key={key} value={value}>
                {RoleLabels[value]}
              </option>
            ))}
          </select>
          {errors.role && <p className='text-sm text-destructive'>{errors.role.message}</p>}
        </div>

        {/* Coordinación - Para coordinadores */}
        {selectedRole === 'coordinador' && (
          <div className='space-y-2'>
            <label htmlFor='coordination' className='block text-sm font-medium text-foreground'>
              Coordinación
            </label>
            <input
              id='coordination'
              type='text'
              {...register('coordination')}
              className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='Nombre de la coordinación'
            />
          </div>
        )}

        {/* Programa - Para instructores y aprendices */}
        {(selectedRole === 'instructor' || selectedRole === 'aprendiz') && (
          <div className='space-y-2'>
            <label htmlFor='program' className='block text-sm font-medium text-foreground'>
              Programa de Formación
            </label>
            <input
              id='program'
              type='text'
              {...register('program')}
              className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='Nombre del programa'
            />
          </div>
        )}

        {/* Ficha - Solo para aprendices */}
        {selectedRole === 'aprendiz' && (
          <div className='space-y-2'>
            <label htmlFor='ficha' className='block text-sm font-medium text-foreground'>
              Número de Ficha
            </label>
            <input
              id='ficha'
              type='text'
              {...register('ficha')}
              className='w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
              placeholder='2830024'
            />
          </div>
        )}
      </div>

      {/* Botones */}
      <div className='flex items-center justify-end gap-4 pt-4 border-t border-border'>
        <button
          type='button'
          onClick={onCancel}
          disabled={isLoading}
          className='px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-lg hover:bg-muted disabled:opacity-50'
        >
          Cancelar
        </button>
        <button
          type='submit'
          disabled={isLoading}
          className='px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2'
        >
          {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
          {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
}

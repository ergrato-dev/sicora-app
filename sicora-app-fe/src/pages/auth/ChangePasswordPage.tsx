import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Schema de validación
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(1, 'La nueva contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string().min(1, 'Confirme la contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { changePassword, isLoading, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    clearError();
    try {
      await changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
      setIsSubmitted(true);
    } catch {
      // Error ya manejado en el hook
    }
  };

  if (isSubmitted) {
    return (
      <div className='min-h-screen flex items-center justify-center p-8 bg-background'>
        <div className='w-full max-w-md space-y-8 text-center'>
          <div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
            <CheckCircle2 className='h-8 w-8 text-primary' />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>Contraseña Actualizada</h2>
          <p className='text-muted-foreground'>Su contraseña ha sido cambiada exitosamente.</p>
          <button
            onClick={() => navigate('/')}
            className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors'
          >
            Continuar al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-8 bg-background'>
      <div className='w-full max-w-md space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <div className='mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-6'>
            <KeyRound className='h-8 w-8 text-warning' />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>Cambiar Contraseña</h2>
          <p className='mt-2 text-muted-foreground'>
            {user?.status === 'pending'
              ? 'Por seguridad, debe cambiar su contraseña temporal antes de continuar.'
              : 'Actualice su contraseña de acceso al sistema.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className='flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive'>
            <AlertCircle className='h-5 w-5 flex-shrink-0' />
            <p className='text-sm'>{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Contraseña actual */}
          <div className='space-y-2'>
            <label htmlFor='currentPassword' className='block text-sm font-medium text-foreground'>
              Contraseña Actual
            </label>
            <div className='relative'>
              <input
                id='currentPassword'
                type={showCurrentPassword ? 'text' : 'password'}
                {...register('currentPassword')}
                className={`w-full px-4 py-3 pr-12 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  errors.currentPassword
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border'
                }`}
                placeholder='••••••••'
              />
              <button
                type='button'
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              >
                {showCurrentPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className='text-sm text-destructive flex items-center gap-1'>
                <AlertCircle className='h-4 w-4' />
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* Nueva contraseña */}
          <div className='space-y-2'>
            <label htmlFor='newPassword' className='block text-sm font-medium text-foreground'>
              Nueva Contraseña
            </label>
            <div className='relative'>
              <input
                id='newPassword'
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                className={`w-full px-4 py-3 pr-12 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  errors.newPassword ? 'border-destructive focus:ring-destructive' : 'border-border'
                }`}
                placeholder='••••••••'
              />
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              >
                {showNewPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
              </button>
            </div>
            {errors.newPassword && (
              <p className='text-sm text-destructive flex items-center gap-1'>
                <AlertCircle className='h-4 w-4' />
                {errors.newPassword.message}
              </p>
            )}
            {/* Indicadores */}
            <div className='text-xs text-muted-foreground space-y-1 mt-2'>
              <p>La contraseña debe contener:</p>
              <ul className='list-disc list-inside space-y-0.5'>
                <li>Al menos 8 caracteres</li>
                <li>Una letra mayúscula</li>
                <li>Una letra minúscula</li>
                <li>Un número</li>
              </ul>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className='space-y-2'>
            <label htmlFor='confirmPassword' className='block text-sm font-medium text-foreground'>
              Confirmar Nueva Contraseña
            </label>
            <div className='relative'>
              <input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={`w-full px-4 py-3 pr-12 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  errors.confirmPassword
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border'
                }`}
                placeholder='••••••••'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              >
                {showConfirmPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className='text-sm text-destructive flex items-center gap-1'>
                <AlertCircle className='h-4 w-4' />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type='submit'
            disabled={isLoading || isSubmitting}
            className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className='h-5 w-5 animate-spin' />
                Actualizando...
              </>
            ) : (
              <>
                <KeyRound className='h-5 w-5' />
                Cambiar Contraseña
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

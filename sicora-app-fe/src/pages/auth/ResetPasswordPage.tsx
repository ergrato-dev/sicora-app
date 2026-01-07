import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { authApi } from '../../lib/api/auth';

// Schema de validación
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'La contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string().min(1, 'Confirme la contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Validar que existe el token
  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center p-8 bg-background'>
        <div className='w-full max-w-md space-y-8 text-center'>
          <div className='mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center'>
            <AlertCircle className='h-8 w-8 text-destructive' />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>Enlace Inválido</h2>
          <p className='text-muted-foreground'>
            El enlace de recuperación es inválido o ha expirado. Por favor, solicite un nuevo enlace
            de recuperación.
          </p>
          <Link
            to='/forgot-password'
            className='inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors'
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    try {
      await authApi.resetPassword({
        token,
        new_password: data.password,
        confirm_password: data.confirmPassword,
      });
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña');
    }
  };

  if (isSubmitted) {
    return (
      <div className='flex min-h-screen items-center justify-center p-8 bg-background'>
        <div className='w-full max-w-md space-y-8 text-center'>
          <div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
            <CheckCircle2 className='h-8 w-8 text-primary' />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>Contraseña Actualizada</h2>
          <p className='text-muted-foreground'>
            Su contraseña ha sido actualizada exitosamente. Ahora puede iniciar sesión con su nueva
            contraseña.
          </p>
          <button
            onClick={() => navigate('/login')}
            className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors'
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center p-8 bg-background'>
      <div className='w-full max-w-md space-y-8'>
        {/* Logo */}
        <div className='text-center'>
          <div className='h-16 mx-auto mb-6 flex items-center justify-center'>
            <span className='text-3xl font-bold text-primary'>{BRAND_CONFIG.name}</span>
          </div>
          <h2 className='text-2xl font-bold text-foreground'>Nueva Contraseña</h2>
          <p className='mt-2 text-muted-foreground'>Ingrese su nueva contraseña segura.</p>
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
          {/* Nueva contraseña */}
          <div className='space-y-2'>
            <label htmlFor='password' className='block text-sm font-medium text-foreground'>
              Nueva Contraseña
            </label>
            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`w-full px-4 py-3 pr-12 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  errors.password ? 'border-destructive focus:ring-destructive' : 'border-border'
                }`}
                placeholder='••••••••'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
              >
                {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
              </button>
            </div>
            {errors.password && (
              <p className='text-sm text-destructive flex items-center gap-1'>
                <AlertCircle className='h-4 w-4' />
                {errors.password.message}
              </p>
            )}
            {/* Indicadores de seguridad */}
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
              Confirmar Contraseña
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
            disabled={isSubmitting}
            className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='h-5 w-5 animate-spin' />
                Actualizando...
              </>
            ) : (
              <>
                <KeyRound className='h-5 w-5' />
                Restablecer Contraseña
              </>
            )}
          </button>
        </form>

        {/* Volver */}
        <div className='text-center'>
          <Link
            to='/login'
            className='inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

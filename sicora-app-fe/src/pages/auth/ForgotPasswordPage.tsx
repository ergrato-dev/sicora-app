import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brand';
import { authApi } from '../../lib/api/auth';

// Schema de validación
const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Ingrese un correo válido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    try {
      await authApi.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo de recuperación');
    }
  };

  if (isSubmitted) {
    return (
      <div className='flex min-h-screen items-center justify-center p-8 bg-background'>
        <div className='w-full max-w-md space-y-8 text-center'>
          <div className='mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
            <CheckCircle2 className='h-8 w-8 text-primary' />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>Correo Enviado</h2>
          <p className='text-muted-foreground'>
            Si existe una cuenta asociada al correo ingresado, recibirá un enlace para restablecer
            su contraseña.
          </p>
          <p className='text-sm text-muted-foreground'>
            El enlace expirará en 24 horas. Si no recibe el correo, revise su carpeta de spam.
          </p>
          <Link
            to='/login'
            className='inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            Volver al inicio de sesión
          </Link>
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
          <h2 className='text-2xl font-bold text-foreground'>Recuperar Contraseña</h2>
          <p className='mt-2 text-muted-foreground'>
            Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
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
          <div className='space-y-2'>
            <label htmlFor='email' className='block text-sm font-medium text-foreground'>
              Correo Electrónico
            </label>
            <div className='relative'>
              <input
                id='email'
                type='email'
                autoComplete='email'
                {...register('email')}
                className={`w-full px-4 py-3 pl-12 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  errors.email ? 'border-destructive focus:ring-destructive' : 'border-border'
                }`}
                placeholder='usuario@ejemplo.com'
              />
              <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
            </div>
            {errors.email && (
              <p className='text-sm text-destructive flex items-center gap-1'>
                <AlertCircle className='h-4 w-4' />
                {errors.email.message}
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
                Enviando...
              </>
            ) : (
              <>
                <Mail className='h-5 w-5' />
                Enviar Enlace de Recuperación
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

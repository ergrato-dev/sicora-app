import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { BRAND_CONFIG } from '../../config/brand';

// Schema de validación con Zod
const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Ingrese un correo válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();

  // Obtener la URL de redirección si existe
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch {
      // Error ya manejado en el store
    }
  };

  return (
    <div className='flex min-h-screen'>
      {/* Panel izquierdo - Branding */}
      <div className='hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12'>
        <div className='text-center text-white max-w-md'>
          <div className='h-20 mx-auto mb-8 flex items-center justify-center'>
            <span className='text-4xl font-bold'>{BRAND_CONFIG.name}</span>
          </div>
          <h1 className='text-3xl font-bold mb-4'>{BRAND_CONFIG.subtitle}</h1>
          <p className='text-lg opacity-90'>{BRAND_CONFIG.description}</p>
          <div className='mt-8 p-6 bg-white/10 rounded-lg backdrop-blur'>
            <p className='text-sm opacity-80'>
              Sistema de Información para la gestión integral de asistencia, horarios y evaluaciones
              académicas.
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className='flex w-full lg:w-1/2 items-center justify-center p-8 bg-background'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo móvil */}
          <div className='lg:hidden text-center'>
            <div className='h-16 mx-auto mb-4 flex items-center justify-center'>
              <span className='text-2xl font-bold text-primary'>{BRAND_CONFIG.name}</span>
            </div>
          </div>

          {/* Header */}
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-foreground'>Iniciar Sesión</h2>
            <p className='mt-2 text-muted-foreground'>
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>

          {/* Error global */}
          {error && (
            <div className='flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive'>
              <AlertCircle className='h-5 w-5 flex-shrink-0' />
              <p className='text-sm'>{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Email */}
            <div className='space-y-2'>
              <label htmlFor='email' className='block text-sm font-medium text-foreground'>
                Correo Electrónico
              </label>
              <input
                id='email'
                type='email'
                autoComplete='email'
                {...register('email')}
                className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  errors.email ? 'border-destructive focus:ring-destructive' : 'border-border'
                }`}
                placeholder='usuario@ejemplo.com'
              />
              {errors.email && (
                <p className='text-sm text-destructive flex items-center gap-1'>
                  <AlertCircle className='h-4 w-4' />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className='space-y-2'>
              <label htmlFor='password' className='block text-sm font-medium text-foreground'>
                Contraseña
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
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
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
            </div>

            {/* Remember & Forgot */}
            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  {...register('remember')}
                  className='w-4 h-4 rounded border-border text-primary focus:ring-primary'
                />
                <span className='text-sm text-muted-foreground'>Recordarme</span>
              </label>
              <Link
                to='/forgot-password'
                className='text-sm text-primary hover:text-primary/80 transition-colors'
              >
                ¿Olvidó su contraseña?
              </Link>
            </div>

            {/* Submit */}
            <button
              type='submit'
              disabled={isLoading || isSubmitting}
              className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading || isSubmitting ? (
                <>
                  <Loader2 className='h-5 w-5 animate-spin' />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className='h-5 w-5' />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className='text-center text-sm text-muted-foreground'>
            <p>
              ¿Problemas para acceder?{' '}
              <Link to='/contacto-seguro' className='text-primary hover:text-primary/80'>
                Contactar soporte
              </Link>
            </p>
          </div>

          {/* Legal links */}
          <div className='text-center text-xs text-muted-foreground pt-4 border-t border-border'>
            <Link to='/legal/politica-privacidad' className='hover:text-primary'>
              Política de Privacidad
            </Link>
            <span className='mx-2'>•</span>
            <Link to='/legal/terminos-uso' className='hover:text-primary'>
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SICORA - Página de Inicio de Sesión
 *
 * Formulario de login con validación, manejo de errores
 * y redirección al dashboard según rol.
 *
 * @fileoverview Login page
 * @module app/(auth)/login/page
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { useAuthStore } from '@/stores/auth-store';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { login } = useAuthStore();

  // Estado del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Integrar con API real
      // Por ahora simulamos login exitoso para desarrollo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simular usuario según email para desarrollo
      const mockUser = {
        id: '1',
        name: email.includes('admin')
          ? 'Administrador'
          : email.includes('instructor')
          ? 'Instructor Demo'
          : 'Usuario Demo',
        email,
        role: email.includes('admin')
          ? ('admin' as const)
          : email.includes('instructor')
          ? ('instructor' as const)
          : ('aprendiz' as const),
        status: 'online' as const,
      };

      login(mockUser, 'mock-jwt-token');

      startTransition(() => {
        router.push('/dashboard');
      });
    } catch (error) {
      console.error('Error de login:', error);
      setErrors({
        general:
          'Credenciales inválidas. Por favor verifica tu correo y contraseña.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Bienvenido de vuelta</h2>
        <p className="text-gray-400">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      {/* Alerta de error general */}
      {errors.general && (
        <Alert variant="danger">
          <AlertCircle className="h-4 w-4" />
          <span>{errors.general}</span>
        </Alert>
      )}

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="email"
              type="email"
              placeholder="correo@onevision.edu.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p
              id="email-error"
              className="text-sm text-red-400"
              role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
              aria-label={
                showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }>
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p
              id="password-error"
              className="text-sm text-red-400"
              role="alert">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <label
              htmlFor="remember"
              className="text-sm text-gray-400 cursor-pointer">
              Recordarme
            </label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading || isPending}>
          {isLoading || isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-950 text-gray-500">
            ¿Necesitas ayuda?
          </span>
        </div>
      </div>

      {/* Help links */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">
          Contacta al administrador del sistema para soporte técnico
        </p>
        <Link
          href="mailto:soporte@onevision.edu.co"
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          soporte@onevision.edu.co
        </Link>
      </div>

      {/* Demo credentials hint (solo para desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-xs text-gray-400 font-medium mb-2">
            🧪 Credenciales de prueba:
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>
              <code className="text-cyan-400">admin@demo.com</code> → Rol Admin
            </li>
            <li>
              <code className="text-cyan-400">instructor@demo.com</code> → Rol
              Instructor
            </li>
            <li>
              <code className="text-cyan-400">cualquier@email.com</code> → Rol
              Aprendiz
            </li>
            <li>Contraseña: cualquier texto ≥6 caracteres</li>
          </ul>
        </div>
      )}
    </div>
  );
}

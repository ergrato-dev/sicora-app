/**
 * SICORA - Página Restablecer Contraseña
 *
 * Formulario para crear nueva contraseña usando token de reset.
 * Accesible desde enlace enviado por email.
 *
 * @fileoverview Reset password page
 * @module app/(auth)/reset-password/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  // Verificar token al cargar
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidToken(false);
        return;
      }

      // TODO: Verificar token con API
      // Por ahora simulamos que es válido
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsValidToken(true);
    };

    verifyToken();
  }, [token]);

  // Calcular fortaleza de contraseña
  const getPasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0;

    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Débil', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Media', color: 'bg-yellow-500' };
    return { score, label: 'Fuerte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'La contraseña debe ser más segura';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
      // POST /api/v1/auth/reset-password
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      setErrors({
        general:
          'No se pudo restablecer la contraseña. El enlace puede haber expirado.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargando verificación de token
  if (isValidToken === null) {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 mx-auto text-cyan-400 animate-spin" />
        <p className="text-gray-400">Verificando enlace...</p>
      </div>
    );
  }

  // Token inválido o expirado
  if (!isValidToken) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Enlace inválido o expirado
          </h2>
          <p className="text-gray-400">
            El enlace de recuperación no es válido o ha expirado. Los enlaces de
            recuperación son válidos por 24 horas.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/forgot-password">
            <Button
              variant="primary"
              size="lg"
              className="w-full">
              Solicitar nuevo enlace
            </Button>
          </Link>

          <Link href="/login">
            <Button
              variant="ghost"
              size="lg"
              className="w-full">
              Volver a iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Vista de éxito
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            ¡Contraseña restablecida!
          </h2>
          <p className="text-gray-400">
            Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar
            sesión con tu nueva contraseña.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => router.push('/login')}>
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  // Vista del formulario
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
          <ShieldCheck className="h-8 w-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Crea tu nueva contraseña
        </h2>
        <p className="text-gray-400">
          Ingresa una contraseña segura para tu cuenta
        </p>
      </div>

      {/* Error alert */}
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
        {/* Nueva contraseña */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300">
            Nueva contraseña
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
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
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

          {/* Indicador de fortaleza */}
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i <= passwordStrength.score
                        ? passwordStrength.color
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Fortaleza:{' '}
                <span
                  className={`font-medium ${
                    passwordStrength.color === 'bg-green-500'
                      ? 'text-green-400'
                      : passwordStrength.color === 'bg-yellow-500'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}>
                  {passwordStrength.label}
                </span>
              </p>
            </div>
          )}

          {errors.password && (
            <p className="text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10"
              aria-invalid={!!errors.confirmPassword}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              aria-label={
                showConfirmPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }>
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Indicador de coincidencia */}
          {confirmPassword && (
            <p
              className={`text-xs ${
                password === confirmPassword ? 'text-green-400' : 'text-red-400'
              }`}>
              {password === confirmPassword
                ? '✓ Las contraseñas coinciden'
                : '✗ Las contraseñas no coinciden'}
            </p>
          )}

          {errors.confirmPassword && (
            <p className="text-sm text-red-400">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Requisitos de contraseña */}
        <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-xs text-gray-400 mb-2">
            La contraseña debe contener:
          </p>
          <ul className="text-xs space-y-1">
            <li
              className={
                password.length >= 8 ? 'text-green-400' : 'text-gray-500'
              }>
              {password.length >= 8 ? '✓' : '○'} Al menos 8 caracteres
            </li>
            <li
              className={
                /[A-Z]/.test(password) ? 'text-green-400' : 'text-gray-500'
              }>
              {/[A-Z]/.test(password) ? '✓' : '○'} Una letra mayúscula
            </li>
            <li
              className={
                /[a-z]/.test(password) ? 'text-green-400' : 'text-gray-500'
              }>
              {/[a-z]/.test(password) ? '✓' : '○'} Una letra minúscula
            </li>
            <li
              className={
                /[0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'
              }>
              {/[0-9]/.test(password) ? '✓' : '○'} Un número
            </li>
            <li
              className={
                /[^A-Za-z0-9]/.test(password)
                  ? 'text-green-400'
                  : 'text-gray-500'
              }>
              {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} Un carácter especial
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Restableciendo...
            </>
          ) : (
            'Restablecer contraseña'
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto text-cyan-400 animate-spin" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      }>
      <ResetPasswordContent />
    </Suspense>
  );
}

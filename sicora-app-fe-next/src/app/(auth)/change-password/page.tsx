/**
 * SICORA - Página Cambio de Contraseña Obligatorio
 *
 * Formulario para usuarios que deben cambiar su contraseña
 * (primer login o contraseña expirada).
 *
 * @fileoverview Change password page
 * @module app/(auth)/change-password/page
 */

'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useAuthStore } from '@/stores/auth-store';

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const { user } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Obtener mensaje según razón
  const getReasonMessage = () => {
    switch (reason) {
      case 'first-login':
        return 'Por seguridad, debes cambiar tu contraseña en el primer inicio de sesión.';
      case 'expired':
        return 'Tu contraseña ha expirado. Por favor, crea una nueva contraseña.';
      case 'admin-reset':
        return 'El administrador ha solicitado que cambies tu contraseña.';
      default:
        return 'Actualiza tu contraseña para mantener tu cuenta segura.';
    }
  };

  // Calcular fortaleza de contraseña
  const getPasswordStrength = (pwd: string) => {
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

  const passwordStrength = getPasswordStrength(newPassword);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    if (!newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    } else if (passwordStrength.score < 3) {
      newErrors.newPassword = 'La contraseña debe ser más segura';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword =
        'La nueva contraseña debe ser diferente a la actual';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (newPassword !== confirmPassword) {
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
      // PUT /api/v1/auth/change-password
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);

      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setErrors({
        general:
          'No se pudo cambiar la contraseña. Verifica tu contraseña actual.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Vista de éxito
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            ¡Contraseña actualizada!
          </h2>
          <p className="text-gray-400">
            Tu contraseña ha sido cambiada exitosamente. Serás redirigido al
            dashboard en breve...
          </p>
        </div>

        <Loader2 className="h-6 w-6 mx-auto text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Vista del formulario
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
          <KeyRound className="h-8 w-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Cambio de contraseña</h2>
        <p className="text-gray-400">{getReasonMessage()}</p>
        {user && <p className="text-sm text-cyan-400">{user.email}</p>}
      </div>

      {/* Alerta según razón */}
      {(reason === 'first-login' || reason === 'admin-reset') && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <span>
            {reason === 'first-login'
              ? 'Este paso es obligatorio para continuar usando el sistema.'
              : 'Este cambio fue solicitado por un administrador.'}
          </span>
        </Alert>
      )}

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
        {/* Contraseña actual */}
        <div className="space-y-2">
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-300">
            Contraseña actual
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pl-10 pr-10"
              aria-invalid={!!errors.currentPassword}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400">
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-400">{errors.currentPassword}</p>
          )}
        </div>

        {/* Nueva contraseña */}
        <div className="space-y-2">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-300">
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 pr-10"
              aria-invalid={!!errors.newPassword}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400">
              {showNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Indicador de fortaleza */}
          {newPassword && (
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

          {errors.newPassword && (
            <p className="text-sm text-red-400">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300">
            Confirmar nueva contraseña
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400">
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {confirmPassword && (
            <p
              className={`text-xs ${
                newPassword === confirmPassword
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}>
              {newPassword === confirmPassword
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
          <ul className="text-xs space-y-1 grid grid-cols-2 gap-1">
            <li
              className={
                newPassword.length >= 8 ? 'text-green-400' : 'text-gray-500'
              }>
              {newPassword.length >= 8 ? '✓' : '○'} 8+ caracteres
            </li>
            <li
              className={
                /[A-Z]/.test(newPassword) ? 'text-green-400' : 'text-gray-500'
              }>
              {/[A-Z]/.test(newPassword) ? '✓' : '○'} Mayúscula
            </li>
            <li
              className={
                /[a-z]/.test(newPassword) ? 'text-green-400' : 'text-gray-500'
              }>
              {/[a-z]/.test(newPassword) ? '✓' : '○'} Minúscula
            </li>
            <li
              className={
                /[0-9]/.test(newPassword) ? 'text-green-400' : 'text-gray-500'
              }>
              {/[0-9]/.test(newPassword) ? '✓' : '○'} Número
            </li>
            <li
              className={
                /[^A-Za-z0-9]/.test(newPassword)
                  ? 'text-green-400'
                  : 'text-gray-500'
              }>
              {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '○'} Especial
            </li>
            <li
              className={
                newPassword !== currentPassword && newPassword
                  ? 'text-green-400'
                  : 'text-gray-500'
              }>
              {newPassword !== currentPassword && newPassword ? '✓' : '○'}{' '}
              Diferente
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
              Cambiando contraseña...
            </>
          ) : (
            'Cambiar contraseña'
          )}
        </Button>
      </form>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto text-cyan-400 animate-spin" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      }>
      <ChangePasswordContent />
    </Suspense>
  );
}

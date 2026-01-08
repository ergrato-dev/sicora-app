/**
 * SICORA - Componentes de Autenticación
 *
 * Componentes reutilizables para formularios de auth
 * con validación Zod y estados de carga/error.
 *
 * @fileoverview Auth components
 * @module components/auth
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';

// ============================================================================
// ESQUEMAS DE VALIDACIÓN ZOD
// ============================================================================

/**
 * Esquema de validación para login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Esquema de validación para forgot password
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Ingresa un correo electrónico válido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Esquema de validación para reset password
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Esquema de validación para change password
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ============================================================================
// COMPONENTES DE FORMULARIO
// ============================================================================

interface LoginFormProps {
  /** Callback después de login exitoso */
  onSuccess?: () => void;
  /** URL de redirección después del login */
  redirectTo?: string;
}

/**
 * Formulario de inicio de sesión
 */
export function LoginForm({
  onSuccess,
  redirectTo = '/dashboard',
}: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateAndSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();
      setValidationErrors({});

      // Validar con Zod
      const result = loginSchema.safeParse({
        email,
        password,
        remember: rememberMe,
      });

      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        return;
      }

      // Intentar login
      const success = await login({ email, password, remember: rememberMe });

      if (success) {
        onSuccess?.();
        router.push(redirectTo);
      }
    },
    [
      email,
      password,
      rememberMe,
      login,
      clearError,
      onSuccess,
      router,
      redirectTo,
    ]
  );

  return (
    <form
      onSubmit={validateAndSubmit}
      className="space-y-5">
      {/* Error general */}
      {error && (
        <Alert variant="danger">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="block text-sm font-medium text-gray-300">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            id="login-email"
            type="email"
            placeholder="correo@onevision.edu.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            aria-invalid={!!validationErrors.email}
            disabled={isLoading}
          />
        </div>
        {validationErrors.email && (
          <p className="text-sm text-red-400">{validationErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="login-password"
          className="block text-sm font-medium text-gray-300">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            aria-invalid={!!validationErrors.password}
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
        {validationErrors.password && (
          <p className="text-sm text-red-400">{validationErrors.password}</p>
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

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </Button>
    </form>
  );
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

/**
 * Indicador visual de fortaleza de contraseña
 */
export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
      return {
        score,
        label: 'Débil',
        color: 'bg-red-500',
        textColor: 'text-red-400',
      };
    if (score <= 4)
      return {
        score,
        label: 'Media',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400',
      };
    return {
      score,
      label: 'Fuerte',
      color: 'bg-green-500',
      textColor: 'text-green-400',
    };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${
              i <= strength.score ? strength.color : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Fortaleza:{' '}
        <span className={`font-medium ${strength.textColor}`}>
          {strength.label}
        </span>
      </p>
    </div>
  );
}

interface PasswordRequirementsProps {
  password: string;
  currentPassword?: string;
}

/**
 * Lista de requisitos de contraseña
 */
export function PasswordRequirements({
  password,
  currentPassword,
}: PasswordRequirementsProps) {
  const requirements = [
    { test: password.length >= 8, label: 'Al menos 8 caracteres' },
    { test: /[A-Z]/.test(password), label: 'Una letra mayúscula' },
    { test: /[a-z]/.test(password), label: 'Una letra minúscula' },
    { test: /[0-9]/.test(password), label: 'Un número' },
    { test: /[^A-Za-z0-9]/.test(password), label: 'Un carácter especial' },
  ];

  if (currentPassword !== undefined) {
    requirements.push({
      test: password !== currentPassword && password.length > 0,
      label: 'Diferente a la actual',
    });
  }

  return (
    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
      <p className="text-xs text-gray-400 mb-2">La contraseña debe contener:</p>
      <ul className="text-xs space-y-1 grid grid-cols-2 gap-1">
        {requirements.map((req, idx) => (
          <li
            key={idx}
            className={req.test ? 'text-green-400' : 'text-gray-500'}>
            {req.test ? '✓' : '○'} {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface PasswordMatchIndicatorProps {
  password: string;
  confirmPassword: string;
}

/**
 * Indicador de coincidencia de contraseñas
 */
export function PasswordMatchIndicator({
  password,
  confirmPassword,
}: PasswordMatchIndicatorProps) {
  if (!confirmPassword) return null;

  const matches = password === confirmPassword;

  return (
    <p className={`text-xs ${matches ? 'text-green-400' : 'text-red-400'}`}>
      {matches
        ? '✓ Las contraseñas coinciden'
        : '✗ Las contraseñas no coinciden'}
    </p>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export const authComponents = {
  LoginForm,
  PasswordStrengthIndicator,
  PasswordRequirements,
  PasswordMatchIndicator,
} as const;

export const authSchemas = {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} as const;

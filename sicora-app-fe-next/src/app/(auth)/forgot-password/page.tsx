/**
 * SICORA - Página Olvidé mi Contraseña
 *
 * Formulario para solicitar recuperación de contraseña.
 * Envía email con enlace de reset.
 *
 * @fileoverview Forgot password page
 * @module app/(auth)/forgot-password/page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validación del email
  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo electrónico válido');
      return false;
    }
    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      // TODO: Integrar con API real
      // POST /api/v1/auth/forgot-password
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      setError(
        'No se pudo enviar el correo de recuperación. Por favor intenta de nuevo.'
      );
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
          <h2 className="text-2xl font-bold text-white">¡Correo enviado!</h2>
          <p className="text-gray-400">
            Hemos enviado las instrucciones para restablecer tu contraseña a:
          </p>
          <p className="text-cyan-400 font-medium">{email}</p>
        </div>

        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 text-left">
          <p className="text-sm text-gray-400 mb-2">
            📧 Revisa tu bandeja de entrada
          </p>
          <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
            <li>El enlace de recuperación expira en 24 horas</li>
            <li>Si no ves el correo, revisa tu carpeta de spam</li>
            <li>Solo se puede usar una vez</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
            }}>
            Enviar a otro correo
          </Button>

          <Link href="/login">
            <Button
              variant="ghost"
              size="lg"
              className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Vista del formulario
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="text-gray-400">
          No te preocupes, ingresa tu correo electrónico y te enviaremos
          instrucciones para restablecerla.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="danger">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5">
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
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="pl-10"
              aria-invalid={!!error}
              disabled={isLoading}
              autoFocus
            />
          </div>
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
              Enviando...
            </>
          ) : (
            'Enviar instrucciones'
          )}
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}

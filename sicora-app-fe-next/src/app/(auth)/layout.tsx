/**
 * SICORA - Layout de Autenticación
 *
 * Layout sin sidebar/header para páginas de auth.
 * Diseño centrado con branding OneVision.
 *
 * @fileoverview Auth layout
 * @module app/(auth)/layout
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SICORA - Autenticación',
  description:
    'Sistema Integrado de Gestión de Competencias y Resultados de Aprendizaje',
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header con logo */}
      <header className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">SICORA</h1>
            <p className="text-gray-400 text-xs">OneVision</p>
          </div>
        </div>
      </header>

      {/* Contenido principal centrado */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} SICORA - OneVision. Todos los derechos
          reservados.
        </p>
      </footer>

      {/* Decoración de fondo */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

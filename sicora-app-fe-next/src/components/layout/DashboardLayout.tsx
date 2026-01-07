'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/utils/cn';

/**
 * DashboardLayout - Layout principal para páginas autenticadas
 * Combina Sidebar + Header + Contenido
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <Sidebar className="hidden lg:flex" />

      {/* Sidebar - Mobile (overlay) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar móvil */}
          <Sidebar className="fixed inset-y-0 left-0 z-50 lg:hidden" />
        </>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

        {/* Footer simple */}
        <footer className="border-t border-gray-200 bg-white py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>© 2026 SICORA - Sistema de Coordinación Académica</p>
            <p>OneVision • Sede Formación</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

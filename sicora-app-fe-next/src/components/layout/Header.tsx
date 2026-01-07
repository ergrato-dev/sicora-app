'use client';

import { Bell, Search, Menu, User } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Header - Barra superior institucional SICORA
 * Incluye búsqueda, notificaciones y menú de usuario
 */

interface HeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

export function Header({ className, onMenuClick }: HeaderProps) {
  return (
    <header
      className={cn(
        'h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6',
        className
      )}>
      {/* Lado izquierdo: Menú móvil + Búsqueda */}
      <div className="flex items-center gap-4">
        {/* Botón menú móvil */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Barra de búsqueda */}
        <div className="hidden sm:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar usuarios, horarios, evaluaciones..."
              className={cn(
                'w-64 lg:w-96 pl-10 pr-4 py-2 rounded-lg',
                'bg-gray-50 border border-gray-200',
                'placeholder-gray-400 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent',
                'transition-all'
              )}
            />
          </div>
        </div>
      </div>

      {/* Lado derecho: Notificaciones + Usuario */}
      <div className="flex items-center gap-2">
        {/* Botón de búsqueda móvil */}
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Buscar">
          <Search className="w-5 h-5 text-gray-600" />
        </button>

        {/* Notificaciones */}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notificaciones">
          <Bell className="w-5 h-5 text-gray-600" />
          {/* Badge de notificaciones */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Separador */}
        <div className="hidden sm:block w-px h-6 bg-gray-200 mx-2" />

        {/* Usuario */}
        <button
          className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menú de usuario">
          <div className="w-8 h-8 bg-sena-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-sena-primary-600" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900">Admin Demo</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </button>
      </div>
    </header>
  );
}

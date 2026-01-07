import { Metadata } from 'next';
import { Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Configuración - SICORA',
  description: 'Configuración del sistema',
};

/**
 * Configuración - Página de configuración del sistema
 */
export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-gray-500">Ajustes y preferencias del sistema</p>
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900">
          Módulo en desarrollo
        </h2>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          La migración de este módulo a Next.js está en progreso. Próximamente
          disponible.
        </p>
      </div>
    </div>
  );
}

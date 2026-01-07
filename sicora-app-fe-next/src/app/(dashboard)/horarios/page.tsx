import { Metadata } from 'next';
import { Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Horarios - SICORA',
  description: 'Gestión de horarios académicos',
};

/**
 * Horarios - Página de gestión de horarios
 */
export default function HorariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horarios</h1>
          <p className="mt-1 text-gray-500">
            Programación y asignación de horarios académicos
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-sena-primary-500 text-white rounded-lg hover:bg-sena-primary-600 transition-colors">
          <Calendar className="w-4 h-4" />
          Nuevo Horario
        </button>
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900">
          Módulo en desarrollo
        </h2>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          La migración de este módulo a Next.js está en progreso. Próximamente
          disponible con calendario interactivo.
        </p>
      </div>
    </div>
  );
}

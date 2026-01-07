import { Metadata } from 'next';
import { ClipboardCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Evaluaciones - SICORA',
  description: 'Gestión de evaluaciones académicas',
};

/**
 * Evaluaciones - Página de gestión de evaluaciones
 */
export default function EvaluacionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluaciones</h1>
          <p className="mt-1 text-gray-500">
            Registro y seguimiento de evaluaciones
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-sena-primary-500 text-white rounded-lg hover:bg-sena-primary-600 transition-colors">
          <ClipboardCheck className="w-4 h-4" />
          Nueva Evaluación
        </button>
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900">
          Módulo en desarrollo
        </h2>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          La migración de este módulo a Next.js está en progreso. Próximamente
          disponible con sistema de rúbricas.
        </p>
      </div>
    </div>
  );
}

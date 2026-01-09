import type { Metadata } from 'next';
import Link from 'next/link';
import { WifiOff, Home, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sin Conexión | SICORA',
  description: 'No hay conexión a internet',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Sin conexión a internet
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Parece que no tienes conexión a internet. Algunas funciones pueden no estar disponibles.
          Los cambios que realices se guardarán localmente y se sincronizarán cuando vuelvas a conectarte.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
          <h2 className="font-medium text-blue-800 mb-2">
            Funciones disponibles sin conexión:
          </h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ Ver datos previamente cargados</li>
            <li>✓ Registrar asistencia (se sincronizará después)</li>
            <li>✓ Consultar horarios guardados</li>
            <li>✓ Ver información de estudiantes en cache</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-400">
          SICORA - Sistema de Control y Registro Académico
        </p>
      </div>
    </div>
  );
}

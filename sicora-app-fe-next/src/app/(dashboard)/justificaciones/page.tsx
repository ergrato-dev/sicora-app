/**
 * SICORA - Página de Justificaciones
 *
 * Wrapper de página Next.js con metadata para la página de justificaciones.
 *
 * @fileoverview Justifications page wrapper
 * @module app/(dashboard)/justificaciones/page
 */

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import JustificacionesContent from './JustificacionesContent';

export const metadata = {
  title: 'Justificaciones | SICORA',
  description: 'Gestión de justificaciones de ausencias',
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
    </div>
  );
}

export default function JustificacionesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <JustificacionesContent />
    </Suspense>
  );
}

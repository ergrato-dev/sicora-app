/**
 * SICORA - Página de Alertas
 *
 * Wrapper de página Next.js con metadata para la página de alertas.
 *
 * @fileoverview Alerts page wrapper
 * @module app/(dashboard)/alertas/page
 */

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AlertasContent from './AlertasContent';

export const metadata = {
  title: 'Alertas | SICORA',
  description: 'Centro de notificaciones y alertas del sistema',
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
    </div>
  );
}

export default function AlertasPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AlertasContent />
    </Suspense>
  );
}

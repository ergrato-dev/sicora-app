import { Metadata } from 'next';
import EvaluacionesContent from './EvaluacionesContent';

export const metadata: Metadata = {
  title: 'Evaluaciones - SICORA',
  description: 'Gestión de evaluaciones y rúbricas por competencias',
};

/**
 * Evaluaciones - Página de gestión de evaluaciones
 */
export default function EvaluacionesPage() {
  return <EvaluacionesContent />;
}

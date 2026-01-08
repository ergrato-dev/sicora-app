import { Metadata } from 'next';
import { AsistenciaContent } from './AsistenciaContent';

export const metadata: Metadata = {
  title: 'Asistencia - SICORA',
  description: 'Registro y control de asistencia académica',
};

/**
 * Asistencia - Página de gestión de asistencia
 *
 * Server Component que renderiza el contenido client-side
 * para el módulo de asistencia con registro QR.
 */
export default function AsistenciaPage() {
  return <AsistenciaContent />;
}

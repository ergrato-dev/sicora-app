import { Metadata } from 'next';
import { HorariosContent } from './HorariosContent';

export const metadata: Metadata = {
  title: 'Horarios - SICORA',
  description: 'Gestión de horarios académicos',
};

/**
 * Horarios - Página de gestión de horarios
 *
 * Server Component que renderiza el contenido client-side
 * para el módulo de calendario/horarios.
 */
export default function HorariosPage() {
  return <HorariosContent />;
}

import { Metadata } from 'next';
import { DashboardContent } from './DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard - SICORA',
  description: 'Panel principal del Sistema de Coordinación Académica',
};

/**
 * Dashboard - Página principal del sistema
 * Server Component que renderiza el contenido del dashboard
 */
export default function DashboardPage() {
  return <DashboardContent />;
}

import { Metadata } from 'next';
import ConfiguracionContent from './ConfiguracionContent';

export const metadata: Metadata = {
  title: 'Configuración - SICORA',
  description: 'Configuración del sistema y preferencias de usuario',
};

/**
 * Configuración - Página de configuración del sistema
 */
export default function ConfiguracionPage() {
  return <ConfiguracionContent />;
}

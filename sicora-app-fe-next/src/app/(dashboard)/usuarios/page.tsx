import { Metadata } from 'next';
import { UsersContent } from './UsersContent';

export const metadata: Metadata = {
  title: 'Usuarios - SICORA',
  description: 'Gestión de usuarios del sistema',
};

/**
 * Usuarios - Página de gestión de usuarios
 */
export default function UsuariosPage() {
  return <UsersContent />;
}

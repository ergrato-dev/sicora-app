import { useState } from 'react';
import { Button } from './Button';
import { cn } from '../utils/cn';

/**
 * SecureContactLink - Componente seguro para mostrar información de contacto
 * Evita harvesting de correos y mejora la experiencia de usuario
 */

interface SecureContactLinkProps {
  /** Tipo de contacto a mostrar */
  type?: 'email' | 'support' | 'docs';
  /** Clase CSS adicional */
  className?: string;
  /** Mostrar como botón en lugar de enlace */
  variant?: 'link' | 'button';
  /** Texto del enlace/botón */
  children?: React.ReactNode;
}

// Configuración de contactos codificados
const CONTACT_CONFIG = {
  email: {
    // Base64 encoded para "demo@ejemplo.local"
    encoded: 'ZGVtb0BlamVtcGxvLmxvY2Fs',
    label: '📧 Contacto Demo',
    description: 'Correo de demostración (no funcional)',
  },
  support: {
    encoded: 'c29wb3J0ZUBlamVtcGxvLmxvY2Fs', // "soporte@ejemplo.local"
    label: '💬 Soporte Técnico',
    description: 'Soporte de demostración (no funcional)',
  },
  docs: {
    encoded: 'ZG9jc0BlamVtcGxvLmxvY2Fs', // "docs@ejemplo.local"
    label: '📚 Documentación',
    description: 'Documentación de demostración (no funcional)',
  },
} as const;

export function SecureContactLink({
  type = 'email',
  className,
  variant = 'link',
  children,
}: SecureContactLinkProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const config = CONTACT_CONFIG[type];

  const handleReveal = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      setShowWarning(true);

      // Ocultar warning después de 3 segundos
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  const getDecodedEmail = () => {
    try {
      return atob(config.encoded);
    } catch {
      return 'demo@ejemplo.local';
    }
  };

  if (variant === 'button') {
    return (
      <div className={cn('space-y-2', className)}>
        <Button
          variant='outline'
          size='sm'
          onClick={handleReveal}
          className='text-sena-neutral-700 border-sena-secondary-200 hover:bg-sena-secondary-50'
        >
          {children || config.label}
        </Button>

        {isRevealed && (
          <div className='space-y-1'>
            <p className='text-sm text-sena-neutral-600'>
              <code className='bg-sena-secondary-50 px-2 py-1 rounded text-xs'>
                {getDecodedEmail()}
              </code>
            </p>
            {showWarning && (
              <p className='text-xs text-sena-neutral-500 italic'>⚠️ {config.description}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center space-x-2', className)}>
      {!isRevealed ? (
        <button
          onClick={handleReveal}
          className='text-sena-neutral-700 hover:text-sena-neutral-900 underline transition-colors text-sm'
        >
          {children || config.label}
        </button>
      ) : (
        <div className='space-y-1'>
          <div className='bg-sena-secondary-50 border border-sena-secondary-200 rounded px-2 py-1 inline-block'>
            <code className='text-sena-neutral-700 text-sm'>{getDecodedEmail()}</code>
            <span className='text-xs text-sena-neutral-500 ml-2'>(Demo - No funcional)</span>
          </div>
          {showWarning && (
            <p className='text-xs text-sena-neutral-500 italic'>⚠️ {config.description}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SecureContactLink;

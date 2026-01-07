import { cn } from '../utils/cn';

/**
 * UserAvatar Component - Avatar de usuario con iniciales e imagen
 * Componente base para mostrar la identidad del usuario
 */

interface UserAvatarProps {
  /** Nombre del usuario para generar iniciales */
  name?: string;
  /** URL de la imagen del usuario */
  src?: string;
  /** Tamaño del avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Estado online/offline */
  status?: 'online' | 'offline' | 'away' | 'busy';
  /** Clase CSS adicional */
  className?: string;
  /** Si es clickeable */
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusClasses = {
  online: 'bg-green-500 border-green-600',
  offline: 'bg-gray-400 border-gray-500',
  away: 'bg-yellow-500 border-yellow-600',
  busy: 'bg-red-500 border-red-600',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('');
}

export function UserAvatar({
  name = 'Usuario',
  src,
  size = 'md',
  status,
  className,
  onClick,
}: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full bg-gradient-to-br from-sena-primary-600 to-sena-primary-700 text-white font-sena-heading font-semibold overflow-hidden transition-all duration-150 shadow-sm',
          sizeClasses[size],
          onClick && 'cursor-pointer hover:scale-105 hover:shadow-md'
        )}
        onClick={onClick}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className='w-full h-full object-cover'
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className='select-none'>{initials}</span>
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { UserAvatar } from './UserAvatar';
import { RoleBadge } from './RoleBadge';
import { Button } from './Button';
import { cn } from '../utils/cn';

/**
 * UserMenu Component - Menú desplegable del usuario con avatar
 * Incluye información del usuario y opciones de navegación
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'aprendiz' | 'coordinador' | 'administrativo';
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  coordination?: string;
  ficha?: string;
}

interface MenuItem {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface UserMenuProps {
  /** Datos del usuario */
  user: User;
  /** Items del menú personalizado */
  menuItems?: MenuItem[];
  /** Callback para logout */
  onLogout: () => void;
  /** Callback para ir al perfil */
  onProfile: () => void;
  /** Callback para configuración */
  onSettings?: () => void;
  /** Clase CSS adicional */
  className?: string;
}

const defaultMenuItems = (role: User['role']): MenuItem[] => {
  const common: MenuItem[] = [
    {
      label: 'Mi Perfil',
      icon: '👤',
      onClick: () => console.log('Perfil'),
    },
    {
      label: 'Configuración',
      icon: '⚙️',
      onClick: () => console.log('Configuración'),
    },
    {
      label: 'Ayuda',
      icon: '❓',
      onClick: () => console.log('Ayuda'),
    },
    {
      label: '',
      icon: '',
      onClick: () => {},
      divider: true,
    },
  ];

  // Items específicos por rol
  const roleSpecific: Record<User['role'], MenuItem[]> = {
    admin: [
      {
        label: 'Panel Admin',
        icon: '🔧',
        onClick: () => console.log('Panel Admin'),
      },
      {
        label: 'Usuarios',
        icon: '👥',
        onClick: () => console.log('Usuarios'),
      },
      {
        label: 'Reportes',
        icon: '📊',
        onClick: () => console.log('Reportes'),
      },
    ],
    instructor: [
      {
        label: 'Mis Clases',
        icon: '📚',
        onClick: () => console.log('Mis Clases'),
      },
      {
        label: 'Asistencia',
        icon: '✅',
        onClick: () => console.log('Asistencia'),
      },
      {
        label: 'Evaluaciones',
        icon: '📝',
        onClick: () => console.log('Evaluaciones'),
      },
    ],
    aprendiz: [
      {
        label: 'Mi Horario',
        icon: '📅',
        onClick: () => console.log('Mi Horario'),
      },
      {
        label: 'Mi Asistencia',
        icon: '📊',
        onClick: () => console.log('Mi Asistencia'),
      },
      {
        label: 'Mis Notas',
        icon: '📈',
        onClick: () => console.log('Mis Notas'),
      },
    ],
    coordinador: [
      {
        label: 'Mi Coordinación',
        icon: '🏛️',
        onClick: () => console.log('Mi Coordinación'),
      },
      {
        label: 'Horarios',
        icon: '📅',
        onClick: () => console.log('Horarios'),
      },
      {
        label: 'Reportes',
        icon: '📋',
        onClick: () => console.log('Reportes'),
      },
    ],
    administrativo: [
      {
        label: 'Supervisión',
        icon: '👁️',
        onClick: () => console.log('Supervisión'),
      },
      {
        label: 'Reportes',
        icon: '📊',
        onClick: () => console.log('Reportes'),
      },
    ],
  };

  return [...roleSpecific[role], ...common];
};

export function UserMenu({
  user,
  menuItems,
  onLogout,
  onProfile,
  onSettings,
  className,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = menuItems || defaultMenuItems(user.role);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;

    // Usar las funciones callback apropiadas según el label
    if (item.label === 'Mi Perfil' && onProfile) {
      onProfile();
    } else if (item.label === 'Configuración' && onSettings) {
      onSettings();
    } else if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* Avatar trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sena-primary-500 focus:ring-offset-2'
      >
        <UserAvatar name={user.name} src={user.avatar} size='md' status={user.status} />
        <div className='hidden md:block text-left'>
          <div className='text-sm font-sena-heading font-semibold text-gray-900'>
            {user.name.split(' ')[0]}
          </div>
          <div className='text-xs text-gray-600 font-sena-body'>
            {user.coordination || user.ficha || 'SENA'}
          </div>
        </div>
        <svg
          className={cn(
            'hidden md:block w-4 h-4 text-gray-500 transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
          {/* User info header */}
          <div className='px-4 py-3 border-b border-gray-100'>
            <div className='flex items-center space-x-3'>
              <UserAvatar name={user.name} src={user.avatar} size='lg' status={user.status} />
              <div className='flex-1 min-w-0'>
                <div className='text-sm font-sena-heading font-semibold text-gray-900 truncate'>
                  {user.name}
                </div>
                <div className='text-xs text-gray-500 font-sena-body truncate'>{user.email}</div>
                <div className='mt-1'>
                  <RoleBadge role={user.role} size='sm' variant='soft' />
                </div>
              </div>
            </div>
            {(user.coordination || user.ficha) && (
              <div className='mt-2 text-xs text-gray-600 font-sena-body'>
                {user.coordination && `📍 ${user.coordination}`}
                {user.ficha && ` • 🎓 ${user.ficha}`}
              </div>
            )}
          </div>

          {/* Menu items */}
          <div className='py-1'>
            {items.map((item, index) => {
              if (item.divider) {
                return <hr key={index} className='my-2 border-gray-100' />;
              }

              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm font-sena-body transition-colors duration-150',
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className='flex items-center space-x-3'>
                    <span className='w-5 text-center'>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}

            {/* Logout button */}
            <hr className='my-2 border-gray-100' />
            <Button
              variant='ghost'
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className='w-full justify-start px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50'
            >
              <span className='w-5 text-center'>🚪</span>
              <span className='ml-3'>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

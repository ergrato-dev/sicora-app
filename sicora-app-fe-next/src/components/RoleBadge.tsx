import { cn } from '../utils/cn';

/**
 * RoleBadge Component - Badge para mostrar el rol del usuario
 * Diseño institucional SENA con colores diferenciados
 */

interface RoleBadgeProps {
  /** Rol del usuario */
  role: 'admin' | 'instructor' | 'aprendiz' | 'coordinador' | 'administrativo';
  /** Tamaño del badge */
  size?: 'sm' | 'md' | 'lg';
  /** Variante de estilo */
  variant?: 'solid' | 'outline' | 'soft';
  /** Clase CSS adicional */
  className?: string;
}

const roleConfig = {
  admin: {
    label: 'Administrador',
    colors: {
      solid: 'bg-red-600 text-white border-red-600',
      outline: 'border-red-600 text-red-600 bg-transparent',
      soft: 'bg-red-50 text-red-700 border-red-200',
    },
    icon: '👑',
  },
  instructor: {
    label: 'Instructor',
    colors: {
      solid: 'bg-sena-primary-600 text-white border-sena-primary-600',
      outline: 'border-sena-primary-600 text-sena-primary-600 bg-transparent',
      soft: 'bg-sena-primary-50 text-sena-primary-700 border-sena-primary-200',
    },
    icon: '👨‍🏫',
  },
  aprendiz: {
    label: 'Aprendiz',
    colors: {
      solid: 'bg-blue-600 text-white border-blue-600',
      outline: 'border-blue-600 text-blue-600 bg-transparent',
      soft: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    icon: '🎓',
  },
  coordinador: {
    label: 'Coordinador',
    colors: {
      solid: 'bg-sena-secondary-600 text-white border-sena-secondary-600',
      outline: 'border-sena-secondary-600 text-sena-secondary-600 bg-transparent',
      soft: 'bg-sena-secondary-50 text-sena-secondary-700 border-sena-secondary-200',
    },
    icon: '📋',
  },
  administrativo: {
    label: 'Administrativo',
    colors: {
      solid: 'bg-purple-600 text-white border-purple-600',
      outline: 'border-purple-600 text-purple-600 bg-transparent',
      soft: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    icon: '🏢',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function RoleBadge({ role, size = 'sm', variant = 'solid', className }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-sena-body font-medium',
        sizeClasses[size],
        config.colors[variant],
        className
      )}
    >
      <span className='leading-none'>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

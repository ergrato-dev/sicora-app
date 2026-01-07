import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { ChevronRight } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'purple' | 'blue' | 'orange';
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    bg: 'bg-card hover:bg-muted/50',
    iconBg: 'bg-muted',
    iconText: 'text-muted-foreground',
    border: 'border-border',
  },
  primary: {
    bg: 'bg-card hover:bg-primary/5',
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    border: 'border-primary/20 hover:border-primary/40',
  },
  success: {
    bg: 'bg-card hover:bg-green-50 dark:hover:bg-green-950/20',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconText: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800 hover:border-green-400',
  },
  warning: {
    bg: 'bg-card hover:bg-yellow-50 dark:hover:bg-yellow-950/20',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconText: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800 hover:border-yellow-400',
  },
  purple: {
    bg: 'bg-card hover:bg-purple-50 dark:hover:bg-purple-950/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconText: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800 hover:border-purple-400',
  },
  blue: {
    bg: 'bg-card hover:bg-blue-50 dark:hover:bg-blue-950/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconText: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800 hover:border-blue-400',
  },
  orange: {
    bg: 'bg-card hover:bg-orange-50 dark:hover:bg-orange-950/20',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconText: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800 hover:border-orange-400',
  },
};

/**
 * Componente de tarjeta de acción rápida para el dashboard
 */
export function QuickActionCard({
  title,
  description,
  icon,
  href,
  variant = 'default',
  disabled = false,
  className,
}: QuickActionCardProps) {
  const styles = variantStyles[variant];

  if (disabled) {
    return (
      <div
        className={cn(
          'p-6 rounded-lg border shadow-sm opacity-50 cursor-not-allowed',
          'bg-muted/30 border-border',
          className
        )}
      >
        <div className='flex items-start gap-4'>
          <div className='p-3 rounded-lg bg-muted'>
            <div className='h-6 w-6 text-muted-foreground'>{icon}</div>
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-foreground'>{title}</h3>
            <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>{description}</p>
            <p className='text-xs text-muted-foreground mt-2'>No disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={href}
      className={cn(
        'block p-6 rounded-lg border shadow-sm transition-all',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20',
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className='flex items-start gap-4'>
        <div className={cn('p-3 rounded-lg flex-shrink-0', styles.iconBg)}>
          <div className={cn('h-6 w-6', styles.iconText)}>{icon}</div>
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold text-foreground'>{title}</h3>
            <ChevronRight className='h-5 w-5 text-muted-foreground' />
          </div>
          <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>{description}</p>
        </div>
      </div>
    </Link>
  );
}

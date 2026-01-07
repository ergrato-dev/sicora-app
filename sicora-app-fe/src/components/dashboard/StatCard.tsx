import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: {
    bg: 'bg-card',
    iconBg: 'bg-muted',
    iconText: 'text-muted-foreground',
    border: 'border-border',
  },
  primary: {
    bg: 'bg-primary/5',
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    border: 'border-primary/20',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconText: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconText: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconText: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
};

/**
 * Componente de tarjeta de estadística para el dashboard
 */
export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'p-6 rounded-lg border shadow-sm transition-all hover:shadow-md',
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className='flex items-start justify-between'>
        <div className='space-y-2'>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <p className='text-3xl font-bold text-foreground'>{value}</p>
          {description && <p className='text-sm text-muted-foreground'>{description}</p>}
          {trend && (
            <div className='flex items-center gap-1'>
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className='text-xs text-muted-foreground'>vs mes anterior</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-lg', styles.iconBg)}>
            <div className={cn('h-6 w-6', styles.iconText)}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}

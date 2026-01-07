import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { alertVariants, alertTitleVariants, alertDescriptionVariants } from './alert-variants';

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  closable?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      size,
      title,
      description,
      icon,
      onClose,
      closable = false,
      children,
      ...props
    },
    ref
  ) => {
    // Iconos por defecto según la variante
    const defaultIcons = {
      success: (
        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      ),
      warning: (
        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      ),
      danger: (
        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      ),
      info: (
        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      ),
      primary: (
        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      ),
      default: (
        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      ),
    };

    const displayIcon = icon || (variant ? defaultIcons[variant] : defaultIcons.default);

    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant, size }), className)}
        role='alert'
        {...props}
      >
        {displayIcon}

        <div className='flex-1'>
          {title && <h5 className={cn(alertTitleVariants({ size }))}>{title}</h5>}

          {description && (
            <div className={cn(alertDescriptionVariants({ size }))}>{description}</div>
          )}

          {children && !description && (
            <div className={cn(alertDescriptionVariants({ size }))}>{children}</div>
          )}
        </div>

        {closable && (
          <button
            type='button'
            className='absolute right-3 top-3 rounded-md p-1 text-current opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2'
            onClick={onClose}
            aria-label='Cerrar alerta'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };

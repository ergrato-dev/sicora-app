import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { badgeVariants } from './badge-variants';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRemove?: () => void;
  removable?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      leftIcon,
      rightIcon,
      onRemove,
      removable = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isInteractive = Boolean(interactive || onClick || removable);

    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({
            variant,
            size,
            interactive: isInteractive,
          }),
          className
        )}
        onClick={onClick}
        {...props}
      >
        {leftIcon && <span className='mr-1 flex items-center'>{leftIcon}</span>}

        {children}

        {rightIcon && !removable && <span className='ml-1 flex items-center'>{rightIcon}</span>}

        {removable && (
          <button
            type='button'
            className='ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-black/20'
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            aria-label='Remover'
          >
            <svg className='h-2 w-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={3}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };

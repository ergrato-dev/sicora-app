import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import {
  spinnerVariants,
  progressSpinnerVariants,
  pulseSpinnerVariants,
  dotsSpinnerVariants,
  dotVariants,
} from './spinner-variants';

// Basic Spinner Component
export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, speed, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant, speed }), className)}
        role='status'
        aria-label={label || 'Cargando...'}
        {...props}
      >
        <span className='sr-only'>{label || 'Cargando...'}</span>
      </div>
    );
  }
);
Spinner.displayName = 'Spinner';

// Progress Spinner with percentage
export interface ProgressSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressSpinnerVariants> {
  progress?: number; // 0-100
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  strokeWidth?: number;
  showPercentage?: boolean;
  label?: string;
}

const ProgressSpinner = React.forwardRef<HTMLDivElement, ProgressSpinnerProps>(
  (
    {
      className,
      size,
      progress = 0,
      variant = 'default',
      strokeWidth = 2,
      showPercentage = false,
      label,
      ...props
    },
    ref
  ) => {
    const sizeMap = {
      xs: 12,
      sm: 16,
      default: 24,
      lg: 32,
      xl: 40,
      '2xl': 48,
    };

    const currentSize = sizeMap[size || 'default'];
    const radius = (currentSize - strokeWidth * 2) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const colorMap = {
      default: 'stroke-gray-400',
      primary: 'stroke-sena-primary-500',
      secondary: 'stroke-sena-secondary-500',
      success: 'stroke-green-500',
      warning: 'stroke-yellow-500',
      danger: 'stroke-red-500',
    };

    const bgColorMap = {
      default: 'stroke-gray-200',
      primary: 'stroke-sena-primary-200',
      secondary: 'stroke-sena-secondary-200',
      success: 'stroke-green-200',
      warning: 'stroke-yellow-200',
      danger: 'stroke-red-200',
    };

    return (
      <div
        ref={ref}
        className={cn(progressSpinnerVariants({ size }), className)}
        role='progressbar'
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progreso: ${progress}%`}
        {...props}
      >
        <svg
          width={currentSize}
          height={currentSize}
          viewBox={`0 0 ${currentSize} ${currentSize}`}
          className='transform -rotate-90'
        >
          {/* Background circle */}
          <circle
            cx={currentSize / 2}
            cy={currentSize / 2}
            r={radius}
            fill='none'
            className={bgColorMap[variant]}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={currentSize / 2}
            cy={currentSize / 2}
            r={radius}
            fill='none'
            className={cn(colorMap[variant], 'transition-all duration-300 ease-in-out')}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        {showPercentage && (
          <span className='absolute inset-0 flex items-center justify-center text-xs font-medium'>
            {Math.round(progress)}%
          </span>
        )}
      </div>
    );
  }
);
ProgressSpinner.displayName = 'ProgressSpinner';

// Pulse Spinner
export interface PulseSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pulseSpinnerVariants> {
  label?: string;
}

const PulseSpinner = React.forwardRef<HTMLDivElement, PulseSpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pulseSpinnerVariants({ size, variant }), className)}
        role='status'
        aria-label={label || 'Cargando...'}
        {...props}
      >
        <span className='sr-only'>{label || 'Cargando...'}</span>
      </div>
    );
  }
);
PulseSpinner.displayName = 'PulseSpinner';

// Dots Spinner
export interface DotsSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dotsSpinnerVariants> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  dotCount?: number;
  label?: string;
}

const DotsSpinner = React.forwardRef<HTMLDivElement, DotsSpinnerProps>(
  ({ className, size, variant = 'default', dotCount = 3, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(dotsSpinnerVariants({ size }), className)}
        role='status'
        aria-label={label || 'Cargando...'}
        {...props}
      >
        {Array.from({ length: dotCount }).map((_, index) => (
          <div
            key={index}
            className={cn(dotVariants({ size, variant }), 'animate-bounce')}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
        <span className='sr-only'>{label || 'Cargando...'}</span>
      </div>
    );
  }
);
DotsSpinner.displayName = 'DotsSpinner';

// Spinner with Text
export interface SpinnerWithTextProps extends SpinnerProps {
  text?: string;
  textPosition?: 'below' | 'right';
  textClassName?: string;
}

const SpinnerWithText = React.forwardRef<HTMLDivElement, SpinnerWithTextProps>(
  (
    { className, text = 'Cargando...', textPosition = 'below', textClassName, ...spinnerProps },
    ref
  ) => {
    const isHorizontal = textPosition === 'right';

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          isHorizontal ? 'flex-row space-x-2' : 'flex-col space-y-2',
          className
        )}
      >
        <Spinner {...spinnerProps} />
        <span className={cn('text-sm text-gray-600', textClassName)}>{text}</span>
      </div>
    );
  }
);
SpinnerWithText.displayName = 'SpinnerWithText';

export { Spinner, ProgressSpinner, PulseSpinner, DotsSpinner, SpinnerWithText };

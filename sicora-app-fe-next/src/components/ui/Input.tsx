import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { inputVariants, labelVariants, helperTextVariants } from './input-variants';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helperText,
      errorMessage,
      successMessage,
      leftIcon,
      rightIcon,
      isRequired = false,
      id,
      ...props
    },
    ref
  ) => {
    // Determinar el estado visual basado en los mensajes
    const currentVariant = errorMessage ? 'error' : successMessage ? 'success' : variant;
    const displayMessage = errorMessage || successMessage || helperText;
    const messageVariant = errorMessage ? 'error' : successMessage ? 'success' : 'default';

    // Generar ID único si no se proporciona
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(labelVariants({ variant: currentVariant, required: isRequired }))}
          >
            {label}
          </label>
        )}

        <div className={cn('relative', label && 'mt-1')}>
          {leftIcon && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>{leftIcon}</div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant: currentVariant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
              {rightIcon}
            </div>
          )}
        </div>

        {displayMessage && (
          <p className={cn(helperTextVariants({ variant: messageVariant }))}>{displayMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { radioVariants, controlLabelVariants } from './checkbox-radio-variants';
import { helperTextVariants } from './input-variants';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helperText,
      errorMessage,
      successMessage,
      disabled,
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
        <div className='flex items-start gap-2'>
          <input
            ref={ref}
            type='radio'
            id={inputId}
            disabled={disabled}
            className={cn(
              radioVariants({ variant: currentVariant, size }),
              'mt-0.5', // Alineación vertical con el texto
              className
            )}
            {...props}
          />

          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                controlLabelVariants({
                  variant: currentVariant,
                  disabled: disabled,
                }),
                'flex-1'
              )}
            >
              {label}
            </label>
          )}
        </div>

        {displayMessage && (
          <p
            className={cn(
              helperTextVariants({ variant: messageVariant }),
              'ml-6' // Alineado con el texto del label
            )}
          >
            {displayMessage}
          </p>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio };

import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { checkboxVariants, controlLabelVariants } from './checkbox-radio-variants';
import { helperTextVariants } from './input-variants';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant,
      size,
      label,
      helperText,
      errorMessage,
      successMessage,
      indeterminate = false,
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

    // Ref interno para manejar indeterminate
    const internalRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => internalRef.current!);

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <div className='w-full'>
        <div className='flex items-start gap-2'>
          <input
            ref={internalRef}
            type='checkbox'
            id={inputId}
            disabled={disabled}
            className={cn(
              checkboxVariants({ variant: currentVariant, size }),
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

Checkbox.displayName = 'Checkbox';

export { Checkbox };

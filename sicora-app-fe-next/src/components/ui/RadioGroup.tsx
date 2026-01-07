import React from 'react';
import { cn } from '../../utils/cn';
import { Radio } from './Radio';
import { labelVariants, helperTextVariants } from './input-variants';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  helperText?: string;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  isRequired?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      options,
      onChange,
      label,
      helperText,
      errorMessage,
      successMessage,
      isRequired = false,
      disabled = false,
      orientation = 'vertical',
      variant,
      size,
      className,
      ...props
    },
    ref
  ) => {
    // Determinar el estado visual basado en los mensajes
    const currentVariant = errorMessage ? 'error' : successMessage ? 'success' : variant;
    const displayMessage = errorMessage || successMessage || helperText;
    const messageVariant = errorMessage ? 'error' : successMessage ? 'success' : 'default';

    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = (optionValue: string) => {
      if (value === undefined) {
        setInternalValue(optionValue);
      }
      onChange?.(optionValue);
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {label && (
          <div className='mb-3'>
            <span className={cn(labelVariants({ variant: currentVariant, required: isRequired }))}>
              {label}
            </span>
          </div>
        )}

        <div
          className={cn(
            'space-y-3',
            orientation === 'horizontal' && 'flex flex-wrap gap-6 space-y-0'
          )}
          role='radiogroup'
          aria-labelledby={label ? `${name}-label` : undefined}
          aria-required={isRequired}
        >
          {options.map((option) => (
            <Radio
              key={option.value}
              name={name}
              value={option.value}
              checked={currentValue === option.value}
              onChange={() => handleChange(option.value)}
              label={option.label}
              helperText={option.helperText}
              disabled={disabled || option.disabled}
              variant={currentVariant}
              size={size}
            />
          ))}
        </div>

        {displayMessage && (
          <p className={cn(helperTextVariants({ variant: messageVariant }), 'mt-3')}>
            {displayMessage}
          </p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export { RadioGroup };

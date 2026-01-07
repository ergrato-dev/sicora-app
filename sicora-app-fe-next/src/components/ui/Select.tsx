import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import {
  selectTriggerVariants,
  selectContentVariants,
  selectItemVariants,
} from './select-variants';
import { labelVariants, helperTextVariants } from './input-variants';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends VariantProps<typeof selectTriggerVariants> {
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  isRequired?: boolean;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

const Select = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, SelectProps>(
  (
    {
      label,
      placeholder = 'Selecciona una opción...',
      helperText,
      errorMessage,
      successMessage,
      isRequired = false,
      options,
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      variant,
      size,
      name,
      id,
      className,
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
    const selectId = id || generatedId;

    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(labelVariants({ variant: currentVariant, required: isRequired }))}
          >
            {label}
          </label>
        )}

        <SelectPrimitive.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          name={name}
        >
          <SelectPrimitive.Trigger
            ref={ref}
            id={selectId}
            className={cn(selectTriggerVariants({ variant: currentVariant, size }), className)}
            {...props}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon asChild>
              <svg
                className='h-4 w-4 opacity-50'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className={cn(selectContentVariants())}
              position='popper'
              sideOffset={4}
            >
              <SelectPrimitive.Viewport className='p-1'>
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(selectItemVariants())}
                  >
                    <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
                      <SelectPrimitive.ItemIndicator>
                        <svg
                          className='h-4 w-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>

        {displayMessage && (
          <p className={cn(helperTextVariants({ variant: messageVariant }), 'mt-1')}>
            {displayMessage}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };

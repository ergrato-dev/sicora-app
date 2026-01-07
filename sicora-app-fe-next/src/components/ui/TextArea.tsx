import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { textareaVariants } from './textarea-variants';
import { labelVariants, helperTextVariants } from './input-variants';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  isRequired?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      variant,
      size,
      resize,
      label,
      helperText,
      errorMessage,
      successMessage,
      isRequired = false,
      maxLength,
      showCharacterCount = false,
      value,
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

    // Calcular contador de caracteres
    const currentLength = value ? String(value).length : 0;
    const isNearLimit = maxLength && currentLength >= maxLength * 0.8;
    const isOverLimit = maxLength && currentLength > maxLength;

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
          <textarea
            ref={ref}
            id={inputId}
            maxLength={maxLength}
            className={cn(textareaVariants({ variant: currentVariant, size, resize }), className)}
            value={value}
            {...props}
          />
        </div>

        <div className='mt-1 flex justify-between items-start'>
          {displayMessage && (
            <p className={cn(helperTextVariants({ variant: messageVariant }), 'flex-1')}>
              {displayMessage}
            </p>
          )}

          {(showCharacterCount || maxLength) && (
            <span
              className={cn(
                'text-xs ml-2 flex-shrink-0',
                isOverLimit
                  ? 'text-red-600 font-medium'
                  : isNearLimit
                    ? 'text-amber-600'
                    : 'text-gray-500'
              )}
            >
              {currentLength}
              {maxLength && `/${maxLength}`}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea };

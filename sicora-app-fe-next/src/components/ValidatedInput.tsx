import { forwardRef, type InputHTMLAttributes, useState } from 'react';
import { useValidation } from '../hooks/useValidation';
import { cn } from '../utils/cn';
import type { ValidationPattern } from '../utils/validation';
import { SecureValidator } from '../utils/validation';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface ValidatedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'pattern'> {
  label: string;
  validationPattern: ValidationPattern;
  customMessage?: string;
  required?: boolean;
  onValidationChange?: (isValid: boolean, sanitizedValue?: string) => void;
  helperText?: string;
  showPasswordToggle?: boolean;
}

/**
 * ValidatedInput - Input con validación REGEXP integrada
 * Sigue las guías de seguridad SICORA para prevenir ataques
 */
export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      label,
      validationPattern,
      customMessage,
      onValidationChange,
      className,
      helperText,
      showPasswordToggle = false,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const { isValid, message, isValidating, validate } = useValidation({
      pattern: validationPattern,
      customMessage,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Determinar el tipo de input real
    const inputType =
      showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setHasInteracted(true);
      validate(value);

      // Callback para el componente padre
      if (onValidationChange) {
        const result = SecureValidator.validate(value, validationPattern, customMessage);
        onValidationChange(result.isValid, result.sanitizedValue);
      }

      // Llamar onChange original si existe
      props.onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setHasInteracted(true);
      props.onBlur?.(e);
    };

    // Estados visuales
    const showValidation = hasInteracted && !isValidating;
    const hasError = showValidation && !isValid;
    const hasSuccess = showValidation && isValid && props.value;

    return (
      <div className='space-y-2'>
        {/* Label */}
        <label className='block text-sm font-medium text-gray-700'>
          {label}
          {props.required && <span className='text-red-500 ml-1'>*</span>}
        </label>

        {/* Input container */}
        <div className='relative'>
          <input
            ref={ref}
            type={inputType}
            {...props}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              // Estilos base
              'w-full px-4 py-2 border rounded-lg transition-all duration-200',
              'focus:ring-2 focus:ring-sena-primary-500 focus:border-transparent',
              'placeholder:text-gray-400',

              // Estados de validación
              hasError && [
                'border-red-500 bg-red-50',
                'focus:ring-red-200 focus:border-red-500',
                'pr-10',
              ],
              hasSuccess && [
                'border-green-500 bg-green-50',
                'focus:ring-green-200 focus:border-green-500',
                'pr-10',
              ],
              !hasError && !hasSuccess && 'border-gray-300',

              // Loading state
              isValidating && 'border-yellow-300 bg-yellow-50 pr-10',

              // Password toggle spacing
              showPasswordToggle && 'pr-12',

              className
            )}
          />

          {/* Iconos de estado */}
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1'>
            {/* Loading spinner */}
            {isValidating && (
              <div className='animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full' />
            )}

            {/* Success icon */}
            {hasSuccess && <CheckCircleIcon className='h-4 w-4 text-green-500' />}

            {/* Error icon */}
            {hasError && <ExclamationTriangleIcon className='h-4 w-4 text-red-500' />}

            {/* Password toggle */}
            {showPasswordToggle && (
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='text-gray-400 hover:text-gray-600 focus:outline-none'
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className='h-4 w-4' />
                ) : (
                  <EyeIcon className='h-4 w-4' />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Helper text */}
        {helperText && !hasError && <p className='text-sm text-gray-600'>{helperText}</p>}

        {/* Error message */}
        {hasError && message && (
          <p className='text-sm text-red-600 flex items-center space-x-1'>
            <ExclamationTriangleIcon className='h-4 w-4 flex-shrink-0' />
            <span>{message}</span>
          </p>
        )}

        {/* Success message para campos específicos */}
        {hasSuccess && validationPattern === 'emailSena' && (
          <p className='text-sm text-green-600 flex items-center space-x-1'>
            <CheckCircleIcon className='h-4 w-4 flex-shrink-0' />
            <span>Email institucional válido</span>
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

import { useState, useCallback } from 'react';
import { SecureValidator } from '../utils/validation';
import type { ValidationPattern, ValidationResult } from '../utils/validation';

interface UseValidationProps {
  pattern: ValidationPattern;
  customMessage?: string;
  debounceMs?: number;
}

/**
 * Hook para validación en tiempo real con debounce
 * Integra validación segura con REGEXP patterns
 */
export function useValidation({ pattern, customMessage, debounceMs = 300 }: UseValidationProps) {
  const [validationState, setValidationState] = useState<ValidationResult>({
    isValid: true,
  });
  const [isValidating, setIsValidating] = useState(false);

  const validateValue = useCallback(
    (value: string) => {
      const debouncedValidate = debounce((val: string) => {
        setIsValidating(true);
        const result = SecureValidator.validate(val, pattern, customMessage);
        setValidationState(result);
        setIsValidating(false);
      }, debounceMs);

      debouncedValidate(value);
    },
    [pattern, customMessage, debounceMs]
  );

  const reset = useCallback(() => {
    setValidationState({ isValid: true });
    setIsValidating(false);
  }, []);

  return {
    ...validationState,
    isValidating,
    validate: validateValue,
    reset,
  };
}

/**
 * Hook para validación de formularios completos
 */
export function useFormValidation<T extends Record<string, string>>(
  validationRules: Record<keyof T, ValidationPattern>
) {
  const [formState, setFormState] = useState<Record<keyof T, ValidationResult>>(
    {} as Record<keyof T, ValidationResult>
  );
  const [isFormValid, setIsFormValid] = useState(false);

  const validateField = useCallback(
    (fieldName: keyof T, value: string) => {
      const pattern = validationRules[fieldName];
      const result = SecureValidator.validate(value, pattern);

      setFormState((prev) => {
        const newState = {
          ...prev,
          [fieldName]: result,
        };

        // Verificar si todo el formulario es válido
        const allValid = Object.values(newState).every((validation) => validation.isValid);
        setIsFormValid(allValid);

        return newState;
      });

      return result;
    },
    [validationRules]
  );

  const validateForm = useCallback(
    (formData: T) => {
      const results: Record<keyof T, ValidationResult> = {} as Record<keyof T, ValidationResult>;

      Object.entries(formData).forEach(([key, value]) => {
        const pattern = validationRules[key as keyof T];
        results[key as keyof T] = SecureValidator.validate(value as string, pattern);
      });

      setFormState(results);

      const allValid = Object.values(results).every((validation) => validation.isValid);
      setIsFormValid(allValid);

      return { results, isValid: allValid };
    },
    [validationRules]
  );

  const resetForm = useCallback(() => {
    setFormState({} as Record<keyof T, ValidationResult>);
    setIsFormValid(false);
  }, []);

  return {
    formState,
    isFormValid,
    validateField,
    validateForm,
    resetForm,
  };
}

// Utility function para debounce
function debounce(func: (value: string) => void, wait: number): (value: string) => void {
  let timeout: NodeJS.Timeout;
  return (value: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(value), wait);
  };
}

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useValidation, useFormValidation } from './useValidation';

describe('useValidation', () => {
  describe('initial state', () => {
    it('should start with isValid true', () => {
      const { result } = renderHook(() => useValidation({ pattern: 'email' }));
      expect(result.current.isValid).toBe(true);
    });

    it('should start with isValidating false', () => {
      const { result } = renderHook(() => useValidation({ pattern: 'email' }));
      expect(result.current.isValidating).toBe(false);
    });

    it('should not have an initial message', () => {
      const { result } = renderHook(() => useValidation({ pattern: 'email' }));
      expect(result.current.message).toBeUndefined();
    });
  });

  describe('validate function', () => {
    it('should expose validate function', () => {
      const { result } = renderHook(() => useValidation({ pattern: 'email' }));
      expect(typeof result.current.validate).toBe('function');
    });
  });

  describe('reset function', () => {
    it('should reset to initial valid state', () => {
      const { result } = renderHook(() => useValidation({ pattern: 'email' }));

      act(() => {
        result.current.reset();
      });

      expect(result.current.isValid).toBe(true);
      expect(result.current.isValidating).toBe(false);
    });
  });

  describe('pattern types', () => {
    it.each(['email', 'cedula', 'nombre', 'telefono', 'password', 'uuid'] as const)(
      'should accept pattern: %s',
      (pattern) => {
        const { result } = renderHook(() => useValidation({ pattern }));
        expect(result.current.isValid).toBe(true);
      }
    );
  });

  describe('debounceMs option', () => {
    it('should accept custom debounce value', () => {
      const { result } = renderHook(() => useValidation({ pattern: 'email', debounceMs: 500 }));
      expect(result.current.validate).toBeDefined();
    });
  });
});

describe('useFormValidation', () => {
  const validationRules = {
    email: 'email' as const,
    nombre: 'nombre' as const,
  };

  describe('initial state', () => {
    it('should start with empty formState', () => {
      const { result } = renderHook(() => useFormValidation(validationRules));
      expect(result.current.formState).toEqual({});
    });

    it('should start with isFormValid false', () => {
      const { result } = renderHook(() => useFormValidation(validationRules));
      expect(result.current.isFormValid).toBe(false);
    });
  });

  describe('validateField', () => {
    it('should validate individual field', () => {
      const { result } = renderHook(() => useFormValidation(validationRules));

      act(() => {
        result.current.validateField('email', 'test@example.com');
      });

      expect(result.current.formState.email?.isValid).toBe(true);
    });

    it('should return validation result', () => {
      const { result } = renderHook(() => useFormValidation(validationRules));

      let validationResult;
      act(() => {
        validationResult = result.current.validateField('email', 'invalid');
      });

      expect(validationResult).toHaveProperty('isValid', false);
    });
  });

  describe('validateForm', () => {
    it('should validate all fields at once', () => {
      const { result } = renderHook(() => useFormValidation(validationRules));

      act(() => {
        result.current.validateForm({
          email: 'test@example.com',
          nombre: 'Juan Carlos',
        });
      });

      // Check individual field validations
      expect(result.current.formState.email?.isValid).toBe(true);
      expect(result.current.formState.nombre?.isValid).toBe(true);
    });

    it('should set isFormValid to false if any field fails', () => {
      const { result } = renderHook(() => useFormValidation(validationRules));

      act(() => {
        result.current.validateForm({
          email: 'invalid-email',
          nombre: 'Juan Carlos',
        });
      });

      expect(result.current.formState.email?.isValid).toBe(false);
    });
  });

  describe('resetForm', () => {
    it('should clear all validation states', () => {
      const { result } = renderHook(() => useFormValidation(validationRules));

      act(() => {
        result.current.validateField('email', 'test@example.com');
        result.current.resetForm();
      });

      expect(result.current.formState).toEqual({});
      expect(result.current.isFormValid).toBe(false);
    });
  });
});

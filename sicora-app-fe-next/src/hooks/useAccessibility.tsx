'use client';

import { useState, useCallback, useEffect } from 'react';
import { LiveRegion } from '../components/ui/AccessibilityHelpers';
import type { DialogActionsProps } from '../components/ui/DialogActions';
import type { ButtonProps } from '../components/ui/Button';

/**
 * Hook useAnnouncer - Anunciador para mensajes dinámicos
 *
 * Permite anunciar mensajes a screen readers sin modificar el DOM visible.
 * Implementa WCAG 2.1 Criterio 4.1.3 - Status Messages
 *
 * @example
 * const { announce, Announcer } = useAnnouncer();
 *
 * const handleSave = async () => {
 *   await saveData();
 *   announce('Datos guardados correctamente');
 * };
 *
 * return (
 *   <>
 *     <Announcer />
 *     <button onClick={handleSave}>Guardar</button>
 *   </>
 * );
 *
 * @example
 * // Anuncio urgente
 * announce('Error: No se pudo guardar', 'assertive');
 */
export function useAnnouncer() {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>(
    'polite'
  );

  const announce = useCallback(
    (text: string, priority: 'polite' | 'assertive' = 'polite') => {
      // Limpiar mensaje primero para forzar re-anuncio
      setMessage('');
      setPoliteness(priority);
      // Establecer nuevo mensaje en siguiente tick
      requestAnimationFrame(() => {
        setMessage(text);
      });
    },
    []
  );

  const clear = useCallback(() => {
    setMessage('');
  }, []);

  const Announcer = useCallback(
    () => <LiveRegion politeness={politeness}>{message}</LiveRegion>,
    [message, politeness]
  );

  return { announce, clear, Announcer };
}

/**
 * Hook useFocusTrap - Atrapa el foco dentro de un elemento
 *
 * Útil para modales y diálogos para cumplir con WCAG 2.1.2 (No Keyboard Trap)
 * mientras se mantiene el foco dentro del componente modal.
 *
 * @example
 * const { containerRef } = useFocusTrap(isOpen);
 *
 * return (
 *   <div ref={containerRef} role="dialog">
 *     <button>Focusable 1</button>
 *     <button>Focusable 2</button>
 *   </div>
 * );
 */
export function useFocusTrap(enabled: boolean = true) {
  const containerRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node || !enabled) return;

      const focusableElements = node.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      node.addEventListener('keydown', handleKeyDown);

      // Enfocar primer elemento
      firstElement.focus();

      return () => {
        node.removeEventListener('keydown', handleKeyDown);
      };
    },
    [enabled]
  );

  return { containerRef };
}

/**
 * Hook useReducedMotion - Detecta preferencia de movimiento reducido
 *
 * Implementa WCAG 2.1 Criterio 2.3.3 - Animation from Interactions
 * Respeta la configuración de accesibilidad del sistema operativo.
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 *
 * const variants = {
 *   enter: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
 *   exit: prefersReducedMotion ? {} : { opacity: 0, y: -10 },
 * };
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Inicialización lazy para SSR
    if (globalThis.window !== undefined) {
      return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook useDialogActionsFromForm - Crea props de DialogActions desde form state
 *
 * @example
 * const actionProps = useDialogActionsFromForm({
 *   isSubmitting: formState.isSubmitting,
 *   isValid: formState.isValid,
 *   submitLabel: 'Crear Usuario',
 *   onSubmit: handleSubmit,
 *   onCancel: onClose,
 * });
 *
 * <DialogActions {...actionProps} />
 */
export function useDialogActionsFromForm({
  isSubmitting,
  isValid,
  submitLabel,
  cancelLabel = 'Cancelar',
  onSubmit,
  onCancel,
  variant = 'primary',
}: {
  isSubmitting: boolean;
  isValid: boolean;
  submitLabel: string;
  cancelLabel?: string;
  onSubmit: () => void;
  onCancel: () => void;
  variant?: ButtonProps['variant'];
}): DialogActionsProps {
  return {
    primaryLabel: submitLabel,
    secondaryLabel: cancelLabel,
    onPrimary: onSubmit,
    onSecondary: onCancel,
    primaryLoading: isSubmitting,
    primaryDisabled: !isValid || isSubmitting,
    primaryVariant: variant,
  };
}

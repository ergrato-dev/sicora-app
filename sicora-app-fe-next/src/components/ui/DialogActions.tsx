'use client';

import { cn } from '../../utils/cn';
import { Button, type ButtonProps } from './Button';

export interface DialogActionsProps {
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Texto del botón primario (acción principal) */
  primaryLabel: string;
  /** Texto del botón secundario (cancelar) */
  secondaryLabel?: string;
  /** Callback cuando se presiona el botón primario */
  onPrimary: () => void;
  /** Callback cuando se presiona el botón secundario */
  onSecondary?: () => void;
  /** Variante del botón primario */
  primaryVariant?: ButtonProps['variant'];
  /** Estado de carga del botón primario */
  primaryLoading?: boolean;
  /** Deshabilitar el botón primario */
  primaryDisabled?: boolean;
  /** Ocultar el botón secundario */
  hideSecondary?: boolean;
  /** Icono para el botón primario */
  primaryIcon?: React.ReactNode;
  /** ID para aria-describedby del botón primario */
  primaryDescribedBy?: string;
  /** Contenido adicional entre los botones */
  children?: React.ReactNode;
}

/**
 * DialogActions - Componente para acciones en modales/dialogs
 *
 * Implementa el patrón UX:
 * - Botón primario (CTA): A la DERECHA, mayor peso visual (filled)
 * - Botón secundario: A la IZQUIERDA, menor peso visual (outline)
 *
 * Cumple con WCAG 2.1:
 * - 2.4.7 Focus Visible
 * - 1.4.11 Non-text Contrast
 * - 1.4.3 Contrast Minimum
 *
 * @example
 * // Acciones estándar
 * <DialogActions
 *   secondaryLabel="Cancelar"
 *   primaryLabel="Guardar"
 *   onSecondary={onClose}
 *   onPrimary={handleSave}
 * />
 *
 * @example
 * // Confirmación de eliminación
 * <DialogActions
 *   secondaryLabel="No, mantener"
 *   primaryLabel="Sí, eliminar"
 *   primaryVariant="danger"
 *   onSecondary={onClose}
 *   onPrimary={handleDelete}
 * />
 *
 * @example
 * // Solo botón primario
 * <DialogActions
 *   primaryLabel="Aceptar"
 *   onPrimary={onClose}
 *   hideSecondary
 * />
 */
export function DialogActions({
  className,
  primaryLabel,
  secondaryLabel = 'Cancelar',
  onPrimary,
  onSecondary,
  primaryVariant = 'primary',
  primaryLoading = false,
  primaryDisabled = false,
  hideSecondary = false,
  primaryIcon,
  primaryDescribedBy,
  children,
}: DialogActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3',
        className
      )}
      role="group"
      aria-label="Acciones del diálogo">
      {/* Botón Secundario - IZQUIERDA (outline, menor peso visual) */}
      {!hideSecondary && onSecondary && (
        <Button
          variant="outline"
          onClick={onSecondary}
          type="button">
          {secondaryLabel}
        </Button>
      )}

      {/* Contenido adicional entre botones */}
      {children}

      {/* Botón Primario - DERECHA (filled, mayor peso visual) */}
      <Button
        variant={primaryVariant}
        onClick={onPrimary}
        loading={primaryLoading}
        disabled={primaryDisabled}
        rightIcon={primaryIcon}
        aria-describedby={primaryDescribedBy}
        type="button">
        {primaryLabel}
      </Button>
    </div>
  );
}

export default DialogActions;

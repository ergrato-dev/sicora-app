import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

/**
 * ButtonGroup - Componente para agrupar botones siguiendo patrones SENA
 *
 * Patrones institucionales:
 * - Botón primario siempre a la derecha
 * - Botones secundarios/terciarios a la izquierda
 * - Espaciado consistente según design tokens
 * - Responsive en dispositivos móviles
 */
export function ButtonGroup({
  children,
  className,
  orientation = 'horizontal',
  spacing = 'md',
  align = 'start',
  wrap = false,
}: ButtonGroupProps) {
  const spacingClasses = {
    none: 'gap-0',
    sm: 'gap-sena-spacing-xs',
    md: 'gap-sena-spacing-sm',
    lg: 'gap-sena-spacing-md',
  };

  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const baseClasses = cn(
    'flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    spacingClasses[spacing],
    alignClasses[align],
    wrap && 'flex-wrap',
    className
  );

  return (
    <div className={baseClasses} role='group'>
      {children}
    </div>
  );
}

/**
 * ButtonGroupStandard - Patrón estándar SENA para formularios
 * Botones de cancelar/secundarios a la izquierda, primario a la derecha
 */
interface ButtonGroupStandardProps {
  primaryButton: React.ReactNode;
  secondaryButtons?: React.ReactNode;
  className?: string;
}

export function ButtonGroupStandard({
  primaryButton,
  secondaryButtons,
  className,
}: ButtonGroupStandardProps) {
  return (
    <ButtonGroup align='between' className={cn('mt-sena-spacing-lg', className)}>
      <div className='flex gap-sena-spacing-sm'>{secondaryButtons}</div>
      <div>{primaryButton}</div>
    </ButtonGroup>
  );
}

/**
 * ButtonGroupActions - Para acciones en listas/tablas
 * Todos los botones alineados a la derecha
 */
interface ButtonGroupActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroupActions({ children, className }: ButtonGroupActionsProps) {
  return (
    <ButtonGroup align='end' spacing='sm' className={className}>
      {children}
    </ButtonGroup>
  );
}

/**
 * ButtonGroupToolbar - Para barras de herramientas
 * Botones agrupados con espaciado mínimo
 */
interface ButtonGroupToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroupToolbar({ children, className }: ButtonGroupToolbarProps) {
  return (
    <ButtonGroup
      spacing='none'
      className={cn(
        'border border-gray-200 rounded-lg overflow-hidden divide-x divide-gray-200',
        className
      )}
    >
      {children}
    </ButtonGroup>
  );
}

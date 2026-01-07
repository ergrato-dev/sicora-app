import React from 'react';
import { getSenaLogo } from '../constants/assets';
import { cn } from '../utils/cn';

interface LogoSenaProps {
  /**
   * Variante del logo según manual de identidad SENA
   * - primary: Verde principal (uso preferente)
   * - complementary: Verde complementario
   * - black: Negro (fondos claros/monocromático)
   */
  variant?: 'primary' | 'complementary' | 'black';

  /**
   * Tamaño del logo
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Clases CSS adicionales
   */
  className?: string;

  /**
   * Texto alternativo para accesibilidad
   */
  alt?: string;

  /**
   * Si se puede hacer clic (para navegación)
   */
  clickable?: boolean;

  /**
   * Función onClick si es clickable
   */
  onClick?: () => void;
}

/**
 * Componente LogoSena - Manual de Identidad SENA 2024
 *
 * Implementa los logos oficiales del SENA siguiendo
 * las especificaciones del manual de identidad corporativa:
 *
 * - Respeta proporciones oficiales
 * - Usa versiones correctas según contexto
 * - Mantiene legibilidad en todos los tamaños
 * - Cumple estándares de accesibilidad
 */
export const LogoSena: React.FC<LogoSenaProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  alt = 'OneVision - OneVision Open Source',
  clickable = false,
  onClick,
}) => {
  const logoSrc = getSenaLogo(variant);

  // Tamaños según manual de identidad (mantiene proporciones)
  const sizeClasses = {
    sm: 'h-8 w-auto', // 32px altura
    md: 'h-12 w-auto', // 48px altura
    lg: 'h-16 w-auto', // 64px altura
    xl: 'h-24 w-auto', // 96px altura
  };

  const baseClasses = cn(
    'object-contain', // Mantiene proporciones
    sizeClasses[size],
    clickable && 'cursor-pointer hover:opacity-80 transition-opacity duration-200',
    className
  );

  const logoElement = (
    <img
      src={logoSrc}
      alt={alt}
      className={baseClasses}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : 'img'}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    />
  );

  return logoElement;
};

// Componente especializado para header/navegación
export const LogoSenaNav: React.FC<{
  size?: 'sm' | 'md';
  onClick?: () => void;
}> = ({ size = 'md', onClick }) => {
  return (
    <LogoSena
      variant='primary'
      size={size}
      clickable={!!onClick}
      onClick={onClick}
      className='select-none'
      alt='SENA - Ir al inicio'
    />
  );
};

// Componente para footer
export const LogoSenaFooter: React.FC<{
  variant?: 'primary' | 'black';
}> = ({ variant = 'primary' }) => {
  return (
    <LogoSena
      variant={variant}
      size='sm'
      className='opacity-90'
      alt='OneVision - OneVision Open Source'
    />
  );
};

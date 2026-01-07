import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * Componente Button con diseño SENA 2024
 *
 * Implementa:
 * - Variantes según la identidad SENA
 * - Tamaños responsivos
 * - Estados de accesibilidad completos
 * - Transiciones suaves
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-md
    transition-colors duration-150 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none
  `;

    const variantClasses = {
      primary: `
      bg-green-600 text-white hover:bg-green-700 
      focus:ring-green-500 active:bg-green-800
    `,
      secondary: `
      bg-orange-500 text-white hover:bg-orange-600 
      focus:ring-orange-500 active:bg-orange-700
    `,
      outline: `
      border border-green-600 text-green-600 hover:bg-green-50 
      focus:ring-green-500 active:bg-green-100
    `,
      ghost: `
      text-green-600 hover:bg-green-50 
      focus:ring-green-500 active:bg-green-100
    `,
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const allClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `
      .replace(/\s+/g, ' ')
      .trim();

    return (
      <button ref={ref} className={allClasses} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

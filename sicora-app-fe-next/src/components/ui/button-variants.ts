import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Botones principales SENA
        primary: 'bg-sena-primary hover:bg-sena-primary/90 text-white',
        secondary: 'bg-sena-secondary hover:bg-sena-secondary/90 text-white',
        tertiary: 'bg-sena-tertiary hover:bg-sena-tertiary/90 text-white',

        // Botones de contexto
        success: 'bg-green-600 hover:bg-green-700 text-white',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',

        // Botones de interfaz
        outline:
          'border border-sena-primary text-sena-primary hover:bg-sena-primary hover:text-white',
        ghost: 'hover:bg-sena-light text-sena-primary',
        link: 'text-sena-primary underline-offset-4 hover:underline',

        // Botones neutros
        default: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
        muted: 'bg-gray-50 hover:bg-gray-100 text-gray-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3',
        lg: 'h-12 rounded-md px-8',
        xl: 'h-14 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

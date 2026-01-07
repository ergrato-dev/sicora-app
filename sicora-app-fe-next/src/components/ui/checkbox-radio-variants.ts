import { cva } from 'class-variance-authority';

export const checkboxVariants = cva(
  'h-4 w-4 rounded border-2 bg-white text-sena-primary focus:ring-2 focus:ring-sena-primary/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-sena-primary',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      },
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const radioVariants = cva(
  'h-4 w-4 border-2 bg-white text-sena-primary focus:ring-2 focus:ring-sena-primary/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-sena-primary',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      },
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const controlLabelVariants = cva(
  'text-sm font-medium leading-none cursor-pointer select-none',
  {
    variants: {
      variant: {
        default: 'text-gray-900',
        error: 'text-red-600',
        success: 'text-green-600',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      disabled: false,
    },
  }
);

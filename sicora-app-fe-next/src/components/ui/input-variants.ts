import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:border-sena-primary focus:outline-none focus:ring-2 focus:ring-sena-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-sena-primary focus:ring-sena-primary/20',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const labelVariants = cva('block text-sm font-medium leading-6', {
  variants: {
    variant: {
      default: 'text-gray-900',
      error: 'text-red-600',
      success: 'text-green-600',
    },
    required: {
      true: "after:content-['*'] after:ml-1 after:text-red-500",
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    required: false,
  },
});

export const helperTextVariants = cva('mt-1 text-xs', {
  variants: {
    variant: {
      default: 'text-gray-600',
      error: 'text-red-600',
      success: 'text-green-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

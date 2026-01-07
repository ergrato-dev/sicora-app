import { cva } from 'class-variance-authority';

export const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 text-gray-900 [&>svg]:text-gray-600',
        success: 'bg-green-50 border-green-200 text-green-800 [&>svg]:text-green-600',
        warning: 'bg-amber-50 border-amber-200 text-amber-800 [&>svg]:text-amber-600',
        danger: 'bg-red-50 border-red-200 text-red-800 [&>svg]:text-red-600',
        info: 'bg-blue-50 border-blue-200 text-blue-800 [&>svg]:text-blue-600',
        primary: 'bg-sena-light border-sena-primary/20 text-sena-primary [&>svg]:text-sena-primary',
      },
      size: {
        sm: 'p-3 text-sm',
        default: 'p-4 text-sm',
        lg: 'p-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const alertTitleVariants = cva('mb-1 font-medium leading-none tracking-tight', {
  variants: {
    size: {
      sm: 'text-sm',
      default: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const alertDescriptionVariants = cva('text-sm opacity-90', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

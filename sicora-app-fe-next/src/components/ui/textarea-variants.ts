import { cva } from 'class-variance-authority';

export const textareaVariants = cva(
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:border-sena-primary focus:outline-none focus:ring-2 focus:ring-sena-primary/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-sena-primary focus:ring-sena-primary/20',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
      },
      size: {
        sm: 'min-h-[80px] px-2 py-1.5 text-xs',
        default: 'min-h-[100px] px-3 py-2 text-sm',
        lg: 'min-h-[120px] px-4 py-3 text-base',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      resize: 'vertical',
    },
  }
);

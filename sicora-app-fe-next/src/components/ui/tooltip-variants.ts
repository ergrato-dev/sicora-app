import { cva } from 'class-variance-authority';

export const tooltipContentVariants = cva(
  'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-white border-gray-700',
        light: 'bg-white text-gray-900 border-gray-200 shadow-lg',
        primary: 'bg-sena-primary-600 text-white border-sena-primary-500',
        secondary: 'bg-sena-secondary-600 text-white border-sena-secondary-500',
        success: 'bg-green-600 text-white border-green-500',
        warning: 'bg-yellow-600 text-white border-yellow-500',
        danger: 'bg-red-600 text-white border-red-500',
        info: 'bg-blue-600 text-white border-blue-500',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        default: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const tooltipArrowVariants = cva('', {
  variants: {
    variant: {
      default: 'fill-gray-900',
      light: 'fill-white',
      primary: 'fill-sena-primary-600',
      secondary: 'fill-sena-secondary-600',
      success: 'fill-green-600',
      warning: 'fill-yellow-600',
      danger: 'fill-red-600',
      info: 'fill-blue-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const tooltipTriggerVariants = cva('cursor-help', {
  variants: {
    underline: {
      true: 'border-b border-dashed border-gray-400 hover:border-gray-600',
      false: '',
    },
    disabled: {
      true: 'cursor-not-allowed opacity-50',
      false: '',
    },
  },
  defaultVariants: {
    underline: false,
    disabled: false,
  },
});

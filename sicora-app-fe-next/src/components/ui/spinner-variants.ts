import { cva } from 'class-variance-authority';

export const spinnerVariants = cva('animate-spin rounded-full border-solid', {
  variants: {
    size: {
      xs: 'h-3 w-3 border-[1.5px]',
      sm: 'h-4 w-4 border-[1.5px]',
      default: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-2',
      xl: 'h-10 w-10 border-[3px]',
      '2xl': 'h-12 w-12 border-[3px]',
    },
    variant: {
      default: 'border-gray-300 border-t-sena-primary-500',
      primary: 'border-sena-primary-200 border-t-sena-primary-600',
      secondary: 'border-sena-secondary-200 border-t-sena-secondary-600',
      white: 'border-gray-200 border-t-white',
      dark: 'border-gray-600 border-t-gray-900',
    },
    speed: {
      slow: 'animate-spin-slow',
      default: 'animate-spin',
      fast: 'animate-spin-fast',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
    speed: 'default',
  },
});

export const progressSpinnerVariants = cva('relative inline-flex items-center justify-center', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-10 w-10',
      '2xl': 'h-12 w-12',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const pulseSpinnerVariants = cva('rounded-full animate-pulse', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-10 w-10',
      '2xl': 'h-12 w-12',
    },
    variant: {
      default: 'bg-gray-400',
      primary: 'bg-sena-primary-500',
      secondary: 'bg-sena-secondary-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

export const dotsSpinnerVariants = cva('inline-flex space-x-1', {
  variants: {
    size: {
      xs: 'space-x-0.5',
      sm: 'space-x-0.5',
      default: 'space-x-1',
      lg: 'space-x-1',
      xl: 'space-x-1.5',
      '2xl': 'space-x-2',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const dotVariants = cva('rounded-full animate-bounce', {
  variants: {
    size: {
      xs: 'h-1 w-1',
      sm: 'h-1.5 w-1.5',
      default: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
      xl: 'h-3 w-3',
      '2xl': 'h-3.5 w-3.5',
    },
    variant: {
      default: 'bg-gray-400',
      primary: 'bg-sena-primary-500',
      secondary: 'bg-sena-secondary-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

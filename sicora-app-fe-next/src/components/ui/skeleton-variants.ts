import { cva } from 'class-variance-authority';

export const skeletonVariants = cva('animate-pulse rounded bg-gray-200', {
  variants: {
    variant: {
      default: 'bg-gray-200',
      light: 'bg-gray-100',
      dark: 'bg-gray-300',
      shimmer:
        'bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-shimmer',
    },
    shape: {
      rectangle: 'rounded',
      circle: 'rounded-full',
      rounded: 'rounded-lg',
      pill: 'rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
    shape: 'rectangle',
  },
});

export const skeletonTextVariants = cva('h-4 bg-gray-200 rounded animate-pulse', {
  variants: {
    size: {
      xs: 'h-2',
      sm: 'h-3',
      default: 'h-4',
      lg: 'h-5',
      xl: 'h-6',
    },
    width: {
      xs: 'w-1/4',
      sm: 'w-1/3',
      default: 'w-1/2',
      lg: 'w-2/3',
      xl: 'w-3/4',
      full: 'w-full',
    },
  },
  defaultVariants: {
    size: 'default',
    width: 'default',
  },
});

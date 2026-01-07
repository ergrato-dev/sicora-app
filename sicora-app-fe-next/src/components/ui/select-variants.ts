import { cva } from 'class-variance-authority';

export const selectVariants = cva(
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:border-sena-primary focus:outline-none focus:ring-2 focus:ring-sena-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
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

export const selectTriggerVariants = cva(
  'flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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

export const selectContentVariants = cva(
  'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-950 shadow-md animate-in fade-in-80',
  {
    variants: {
      position: {
        popper:
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        'item-aligned': '',
      },
    },
    defaultVariants: {
      position: 'popper',
    },
  }
);

export const selectItemVariants = cva(
  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-sena-light focus:text-sena-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-gray-100',
        destructive: 'hover:bg-red-100 focus:bg-red-100 focus:text-red-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

import { cva } from 'class-variance-authority';

export const dropdownMenuContentVariants = cva(
  'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 shadow-lg',
        dark: 'bg-gray-800 border-gray-700 text-white',
        primary: 'bg-sena-primary-50 border-sena-primary-200',
        secondary: 'bg-sena-secondary-50 border-sena-secondary-200',
      },
      size: {
        sm: 'min-w-[6rem] text-xs',
        default: 'min-w-[8rem] text-sm',
        lg: 'min-w-[12rem] text-base',
        xl: 'min-w-[16rem] text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const dropdownMenuItemVariants = cva(
  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-gray-100 focus:bg-gray-100',
        destructive:
          'text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700',
        success: 'text-green-600 hover:bg-green-50 focus:bg-green-50',
        warning: 'text-yellow-600 hover:bg-yellow-50 focus:bg-yellow-50',
        primary: 'text-sena-primary-600 hover:bg-sena-primary-50 focus:bg-sena-primary-50',
        secondary: 'text-sena-secondary-600 hover:bg-sena-secondary-50 focus:bg-sena-secondary-50',
      },
      size: {
        sm: 'px-1.5 py-1 text-xs',
        default: 'px-2 py-1.5 text-sm',
        lg: 'px-3 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const dropdownMenuLabelVariants = cva('px-2 py-1.5 text-sm font-semibold text-gray-900', {
  variants: {
    size: {
      sm: 'px-1.5 py-1 text-xs',
      default: 'px-2 py-1.5 text-sm',
      lg: 'px-3 py-2 text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const dropdownMenuSeparatorVariants = cva('-mx-1 my-1 h-px bg-muted', {
  variants: {
    variant: {
      default: 'bg-gray-200',
      dark: 'bg-gray-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const dropdownMenuShortcutVariants = cva('ml-auto text-xs tracking-widest opacity-60', {
  variants: {
    variant: {
      default: 'text-gray-500',
      dark: 'text-gray-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const dropdownMenuTriggerVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-white hover:bg-gray-50 border border-gray-300',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        primary: 'bg-sena-primary-500 text-white hover:bg-sena-primary-600',
        secondary: 'bg-sena-secondary-500 text-white hover:bg-sena-secondary-600',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-9 px-3',
        lg: 'h-10 px-4',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

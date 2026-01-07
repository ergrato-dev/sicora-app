import { cva } from 'class-variance-authority';

export const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-white text-gray-900',
        success: 'border-green-200 bg-green-50 text-green-900',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        danger: 'border-red-200 bg-red-50 text-red-900',
        info: 'border-blue-200 bg-blue-50 text-blue-900',
        primary: 'border-sena-primary/20 bg-sena-primary/10 text-sena-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const toastActionVariants = cva(
  'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
  {
    variants: {
      variant: {
        default: 'border-gray-200 hover:bg-gray-50',
        success: 'border-green-300 text-green-700 hover:bg-green-100',
        warning: 'border-amber-300 text-amber-700 hover:bg-amber-100',
        danger: 'border-red-300 text-red-700 hover:bg-red-100',
        info: 'border-blue-300 text-blue-700 hover:bg-blue-100',
        primary: 'border-sena-primary text-sena-primary hover:bg-sena-primary/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const toastCloseVariants = cva(
  'absolute right-1 top-1 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100',
  {
    variants: {
      variant: {
        default: 'text-gray-400 hover:text-gray-900',
        success: 'text-green-400 hover:text-green-700',
        warning: 'text-amber-400 hover:text-amber-700',
        danger: 'text-red-400 hover:text-red-700',
        info: 'text-blue-400 hover:text-blue-700',
        primary: 'text-sena-primary/60 hover:text-sena-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const toastTitleVariants = cva('text-sm font-semibold', {
  variants: {
    variant: {
      default: 'text-gray-900',
      success: 'text-green-900',
      warning: 'text-amber-900',
      danger: 'text-red-900',
      info: 'text-blue-900',
      primary: 'text-sena-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const toastDescriptionVariants = cva('text-sm opacity-90', {
  variants: {
    variant: {
      default: 'text-gray-600',
      success: 'text-green-700',
      warning: 'text-amber-700',
      danger: 'text-red-700',
      info: 'text-blue-700',
      primary: 'text-sena-primary/80',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

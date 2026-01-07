import { cva } from 'class-variance-authority';

export const dialogOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  {
    variants: {
      blur: {
        none: '',
        sm: 'backdrop-blur-sm',
        default: 'backdrop-blur',
        lg: 'backdrop-blur-lg',
      },
    },
    defaultVariants: {
      blur: 'default',
    },
  }
);

export const dialogContentVariants = cva(
  'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        default: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
      },
      variant: {
        default: 'border-gray-200',
        destructive: 'border-red-200 bg-red-50',
        success: 'border-green-200 bg-green-50',
        warning: 'border-amber-200 bg-amber-50',
        info: 'border-blue-200 bg-blue-50',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export const dialogHeaderVariants = cva('flex flex-col space-y-1.5 text-center sm:text-left', {
  variants: {
    variant: {
      default: '',
      destructive: 'text-red-900',
      success: 'text-green-900',
      warning: 'text-amber-900',
      info: 'text-blue-900',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const dialogTitleVariants = cva('text-lg font-semibold leading-none tracking-tight', {
  variants: {
    variant: {
      default: 'text-gray-900',
      destructive: 'text-red-900',
      success: 'text-green-900',
      warning: 'text-amber-900',
      info: 'text-blue-900',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const dialogDescriptionVariants = cva('text-sm text-gray-600', {
  variants: {
    variant: {
      default: 'text-gray-600',
      destructive: 'text-red-700',
      success: 'text-green-700',
      warning: 'text-amber-700',
      info: 'text-blue-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const dialogFooterVariants = cva(
  'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
  {
    variants: {
      alignment: {
        left: 'sm:justify-start',
        center: 'sm:justify-center',
        right: 'sm:justify-end',
        between: 'sm:justify-between',
      },
    },
    defaultVariants: {
      alignment: 'right',
    },
  }
);

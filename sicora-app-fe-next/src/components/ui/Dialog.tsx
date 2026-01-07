import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import {
  dialogOverlayVariants,
  dialogContentVariants,
  dialogHeaderVariants,
  dialogTitleVariants,
  dialogDescriptionVariants,
  dialogFooterVariants,
} from './dialog-variants';

// Dialog Root
const Dialog = DialogPrimitive.Root;

// Dialog Trigger
const DialogTrigger = DialogPrimitive.Trigger;

// Dialog Portal
const DialogPortal = DialogPrimitive.Portal;

// Dialog Close
const DialogClose = DialogPrimitive.Close;

// Dialog Overlay
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
    VariantProps<typeof dialogOverlayVariants>
>(({ className, blur, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(dialogOverlayVariants({ blur }), className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Dialog Content
export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  showCloseButton?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, size, variant, showCloseButton = true, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogContentVariants({ size, variant }), className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'>
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
          <span className='sr-only'>Cerrar</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Dialog Header
const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof dialogHeaderVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(dialogHeaderVariants({ variant }), className)} {...props} />
));
DialogHeader.displayName = 'DialogHeader';

// Dialog Footer
const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof dialogFooterVariants>
>(({ className, alignment, ...props }, ref) => (
  <div ref={ref} className={cn(dialogFooterVariants({ alignment }), className)} {...props} />
));
DialogFooter.displayName = 'DialogFooter';

// Dialog Title
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> &
    VariantProps<typeof dialogTitleVariants>
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(dialogTitleVariants({ variant }), className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Dialog Description
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> &
    VariantProps<typeof dialogDescriptionVariants>
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(dialogDescriptionVariants({ variant }), className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

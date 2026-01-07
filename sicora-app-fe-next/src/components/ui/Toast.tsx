import React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import {
  toastVariants,
  toastActionVariants,
  toastCloseVariants,
  toastTitleVariants,
  toastDescriptionVariants,
} from './toast-variants';

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action> &
    VariantProps<typeof toastActionVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(toastActionVariants({ variant }), className)}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close> &
    VariantProps<typeof toastCloseVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(toastCloseVariants({ variant }), className)}
    toast-close=''
    {...props}
  >
    <svg
      className='h-4 w-4'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
    </svg>
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title> &
    VariantProps<typeof toastTitleVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn(toastTitleVariants({ variant }), className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description> &
    VariantProps<typeof toastDescriptionVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn(toastDescriptionVariants({ variant }), className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};

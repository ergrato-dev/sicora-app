import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import {
  tooltipContentVariants,
  tooltipArrowVariants,
  tooltipTriggerVariants,
} from './tooltip-variants';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> &
    VariantProps<typeof tooltipTriggerVariants>
>(({ className, underline, disabled, ...props }, ref) => (
  <TooltipPrimitive.Trigger
    ref={ref}
    className={cn(tooltipTriggerVariants({ underline, disabled }), className)}
    {...props}
  />
));
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> &
    VariantProps<typeof tooltipContentVariants> & {
      showArrow?: boolean;
    }
>(({ className, variant, size, showArrow = true, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(tooltipContentVariants({ variant, size }), className)}
    {...props}
  >
    {props.children}
    {showArrow && (
      <TooltipPrimitive.Arrow className={cn(tooltipArrowVariants({ variant }), 'h-2 w-2')} />
    )}
  </TooltipPrimitive.Content>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Simple Tooltip Component for common use cases
export interface SimpleTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: VariantProps<typeof tooltipContentVariants>['variant'];
  size?: VariantProps<typeof tooltipContentVariants>['size'];
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  showArrow?: boolean;
  delayDuration?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  content,
  children,
  variant = 'default',
  size = 'default',
  side = 'top',
  align = 'center',
  showArrow = true,
  delayDuration = 200,
  disabled = false,
  className,
  contentClassName,
}) => {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          variant={variant}
          size={size}
          showArrow={showArrow}
          className={contentClassName}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Icon Tooltip for icons with explanations
export interface IconTooltipProps extends Omit<SimpleTooltipProps, 'children'> {
  icon: React.ReactNode;
  label: string;
}

const IconTooltip: React.FC<IconTooltipProps> = ({ icon, label, content, ...props }) => {
  return (
    <SimpleTooltip content={content || label} {...props}>
      <span
        className='inline-flex items-center justify-center cursor-help'
        role='img'
        aria-label={label}
      >
        {icon}
      </span>
    </SimpleTooltip>
  );
};

// Help Tooltip for form fields
export interface HelpTooltipProps extends Omit<SimpleTooltipProps, 'children'> {
  helpText: string;
  size?: 'sm' | 'default' | 'lg';
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  helpText,
  content,
  size = 'sm',
  variant = 'light',
  ...props
}) => {
  return (
    <SimpleTooltip content={content || helpText} variant={variant} size={size} {...props}>
      <span className='inline-flex items-center justify-center w-4 h-4 ml-1 text-gray-400 hover:text-gray-600 cursor-help'>
        <svg
          className='w-3 h-3'
          fill='currentColor'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            fillRule='evenodd'
            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z'
            clipRule='evenodd'
          />
        </svg>
      </span>
    </SimpleTooltip>
  );
};

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
  IconTooltip,
  HelpTooltip,
};

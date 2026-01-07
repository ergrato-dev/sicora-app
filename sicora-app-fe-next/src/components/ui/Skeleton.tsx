import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { skeletonVariants, skeletonTextVariants } from './skeleton-variants';

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, shape, width, height, style, ...props }, ref) => {
    const inlineStyles = {
      ...style,
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    };

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, shape }), className)}
        style={inlineStyles}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

// Skeleton Text Component
export interface SkeletonTextProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonTextVariants> {
  lines?: number;
  spacing?: 'tight' | 'normal' | 'loose';
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className, size, width, lines = 1, spacing = 'normal', ...props }, ref) => {
    const spacingClasses = {
      tight: 'space-y-1',
      normal: 'space-y-2',
      loose: 'space-y-3',
    };

    if (lines === 1) {
      return (
        <div
          ref={ref}
          className={cn(skeletonTextVariants({ size, width }), className)}
          {...props}
        />
      );
    }

    return (
      <div ref={ref} className={cn('w-full', spacingClasses[spacing])} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              skeletonTextVariants({
                size,
                width: index === lines - 1 && lines > 1 ? 'lg' : width,
              }),
              className
            )}
          />
        ))}
      </div>
    );
  }
);
SkeletonText.displayName = 'SkeletonText';

// Skeleton Card Component
export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
  imageHeight?: string | number;
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  (
    { className, showAvatar = false, showImage = false, lines = 3, imageHeight = 200, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('w-full p-4 border border-gray-200 rounded-lg space-y-4', className)}
        {...props}
      >
        {showImage && <Skeleton width='100%' height={imageHeight} shape='rounded' />}

        <div className='space-y-3'>
          {showAvatar && (
            <div className='flex items-center space-x-3'>
              <Skeleton shape='circle' width={40} height={40} />
              <div className='space-y-2 flex-1'>
                <SkeletonText size='sm' width='sm' />
                <SkeletonText size='xs' width='xs' />
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <SkeletonText size='lg' width='xl' />
            <SkeletonText lines={lines} spacing='normal' />
          </div>
        </div>
      </div>
    );
  }
);
SkeletonCard.displayName = 'SkeletonCard';

// Skeleton Table Component
export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ className, rows = 5, columns = 4, showHeader = true, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('w-full space-y-2', className)} {...props}>
        {showHeader && (
          <div className='grid gap-4' style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <SkeletonText key={`header-${index}`} size='sm' width='lg' />
            ))}
          </div>
        )}

        <div className='space-y-3'>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className='grid gap-4'
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <SkeletonText
                  key={`cell-${rowIndex}-${colIndex}`}
                  size='default'
                  width={colIndex === 0 ? 'lg' : 'default'}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
SkeletonTable.displayName = 'SkeletonTable';

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable };

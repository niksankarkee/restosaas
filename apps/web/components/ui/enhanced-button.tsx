'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg',
        destructive:
          'bg-error text-white hover:bg-error/90 shadow-md hover:shadow-lg',
        outline:
          'border border-neutral-300 bg-background hover:bg-neutral-50 hover:text-accent-foreground shadow-sm hover:shadow-md',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg',
        ghost: 'hover:bg-neutral-100 hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        accent:
          'bg-accent text-accent-foreground hover:bg-accent-hover shadow-md hover:shadow-lg',
        success:
          'bg-success text-white hover:bg-success/90 shadow-md hover:shadow-lg',
        warning:
          'bg-warning text-white hover:bg-warning/90 shadow-md hover:shadow-lg',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8 text-base',
        xl: 'h-12 rounded-lg px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const buttonContent = (
      <>
        {loading && (
          <svg
            className='mr-2 h-4 w-4 animate-spin'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        )}
        {!loading && leftIcon && <span className='mr-2'>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className='ml-2'>{rightIcon}</span>}
      </>
    );

    if (asChild) {
      // When asChild is true, clone the child element and apply button styles
      return React.cloneElement(
        children as React.ReactElement,
        {
          ...props,
          className: cn(
            buttonVariants({ variant, size, className }),
            ((children as React.ReactElement).props as any)?.className
          ),
          disabled: disabled || loading,
        } as any
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, buttonVariants };

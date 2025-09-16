'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

const selectVariants = cva(
  'flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus:border-primary',
        error: 'border-error focus:border-error focus:ring-error',
        success: 'border-success focus:border-success focus:ring-success',
        warning: 'border-warning focus:border-warning focus:ring-warning',
      },
      size: {
        default: 'h-10 px-3 py-2',
        sm: 'h-9 px-2 py-1 text-sm',
        lg: 'h-11 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface EnhancedSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  leftIcon?: React.ReactNode;
}

const EnhancedSelect = forwardRef<HTMLSelectElement, EnhancedSelectProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      placeholder,
      options,
      required,
      leftIcon,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const selectVariant = hasError ? 'error' : variant;

    return (
      <div className='space-y-2'>
        {label && (
          <label
            htmlFor={selectId}
            className='text-sm font-medium text-neutral-700 flex items-center gap-1'
          >
            {label}
            {required && <span className='text-error'>*</span>}
          </label>
        )}
        <div className='relative'>
          {leftIcon && (
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 z-10'>
              {leftIcon}
            </div>
          )}
          <select
            id={selectId}
            className={cn(
              selectVariants({ variant: selectVariant, size, className }),
              leftIcon && 'pl-10',
              'appearance-none pr-8'
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value='' disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
            <ChevronDown className='h-4 w-4 text-neutral-500' />
          </div>
        </div>
        {error && (
          <p className='text-sm text-error flex items-center gap-1'>
            <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                clipRule='evenodd'
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className='text-sm text-neutral-500'>{helperText}</p>
        )}
      </div>
    );
  }
);

EnhancedSelect.displayName = 'EnhancedSelect';

export { EnhancedSelect, selectVariants };

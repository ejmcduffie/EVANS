import React, { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizes: Record<string, string> = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    return (
      <input
        ref={ref}
        className={clsx(
          'block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50',
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

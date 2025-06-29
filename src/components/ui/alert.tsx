import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export const Alert: React.FC<AlertProps> = ({ variant = 'default', className, ...props }) => (
  <div
    {...props}
    className={clsx(
      'flex items-start gap-2 rounded-md border p-4 text-sm',
      variant === 'destructive'
        ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
        : 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
      className,
    )}
  />
);

export const AlertTitle: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p {...props} className={clsx('font-medium', className)} />
);

export const AlertDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p {...props} className={clsx('text-muted-foreground', className)} />
);
